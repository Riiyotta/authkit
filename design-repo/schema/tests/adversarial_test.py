#!/usr/bin/env python3
"""Adversarial suite for the AuthKit design-repo.

For every rule the repo claims to enforce, construct a mutated instance that
must now be REJECTED, and prove it is. Also assert the CONTROL cases: the
unmutated example, and one generically-synthesised control per template, must
produce zero errors. A validator that rejects everything is as broken as one
that rejects nothing.

Mutations that have to alter the repo's own contract files (asset-role closure,
pinned generation policies) are applied to a THROWAWAY COPY of the repo, never
to the real one.

Run:  python3 schema/tests/adversarial_test.py
"""
import copy
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(REPO, "schema"))

from jsonschema import Draft7Validator  # noqa: E402

SCHEMA = json.load(open(os.path.join(REPO, "schema/pagespec.schema.json")))
EXAMPLE = json.load(open(os.path.join(REPO, "schema/example.pagespec.json")))
TEMPLATES = json.load(open(os.path.join(REPO, "templates/templates.json")))

PASS, FAIL = [], []


def record(ok, name, detail=""):
    (PASS if ok else FAIL).append(name)
    print("%s  %s%s" % ("ok  " if ok else "FAIL", name, (" -- " + detail) if detail and not ok else ""))


def schema_errors(spec):
    return list(Draft7Validator(SCHEMA).iter_errors(spec))


def semantic_errors(spec, repo=REPO):
    """Run the repo's OWN validator as a subprocess, so the test exercises the
    real shipped script rather than a reimplementation of it."""
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as fh:
        json.dump(spec, fh)
        path = fh.name
    try:
        proc = subprocess.run(
            [sys.executable, "-I", os.path.join(repo, "schema/semantic_validate.py"), path],
            capture_output=True, text=True)
        return proc.returncode, proc.stdout
    finally:
        os.unlink(path)


def node_index(spec, section):
    for i, n in enumerate(spec["nodes"]):
        if n["section"] == section:
            return i
    raise AssertionError("example has no node %s" % section)


def mutate(fn):
    spec = copy.deepcopy(EXAMPLE)
    fn(spec)
    return spec


def expect_schema_reject(name, fn):
    errs = schema_errors(mutate(fn))
    record(bool(errs), "schema rejects: " + name,
           "mutation validated cleanly against the schema")


def expect_semantic_reject(name, fn, rule=None):
    code, out = semantic_errors(mutate(fn))
    ok = code != 0
    if ok and rule:
        ok = rule in out
    record(ok, "validator rejects: " + name,
           "exit=%d rule=%r not in output" % (code, rule))


# =========================================================================
# SCHEMA-LAYER MUTATIONS
# =========================================================================
def m_route(s): s["route"] = "/pricing"
expect_schema_reject("invented route /pricing (closed enum)", m_route)

def m_template(s): s["basedOnTemplate"] = "template.blog"
expect_schema_reject("invented template id (closed enum)", m_template)

def m_version(s): s["pageSpecVersion"] = "2.0.0"
expect_schema_reject("wrong pageSpecVersion const", m_version)

def m_missing_required(s): del s["nodes"][node_index(s, "conversion.cta-header")]["content"]["heading"]
expect_schema_reject("missing required content field", m_missing_required)

def m_invented_section(s): s["nodes"][1]["section"] = "shell.navbar"
expect_schema_reject("invented section id / type alias", m_invented_section)

def m_no_fallback(s): del s["nodes"][0]["motion"]["reducedMotionFallback"]
expect_schema_reject("missing reducedMotionFallback", m_no_fallback)

def m_invented_motion_field(s): s["nodes"][0]["motion"]["inventedAnimation"] = "wobble"
expect_schema_reject("invented motion field (motion is closed)", m_invented_motion_field)

def m_invented_pattern(s): s["nodes"][0]["motion"]["pattern"] = "parallax-zoom"
expect_schema_reject("invented motion pattern", m_invented_pattern)

def m_invented_easing(s): s["nodes"][0]["motion"]["easing"] = "ease.bounce"
expect_schema_reject("invented easing outside the two house curves", m_invented_easing)

def m_invented_damping(s): s["nodes"][node_index(s, "demo.radix")]["motion"]["dampingRate"] = 0.2
expect_schema_reject("invented damping rate", m_invented_damping)

def m_extra_node_prop(s): s["nodes"][0]["layout"] = "wide"
expect_schema_reject("extra property on a node", m_extra_node_prop)

