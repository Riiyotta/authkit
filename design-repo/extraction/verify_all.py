#!/usr/bin/env python3
"""One-shot verification for the AuthKit design-repo.

Checks, all drift-proofed (re-derived from disk on every run, never read back
from a hand-maintained summary):

  1. Self-containment    -- registry.manifest.json's entryPoints all exist and
                            all live INSIDE design-repo/ (no "../" paths).
  2. Schema validation   -- the bundled example against the Draft-07 schema.
  3. Semantic validation -- the repo's own semantic_validate.py on the example.
  4. Allowlist parity    -- both directions: no allowlist entry without a
                            contract file, no contract file without an entry.
  5. Allowlist/schema    -- the allowlist's settable-property lists are
     agreement              re-derived from the schema and compared.
  6. Citation validity   -- every measuredFrom/citation resolves to a real
                            range in the real file. External ("../") citations
                            degrade gracefully: they WARN when no sibling
                            source tree is present, rather than failing.
  7. Manifest counts     -- recomputed from the actual files and compared to
                            the manifest's own counts block.
  8. Version parity      -- allowlistVersion is machine-checked against the
                            allowlist's own version field.
  9. Asset-role closure  -- every role has a valid generationPolicy, AND the 5
                            compliance-critical roles are pinned to their exact
                            required value (membership in the enum is not the
                            rule for those).
 10. No absolute paths   -- no absolute local machine path (a home-directory
                            prefix on any platform) anywhere in the tree.

That these checks actually CATCH drift (rather than merely passing on a correct
repo) is proven by scripts/prove_drift.sh, which copies the repo to a scratch
location, injects a phantom allowlist entry / an out-of-range citation / a
wrong manifest count / a different-but-valid compliance policy, and confirms
each one fails -- then confirms the real repo still passes.

Run:  python3 extraction/verify_all.py
"""
import glob
import json
import os
import re
import subprocess
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ERRORS, WARNINGS = [], []


def err(check, msg):
    ERRORS.append("[FAIL] %s: %s" % (check, msg))


def warn(check, msg):
    WARNINGS.append("[WARN] %s: %s" % (check, msg))


def load(rel):
    with open(os.path.join(REPO, rel)) as fh:
        return json.load(fh)


def contract_ids(folder):
    out = {}
    for path in sorted(glob.glob(os.path.join(REPO, folder, "*.json"))):
        with open(path) as fh:
            data = json.load(fh)
        out[data.get("id") or os.path.basename(path)[:-5]] = os.path.relpath(path, REPO)
    return out


# ---------------------------------------------------------------------------
# 1. self-containment
# ---------------------------------------------------------------------------
def check_entry_points(manifest):
    eps = manifest.get("entryPoints", {})
    flat = []
    if isinstance(eps, dict):
        for v in eps.values():
            flat.extend(v if isinstance(v, list) else [v])
    else:
        flat = list(eps)
    if not flat:
        err("entryPoints", "manifest declares no entry points")
    for ep in flat:
        if ep.startswith("../") or ep.startswith("/") or "/../" in ep:
            err("entryPoints",
                "%r points outside design-repo/. An entry point is a promise about THIS "
                "package's own contents; external evidence belongs in "
                "extraction/measured-values.json." % ep)
            continue
        if not os.path.exists(os.path.join(REPO, ep)):
            err("entryPoints", "%r does not exist" % ep)
    return flat


# ---------------------------------------------------------------------------
# 2 + 3. schema and semantic validation
# ---------------------------------------------------------------------------
def check_schema():
    try:
        from jsonschema import Draft7Validator
    except ImportError:
        warn("schema", "jsonschema is not importable; skipping Draft-07 validation")
        return
    schema = load("schema/pagespec.schema.json")
    Draft7Validator.check_schema(schema)
    example = load("schema/example.pagespec.json")
    errs = list(Draft7Validator(schema).iter_errors(example))
    for e in errs:
        err("schema", "%s: %s" % (list(e.absolute_path), e.message))
    if not errs:
        print("  schema: example validates with 0 errors")


def check_semantic():
    proc = subprocess.run([sys.executable, os.path.join(REPO, "schema/semantic_validate.py")],
                          capture_output=True, text=True)
    if proc.returncode != 0:
        err("semantic", "semantic_validate.py failed:\n" + proc.stdout + proc.stderr)
    else:
        print("  semantic: " + proc.stdout.strip().splitlines()[-1])


# ---------------------------------------------------------------------------
# 4 + 5. allowlist parity and allowlist/schema agreement
# ---------------------------------------------------------------------------
def check_allowlist(allow):
    for folder, key in (("primitives", "primitives"), ("components", "components"),
                        ("sections", "sections")):
        on_disk = contract_ids(folder)
        listed = set(allow.get(key, []))
        for pid in sorted(listed - set(on_disk)):
            err("allowlist-parity",
                "phantom entry %r in %s: no matching contract file in %s/" % (pid, key, folder))
        for pid in sorted(set(on_disk) - listed):
            err("allowlist-parity",
                "orphan contract %s (id %r) has no entry in allowlist.%s"
                % (on_disk[pid], pid, key))
    tpl = load("templates/templates.json")
    for tid in sorted(set(allow.get("templates", [])) ^ set(tpl["templates"].keys())):
        err("allowlist-parity", "template %r disagrees between the allowlist and templates.json" % tid)
    roles = set(load("assets/asset-roles.json")["roles"].keys())
    for rid in sorted(set(allow.get("assetRoles", [])) ^ roles):
        err("allowlist-parity", "assetRole %r disagrees between the allowlist and asset-roles.json" % rid)


def check_allowlist_schema_agreement(allow):
    schema = load("schema/pagespec.schema.json")
    derived = {}
    for br in schema["definitions"]["node"]["oneOf"]:
        sid = br["properties"]["section"]["const"]
        content = br["properties"]["content"]
        derived[sid] = {
            "nodeLevel": sorted(k for k in br["properties"] if k != "section"),
            "contentFields": sorted(content.get("properties", {}).keys()),
            "requiredContentFields": sorted(content.get("required", [])),
        }
    listed = allow.get("settableNodeProperties", {})
    if listed != derived:
        for sid in sorted(set(derived) | set(listed)):
            if listed.get(sid) != derived.get(sid):
                err("allowlist-schema",
                    "settableNodeProperties for %s disagrees with the schema.\n"
                    "    schema:    %s\n    allowlist: %s" % (sid, derived.get(sid), listed.get(sid)))
    motion = schema["definitions"]["motion"]
    if sorted(allow.get("settableMotionFields", [])) != sorted(motion["properties"].keys()):
        err("allowlist-schema", "settableMotionFields disagrees with the schema's motion definition")
    if sorted(allow.get("requiredMotionFields", [])) != sorted(motion["required"]):
        err("allowlist-schema", "requiredMotionFields disagrees with the schema's motion definition")
    for key, path in (("motion.pattern", "pattern"), ("motion.trigger", "trigger"),
                      ("motion.reducedMotionFallback", "reducedMotionFallback"),
                      ("motion.evidence", "evidence"), ("motion.easing", "easing"),
                      ("motion.dampingRate", "dampingRate")):
        if allow.get("closedEnums", {}).get(key) != motion["properties"][path]["enum"]:
            err("allowlist-schema", "closedEnums[%r] disagrees with the schema" % key)


# ---------------------------------------------------------------------------
# 6. citation validity
# ---------------------------------------------------------------------------
CITE_KEYS = re.compile(r"(measuredFrom|MeasuredFrom|appliedBy|mirroredIn|soleLocation|jsOptOut)$")
CITE_RE = re.compile(r"^(?P<path>[^:\s]+):(?P<a>\d+)(?:-(?P<b>[\d.]+))?$")
_line_cache = {}


def file_lines(abspath):
    if abspath not in _line_cache:
        try:
            with open(abspath, "rb") as fh:
                _line_cache[abspath] = fh.read().count(b"\n") + 1
        except OSError:
            _line_cache[abspath] = None
    return _line_cache[abspath]