def m_extra_content_prop(s): s["nodes"][node_index(s, "conversion.cta-header")]["content"]["subheading"] = "x"
expect_schema_reject("extra property inside content", m_extra_content_prop)

def m_external_asset(s):
    s["nodes"][node_index(s, "hero.wordmark")]["content"]["wordmark"]["assetRef"] = "https://cdn.example.com/w.svg"
expect_schema_reject("external asset URL (no-external-requests)", m_external_asset)

def m_bad_role(s):
    s["nodes"][node_index(s, "hero.wordmark")]["content"]["wordmark"]["assetRole"] = "image"
expect_schema_reject("bare generic assetRole 'image'", m_bad_role)

def m_live_href(s):
    s["nodes"][node_index(s, "conversion.cta-boxes")]["content"]["boxes"][0]["href"] = "https://example.com"
expect_schema_reject("live outbound href (hrefs are inert)", m_live_href)

def m_card_count(s):
    s["nodes"][node_index(s, "hero.auth-card-trio")]["content"]["cards"].pop()
expect_schema_reject("hero auth-card trio reduced to 2 cards", m_card_count)

def m_security_four_cards(s):
    s["nodes"][node_index(s, "demo.security-cards")]["content"]["cards"].pop()
expect_schema_reject("security grid reduced to 4 cards (the real count is 5)", m_security_four_cards)

def m_four_connectors(s):
    s["nodes"][node_index(s, "demo.dashboard")]["content"]["connectorMasks"].pop()
expect_schema_reject("dashboard reduced to 4 connectors (the real count is 5)", m_four_connectors)

def m_invented_brand(s):
    s["nodes"][node_index(s, "hero.auth-card-trio")]["content"]["cards"][0]["brandColor"] = "#ff00ff"
expect_schema_reject("invented brand colour outside the closed swatch set", m_invented_brand)

def m_invented_radius(s):
    s["nodes"][node_index(s, "hero.auth-card-trio")]["content"]["cards"][0]["brandRadius"] = "7px"
expect_schema_reject("invented brand radius outside the closed domain", m_invented_radius)

def m_otp_length(s):
    s["nodes"][node_index(s, "hero.auth-card-trio")]["content"]["cards"][2]["otp"]["length"] = 4
expect_schema_reject("OTP length changed from the measured 6", m_otp_length)

def m_doc_theme_light(s): s["theme"] = "theme.light"
expect_schema_reject("document-level theme.light (light is subtree-only)", m_doc_theme_light)

# =========================================================================
# STRUCTURAL MUTATIONS (semantic validator)
# =========================================================================
def m_dup_one_per_page(s):
    i = node_index(s, "demo.dashboard")
    s["nodes"].insert(i + 1, copy.deepcopy(s["nodes"][i]))
expect_semantic_reject("duplicated a one-per-page section", m_dup_one_per_page)

def m_remove_mandatory(s):
    del s["nodes"][node_index(s, "capability.feature-strip")]
expect_semantic_reject("removed a mandatory section", m_remove_mandatory,
                       "TEMPLATE_REQUIRED_MISSING")

def m_remove_hero_node(s):
    del s["nodes"][node_index(s, "hero.light-switch")]
expect_semantic_reject("removed a HERO-set node", m_remove_hero_node,
                       "HERO_NODE_SET_COMPLETE")

def m_reorder_last(s):
    n = s["nodes"].pop(node_index(s, "conversion.cta-boxes"))
    s["nodes"].insert(node_index(s, "proof.testimonials"), n)
expect_semantic_reject("moved the must-be-last section", m_reorder_last)

def m_reorder_first(s):
    n = s["nodes"].pop(0)
    s["nodes"].insert(3, n)
expect_semantic_reject("moved the must-be-first section", m_reorder_first)

def m_order_swap(s):
    i = node_index(s, "demo.radix")
    j = node_index(s, "demo.security-cards")
    s["nodes"][i], s["nodes"][j] = s["nodes"][j], s["nodes"][i]
expect_semantic_reject("template/node-sequence mismatch (two demos swapped)", m_order_swap,
                       "TEMPLATE_ORDER_MISMATCH")

def m_unknown_template(s): s["basedOnTemplate"] = "template.homepage "
expect_semantic_reject("declared template that resolves to nothing", m_unknown_template,
                       "TEMPLATE_RESOLUTION")

def m_split_pickers(s):
    n = s["nodes"].pop(node_index(s, "demo.customiser-pickers"))
    s["nodes"].insert(node_index(s, "proof.testimonials"), n)