def check_citation(value, where, stats):
    m = CITE_RE.match(value)
    if not m:
        return  # prose, a folder reference, or a non-line citation
    rel, a = m.group("path"), int(m.group("a"))
    b = int(float(m.group("b"))) if m.group("b") else a
    external = rel.startswith("../")
    abspath = os.path.normpath(os.path.join(REPO, rel))
    n = file_lines(abspath)
    if n is None:
        if external:
            stats["external_missing"] += 1
        else:
            err("citations", "%s cites %r but that file does not exist inside the package" % (where, value))
        return
    stats["resolved"] += 1
    if a < 1 or b < a:
        err("citations", "%s cites %r, which is not a valid range" % (where, value))
    elif b > n:
        err("citations", "%s cites %r but %s has only %d lines" % (where, value, rel, n))


def walk_citations(node, where, stats):
    if isinstance(node, dict):
        for k, v in node.items():
            if isinstance(v, str) and CITE_KEYS.search(k):
                check_citation(v, "%s.%s" % (where, k), stats)
            elif isinstance(v, list) and k.endswith("AlsoMeasuredFrom") or k == "alsoMeasuredFrom":
                for i, item in enumerate(v if isinstance(v, list) else []):
                    if isinstance(item, str):
                        check_citation(item, "%s.%s[%d]" % (where, k, i), stats)
            walk_citations(v, "%s.%s" % (where, k), stats)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk_citations(v, "%s[%d]" % (where, i), stats)


def check_citations():
    stats = {"resolved": 0, "external_missing": 0}
    for path in sorted(glob.glob(os.path.join(REPO, "**/*.json"), recursive=True)):
        rel = os.path.relpath(path, REPO)
        with open(path) as fh:
            try:
                data = json.load(fh)
            except ValueError as exc:
                err("citations", "%s is not valid JSON: %s" % (rel, exc))
                continue
        walk_citations(data, rel, stats)
    print("  citations: %d resolved and in range, %d external (no sibling source tree)"
          % (stats["resolved"], stats["external_missing"]))
    if stats["external_missing"]:
        warn("citations",
             "%d citation(s) point at the sibling source project (../src, ../tailwind.config.js, "
             "../ia.json) which is not part of this package. Not a failure -- the design-repo is a "
             "standalone snapshot; these are its build-time evidence trail. Run from inside the "
             "full project to range-check them." % stats["external_missing"])


# ---------------------------------------------------------------------------
# 7. manifest counts, recomputed from disk
# ---------------------------------------------------------------------------
def recompute_counts():
    tpl = load("templates/templates.json")
    nodes = tpl["templates"]["template.homepage"]["nodes"]
    graph = load("compatibility/graph.json")
    allow = load("tokens/llm/component-allowlist.json")
    return {
        "primitives": len(contract_ids("primitives")),
        "components": len(contract_ids("components")),
        "sections": len(contract_ids("sections")),
        "templates": len(tpl["templates"]),
        "routes": len(tpl["routeToTemplate"]),
        "templateNodes": len(nodes),
        "renderedSections": tpl["templates"]["template.homepage"]["renderedSectionCount"],
        "compatibilityRules": len(graph["rules"]),
        "assetRoles": len(load("assets/asset-roles.json")["roles"]),
        "motionPatterns": len(allow["closedEnums"]["motion.pattern"]),
        "keyframes": load("tokens/00-foundation/motion.json")["keyframes"]["count"],
        "tokenFiles": len(glob.glob(os.path.join(REPO, "tokens/**/*.json"), recursive=True)),
        "exampleNodes": len(load("schema/example.pagespec.json")["nodes"]),
    }


def check_counts(manifest):
    real = recompute_counts()
    stated = manifest.get("counts", {})
    for key in sorted(set(real) | set(stated)):
        if stated.get(key) != real.get(key):
            err("manifest-counts",
                "counts.%s says %r but the real recomputed value is %r"
                % (key, stated.get(key), real.get(key)))
    if not ERRORS:
        print("  manifest-counts: all %d counts match the files they summarise" % len(real))