expect_semantic_reject("separated the pickers from their host browser frame", m_split_pickers)

def m_separator_wrong_place(s):
    i = node_index(s, "capability.feature-strip")
    s["nodes"].insert(i, {"section": "chrome.page-separator", "occurrence": 1, "content": {},
                          "motion": {"pattern": "none", "trigger": "none",
                                     "reducedMotionFallback": "none", "evidence": "measured"}})
expect_semantic_reject("separator at a boundary that has none", m_separator_wrong_place,
                       "SEPARATOR_PLACEMENT")

def m_fifth_separator(s):
    i = node_index(s, "demo.radix")
    s["nodes"].insert(i, {"section": "chrome.page-separator", "occurrence": 4, "content": {},
                          "motion": {"pattern": "none", "trigger": "none",
                                     "reducedMotionFallback": "none", "evidence": "measured"}})
expect_semantic_reject("a 5th separator occurrence", m_fifth_separator,
                       "TEMPLATE_OCCURRENCE_COUNT")

def m_light_where_unsupported(s):
    s["nodes"][node_index(s, "demo.dashboard")]["theme"] = "theme.light"
expect_semantic_reject("theme.light on a section with no light subtree", m_light_where_unsupported,
                       "NO_LIGHT_MODE_FORK")

def m_scrub_elsewhere(s):
    s["nodes"][node_index(s, "demo.dashboard")]["motion"]["trigger"] = "scroll-scrub"
expect_semantic_reject("scroll-scrub on a section outside the budget", m_scrub_elsewhere,
                       "SCROLL_SCRUB_BUDGET")

def m_adjacent_scrub(s):
    n = s["nodes"].pop(node_index(s, "hero.auth-card-trio"))
    s["nodes"].insert(node_index(s, "demo.radix"), n)
expect_semantic_reject("two adjacent scroll-scrubbed systems", m_adjacent_scrub)

def m_pattern_not_allowed(s):
    s["nodes"][node_index(s, "proof.testimonials")]["motion"]["pattern"] = "particle-drift"
expect_semantic_reject("motion pattern outside the section's allowed list", m_pattern_not_allowed,
                       "MOTION_PATTERN_NOT_ALLOWED")

def m_animate_static_section(s):
    i = node_index(s, "conversion.cta-header")
    s["nodes"][i]["motion"]["pattern"] = "glow-ring-chase"
expect_semantic_reject("gave motion to a motion-free section", m_animate_static_section)

def m_wrong_fallback(s):
    s["nodes"][node_index(s, "demo.radix")]["motion"]["reducedMotionFallback"] = "none"
expect_semantic_reject("reducedMotionFallback that contradicts the contract", m_wrong_fallback,
                       "REDUCED_MOTION_FALLBACK_MISMATCH")

def m_interactive_elsewhere(s):
    s["nodes"][node_index(s, "demo.dashboard")]["motion"]["trigger"] = "user-input"
expect_semantic_reject("user-input trigger on a non-interactive section", m_interactive_elsewhere,
                       "INTERACTIVITY_BUDGET")

def m_doc_height(s): s["documentHeight"] = 6484
expect_schema_reject("asserted a document height (schema layer)", m_doc_height)

def m_doc_height_nested(s):
    s["nodes"][0]["content"]["documentHeight"] = 6484
expect_schema_reject("asserted a nested document height", m_doc_height_nested)

# =========================================================================
# RUNTIME / COPY-BUDGET MUTATIONS
# =========================================================================
def m_maxwords(s):
    s["nodes"][node_index(s, "conversion.cta-header")]["content"]["heading"] = "Start building something today"
expect_semantic_reject("maxWords overflow on a real field", m_maxwords, "MAXWORDS")

def m_maxlength(s):
    s["nodes"][node_index(s, "proof.testimonials")]["content"]["cells"][0]["quote"] = "x" * 200
expect_schema_reject("maxLength overflow on a quote", m_maxlength)

def m_title_lines(s):
    s["nodes"][node_index(s, "hero.headline")]["content"]["titleLines"].append("a third line")
expect_schema_reject("hero headline given a third authored line", m_title_lines)

# =========================================================================
# CONTRACT-FILE DRIFT MUTATIONS (applied to a throwaway copy of the repo)
# =========================================================================
def with_repo_copy(name, mutate_repo, spec=None, rule=None):
    tmp = tempfile.mkdtemp(prefix="advrepo-")
    dst = os.path.join(tmp, "design-repo")
    try:
        shutil.copytree(REPO, dst)
        mutate_repo(dst)
        code, out = semantic_errors(spec or EXAMPLE, repo=dst)
        ok = code != 0
        if ok and rule:
            ok = rule in out
        record(ok, "validator rejects: " + name, "exit=%d rule=%r not in output" % (code, rule))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def drift_pinned_policy(dst):
    """The dangerous case a membership-in-enum check CANNOT catch: change a
    compliance-critical role to a DIFFERENT value that is still a valid member
    of the generationPolicy enum."""
    p = os.path.join(dst, "assets/asset-roles.json")
    d = json.load(open(p))
    assert d["roles"]["customer.logo"]["generationPolicy"] == "must-not-reproduce-real-entity"
    d["roles"]["customer.logo"]["generationPolicy"] = "may-generate-new"
    assert d["roles"]["customer.logo"]["generationPolicy"] in d["generationPolicyEnum"]
    json.dump(d, open(p, "w"), indent=2)


with_repo_copy("compliance role repointed to a different-but-VALID policy",
               drift_pinned_policy, rule="ASSET_ROLE_PINNED_POLICY")


def drift_headshot_policy(dst):
    p = os.path.join(dst, "assets/asset-roles.json")
    d = json.load(open(p))
    d["roles"]["person.headshot"]["generationPolicy"] = "must-reuse-exact"
    json.dump(d, open(p, "w"), indent=2)


with_repo_copy("person.headshot policy weakened to must-reuse-exact",
               drift_headshot_policy, rule="ASSET_ROLE_PINNED_POLICY")


def drift_separator_rule(dst):
    """A graph rule and the validator that enforces it are two authoritative
    sources for one fact. Prove the validator really reads the graph: narrow
    the allowed separator boundaries and confirm the real example now fails."""
    p = os.path.join(dst, "compatibility/graph.json")
    d = json.load(open(p))
    d["rules"]["SEPARATOR_PLACEMENT"]["allowedBefore"] = ["demo.radix"]
    json.dump(d, open(p, "w"), indent=2)


with_repo_copy("validator honours compatibility/graph.json (narrowed separator rule)",
               drift_separator_rule, rule="SEPARATOR_PLACEMENT")

# =========================================================================
# CONTROLS
# =========================================================================
errs = schema_errors(EXAMPLE)
record(not errs, "CONTROL: bundled example validates against the schema",
       "; ".join("%s: %s" % (list(e.absolute_path), e.message) for e in errs[:3]))

code, out = semantic_errors(EXAMPLE)
record(code == 0, "CONTROL: bundled example passes the semantic validator", out)


def synthesise_control(tpl):
    """Generically build one minimal valid control per template, from that
    template's OWN node list, reusing the example's content for each section.
    Adding a template to templates.json auto-covers it here with no new code."""
    by_section = {}
    for n in EXAMPLE["nodes"]:
        by_section.setdefault(n["section"], n)
    allowed = json.load(open(os.path.join(REPO, "compatibility/graph.json"))) \
        ["rules"]["SEPARATOR_PLACEMENT"]["allowedBefore"]
    nodes, missing, occ = [], [], 0
    for entry in tpl["nodes"]:
        sid = entry["section"]
        if sid == "chrome.page-separator":
            continue
        if sid in allowed:
            occ += 1
            sep = copy.deepcopy(by_section["chrome.page-separator"])
            sep["occurrence"] = occ
            nodes.append(sep)
        if sid not in by_section:
            missing.append(sid)
            continue
        nodes.append(copy.deepcopy(by_section[sid]))
    return {"pageSpecVersion": "1.0.0", "route": tpl["routes"][0],
            "basedOnTemplate": tpl["id"], "theme": "theme.dark", "nodes": nodes}, missing


for tid, tpl in TEMPLATES["templates"].items():
    control, missing = synthesise_control(tpl)
    if missing:
        record(False, "CONTROL: synthesised control for %s" % tid,
               "example has no node for %s, so this template is NOT covered" % missing)
        continue
    errs = schema_errors(control)
    record(not errs, "CONTROL: synthesised %s validates against the schema" % tid,
           "; ".join(e.message for e in errs[:3]))
    code, out = semantic_errors(control)
    record(code == 0, "CONTROL: synthesised %s passes the semantic validator" % tid, out)

print("\n%d passed, %d failed" % (len(PASS), len(FAIL)))
if FAIL:
    print("FAILURES:")
    for f in FAIL:
        print("  - " + f)
sys.exit(1 if FAIL else 0)