# ---------------------------------------------------------------------------
# 8. version parity
# ---------------------------------------------------------------------------
def check_versions(manifest, allow):
    if manifest.get("allowlistVersion") != allow.get("version"):
        err("version-parity",
            "manifest.allowlistVersion %r != component-allowlist.json version %r"
            % (manifest.get("allowlistVersion"), allow.get("version")))
    roles = load("assets/asset-roles.json")
    if manifest.get("assetRolesVersion") != roles.get("version"):
        err("version-parity",
            "manifest.assetRolesVersion %r != asset-roles.json version %r"
            % (manifest.get("assetRolesVersion"), roles.get("version")))
    if manifest.get("compatibilityGraphVersion") != load("compatibility/graph.json").get("version"):
        err("version-parity", "manifest.compatibilityGraphVersion != graph.json version")


# ---------------------------------------------------------------------------
# 9. asset-role closure AND pinned compliance policies
# ---------------------------------------------------------------------------
def check_asset_roles():
    data = load("assets/asset-roles.json")
    valid = set(data["generationPolicyEnum"])
    for rid, role in data["roles"].items():
        pol = role.get("generationPolicy")
        if pol not in valid:
            err("asset-roles", "role %s has generationPolicy %r, outside the closed enum" % (rid, pol))
        if not role.get("guidance"):
            err("asset-roles", "role %s carries no AI-generation guidance" % rid)
    pinned = {k: v for k, v in data["pinnedPolicyRoles"].items() if k != "note"}
    for rid, want in pinned.items():
        if rid not in data["roles"]:
            err("asset-roles", "pinned role %s has no definition" % rid)
            continue
        got = data["roles"][rid]["generationPolicy"]
        if got != want:
            err("asset-roles",
                "COMPLIANCE: role %s must be pinned to %r but reads %r. Membership in the "
                "generationPolicy enum is NOT the rule for this role." % (rid, want, got))
    print("  asset-roles: %d roles, %d pinned to an exact compliance policy"
          % (len(data["roles"]), len(pinned)))


# ---------------------------------------------------------------------------
# 10. no absolute local paths
# ---------------------------------------------------------------------------
# The needles are assembled at runtime rather than written as literals, so this
# check does not match its own source text -- and so that no literal absolute
# local path exists anywhere in this package.
SEP = chr(47)
ABS_PATH_NEEDLES = (
    (SEP + "Users" + SEP).encode(),
    (SEP + "home" + SEP).encode(),
    ("C:" + chr(92) + chr(92) + "Users").encode(),
)


def check_no_abs_paths():
    hits = []
    for root, _dirs, files in os.walk(REPO):
        for name in files:
            path = os.path.join(root, name)
            try:
                with open(path, "rb") as fh:
                    blob = fh.read()
            except OSError:
                continue
            for needle in ABS_PATH_NEEDLES:
                if needle in blob:
                    hits.append("%s contains %s" % (os.path.relpath(path, REPO), needle.decode()))
    for h in hits:
        err("absolute-paths", h)
    if not hits:
        print("  absolute-paths: none found anywhere in the tree")


def main():
    print("verify_all: %s" % os.path.basename(REPO))
    manifest = load("registry.manifest.json")
    allow = load("tokens/llm/component-allowlist.json")
    eps = check_entry_points(manifest)
    print("  entryPoints: %d declared, all inside the package" % len(eps))
    check_schema()
    check_semantic()
    check_allowlist(allow)
    check_allowlist_schema_agreement(allow)
    if not [e for e in ERRORS if "allowlist" in e]:
        print("  allowlist: parity in both directions, and agreement with the schema")
    check_citations()
    check_versions(manifest, allow)
    check_asset_roles()
    check_counts(manifest)
    check_no_abs_paths()

    for line in WARNINGS:
        print(line)
    for line in ERRORS:
        print(line)
    print("verify_all: %d failure(s), %d warning(s)" % (len(ERRORS), len(WARNINGS)))
    return 1 if ERRORS else 0


if __name__ == "__main__":
    sys.exit(main())
