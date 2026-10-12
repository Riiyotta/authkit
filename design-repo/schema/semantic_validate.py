#!/usr/bin/env python3
"""Semantic validation for an AuthKit design-repo PageSpec.

Enforces everything JSON Schema structurally cannot express. The repo root is
derived from __file__, never a hardcoded path, so this runs correctly from any
location the design-repo is extracted to.

Run:  python3 schema/semantic_validate.py [path/to/pagespec.json]
      (defaults to schema/example.pagespec.json)

Exit 0 only when there are zero ERROR-severity findings. WARN findings are
printed but do not fail the run, matching compatibility/graph.json's own
per-rule severity field.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(rel):
    with open(os.path.join(REPO, rel)) as fh:
        return json.load(fh)


def count_words(text):
    return len([w for w in re.split(r"\s+", text.strip()) if w])


class Report:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def error(self, rule, msg):
        self.errors.append("[ERROR] %s: %s" % (rule, msg))

    def warn(self, rule, msg):
        self.warnings.append("[WARN ] %s: %s" % (rule, msg))

    def ok(self):
        return not self.errors


# ---------------------------------------------------------------------------
# maxWords / maxLength, walked over the SCHEMA's own budget keywords so the
# validator and the schema cannot drift apart.
# ---------------------------------------------------------------------------
def check_budgets(schema_node, instance, path, rep):
    if not isinstance(schema_node, dict):
        return
    if "oneOf" in schema_node and isinstance(instance, dict):
        sec = instance.get("section")
        for branch in schema_node["oneOf"]:
            const = branch.get("properties", {}).get("section", {}).get("const")
            if const == sec:
                check_budgets(branch, instance, path, rep)
                return
        return
    if schema_node.get("$ref") == "#/definitions/motion":
        return
    if isinstance(instance, str):
        mw = schema_node.get("maxWords")
        if mw is not None:
            n = count_words(instance)
            if n > mw:
                rep.error("MAXWORDS", "%s has %d words, budget is %d" % (path, n, mw))
        ml = schema_node.get("maxLength")
        if ml is not None and len(instance) > ml:
            rep.error("MAXLENGTH", "%s is %d chars, budget is %d" % (path, len(instance), ml))
        return
    if isinstance(instance, dict):
        for key, val in instance.items():
            sub = schema_node.get("properties", {}).get(key)
            if sub is not None:
                check_budgets(sub, val, "%s.%s" % (path, key), rep)
        return
    if isinstance(instance, list):
        sub = schema_node.get("items")
        if sub is not None:
            for i, val in enumerate(instance):
                check_budgets(sub, val, "%s[%d]" % (path, i), rep)


def main(argv):
    spec_path = argv[1] if len(argv) > 1 else os.path.join(REPO, "schema/example.pagespec.json")
    with open(spec_path) as fh:
        spec = json.load(fh)

    schema = load("schema/pagespec.schema.json")
    templates = load("templates/templates.json")
    graph = load("compatibility/graph.json")
    roles = load("assets/asset-roles.json")
    rep = Report()

    nodes = spec.get("nodes", [])
    ids = [n.get("section") for n in nodes]

    # -- load every section contract named by the spec -----------------------
    contracts = {}
    for sid in set(ids):
        path = os.path.join(REPO, "sections", "%s.json" % sid)
        if not os.path.exists(path):
            rep.error("UNKNOWN_SECTION", "no contract file for section id %r" % sid)
            continue
        with open(path) as fh:
            contracts[sid] = json.load(fh)

    # =======================================================================
    # THE CROSS-REFERENCE CHECK: a PageSpec's declared template is resolved to
    # that template's REAL node list, and the spec's nodes[] is checked against
    # it. nodes[] is never validated in isolation.
    # =======================================================================
    tid = spec.get("basedOnTemplate")
    tpl = templates.get("templates", {}).get(tid)
    if tpl is None:
        rep.error("TEMPLATE_RESOLUTION",
                  "basedOnTemplate %r resolves to no template in templates/templates.json" % tid)
        tpl_nodes = []
    else:
        tpl_nodes = tpl["nodes"]

        declared = [n["section"] for n in tpl_nodes]
        required = [n["section"] for n in tpl_nodes if n.get("required")]
        repeatable = {n["section"] for n in tpl_nodes if n.get("repeatable")}

        # every required section of the DECLARED template must be present
        for sid in required:
            if sid not in ids:
                rep.error("TEMPLATE_REQUIRED_MISSING",
                          "template %s requires section %s, which the spec omits" % (tid, sid))

        # no section may appear that the declared template does not list
        for sid in ids:
            if sid not in declared:
                rep.error("TEMPLATE_EXTRA_SECTION",
                          "section %s is not part of template %s's node list" % (sid, tid))

        # only sections the template marks repeatable may appear more than once
        for sid in set(ids):
            n = ids.count(sid)
            if n > 1 and sid not in repeatable:
                rep.error("TEMPLATE_NOT_REPEATABLE",
                          "section %s appears %d times but template %s does not mark it repeatable"
                          % (sid, n, tid))

        # the ORDER of the non-repeatable sections must match the template's own
        tpl_order = [s for s in declared if s not in repeatable]
        spec_order = [s for s in ids if s not in repeatable]
        if spec_order != tpl_order:
            rep.error("TEMPLATE_ORDER_MISMATCH",
                      "node order disagrees with template %s.\n  template: %s\n  spec:     %s"
                      % (tid, tpl_order, spec_order))

        # a repeatable section may not exceed the occurrence count the template declares
        for n in tpl_nodes:
            if n.get("repeatable") and "occurrences" in n:
                want, got = n["occurrences"], ids.count(n["section"])
                if got != want:
                    rep.error("TEMPLATE_OCCURRENCE_COUNT",
                              "section %s appears %d times; template %s declares %d occurrences"
                              % (n["section"], got, tid, want))

        # route must be one the declared template actually serves
        if spec.get("route") not in tpl["routes"]:
            rep.error("ROUTE_NOT_SERVED",
                      "route %r is not served by template %s (serves %s)"
                      % (spec.get("route"), tid, tpl["routes"]))

    # -- single route / single template -------------------------------------
    if spec.get("route") != "/":
        rep.error("SINGLE_ROUTE_SINGLE_TEMPLATE",
                  "this site has exactly one real route (/). 15 probed candidates return 404.")

    # -- position rules, read from the section contracts themselves ----------
    for sid, c in contracts.items():
        con = c.get("constraints", {})
        if con.get("mustBeFirst") and ids and ids[0] != sid:
            rep.error("HAIRLINE_GRID_FIRST", "%s must be the first node (found %s)" % (sid, ids[0]))
        if con.get("mustBeLast") and ids and ids[-1] != sid:
            rep.error("CTA_BOXES_LAST", "%s must be the last node (found %s)" % (sid, ids[-1]))
        if con.get("onePerPage") and ids.count(sid) > 1:
            rep.error("ONE_PER_PAGE", "%s appears %d times, limit is 1" % (sid, ids.count(sid)))
        mx = con.get("maxPerPage")
        if mx is not None and ids.count(sid) > mx:
            rep.error("MAX_PER_PAGE", "%s appears %d times, limit is %d" % (sid, ids.count(sid), mx))
        follow = con.get("mustImmediatelyFollow")
        if follow and sid in ids:
            i = ids.index(sid)
            if i == 0 or ids[i - 1] != follow:
                rep.error("HEADER_IMMEDIATELY_AFTER_GRID",
                          "%s must immediately follow %s" % (sid, follow))
        prec = con.get("mustPrecedeSection")
        if prec and sid in ids and prec in ids:
            if ids.index(prec) != ids.index(sid) + 1:
                rep.error("CTA_HEADER_IMMEDIATELY_PRECEDES_BOXES",
                          "%s must immediately precede %s" % (sid, prec))
        inside = con.get("mustBeInsideSection")
        if inside and sid in ids and inside in ids:
            if ids.index(sid) != ids.index(inside) + 1:
                rep.error("PICKERS_IMMEDIATELY_FOLLOW_BROWSER",
                          "%s must immediately follow its host section %s" % (sid, inside))

    rules = graph["rules"]

    # -- separator placement -------------------------------------------------
    allowed = rules["SEPARATOR_PLACEMENT"]["allowedBefore"]
    for i, sid in enumerate(ids):
        if sid != "chrome.page-separator":
            continue
        nxt = ids[i + 1] if i + 1 < len(ids) else None
        if nxt not in allowed:
            rep.error("SEPARATOR_PLACEMENT",
                      "separator at index %d precedes %r; allowed only before %s" % (i, nxt, allowed))

    # -- no nav / no footer --------------------------------------------------
    for sid in ids:
        if sid in rules["NO_NAV_NO_FOOTER"]["forbiddenIds"]:
            rep.error("NO_NAV_NO_FOOTER",
                      "%s is forbidden: the real site has no <nav> and no <footer> element" % sid)

    # -- hero node set -------------------------------------------------------
    for sid in rules["HERO_NODE_SET_COMPLETE"]["nodes"]:
        if ids.count(sid) != 1:
            rep.error("HERO_NODE_SET_COMPLETE",
                      "HERO node %s appears %d times, must appear exactly once" % (sid, ids.count(sid)))
    if "capability.feature-strip" in ids:
        fs = ids.index("capability.feature-strip")
        for sid in rules["HERO_NODE_SET_COMPLETE"]["nodes"]:
            if sid in ids and ids.index(sid) > fs:
                rep.error("HERO_NODE_SET_COMPLETE",
                          "HERO node %s must appear before capability.feature-strip" % sid)

    # -- expected category sequence (warn) ----------------------------------
    seq = [contracts[s]["category"] for s in ids if s in contracts]
    if seq != rules["EXPECTED_CATEGORY_SEQUENCE"]["expected"]:
        rep.warn("EXPECTED_CATEGORY_SEQUENCE",
                 "category sequence differs from the one real composition.\n  expected: %s\n  found:    %s"
                 % (rules["EXPECTED_CATEGORY_SEQUENCE"]["expected"], seq))

    # -- motion: fallback, scrub budget, interactivity, motion-free ---------
    scrub_nodes = set(rules["SCROLL_SCRUB_BUDGET"]["nodes"])
    scrub_seen = []
    for i, node in enumerate(nodes):
        sid = node.get("section")
        motion = node.get("motion")
        if not isinstance(motion, dict):
            rep.error("REDUCED_MOTION_FALLBACK_REQUIRED", "node %d (%s) has no motion object" % (i, sid))
            continue
        if "reducedMotionFallback" not in motion:
            rep.error("REDUCED_MOTION_FALLBACK_REQUIRED",
                      "node %d (%s) declares no reducedMotionFallback" % (i, sid))
        if motion.get("trigger") == "scroll-scrub":
            scrub_seen.append((i, sid))
            if sid not in scrub_nodes:
                rep.error("SCROLL_SCRUB_BUDGET",
                          "%s declares trigger scroll-scrub; only %s may" % (sid, sorted(scrub_nodes)))
        if sid in contracts:
            allowed_patterns = contracts[sid]["motion"]["allowedPatterns"]
            if motion.get("pattern") not in allowed_patterns:
                rep.error("MOTION_PATTERN_NOT_ALLOWED",
                          "node %d (%s) uses pattern %r; its contract allows %s"
                          % (i, sid, motion.get("pattern"), allowed_patterns))
            want_fb = contracts[sid]["motion"].get("requiredReducedMotionFallback")
            if want_fb and motion.get("reducedMotionFallback") != want_fb:
                rep.error("REDUCED_MOTION_FALLBACK_MISMATCH",
                          "node %d (%s) declares fallback %r; its contract requires %r"
                          % (i, sid, motion.get("reducedMotionFallback"), want_fb))
            if contracts[sid]["motion"]["allowedPatterns"] == ["none"] and motion.get("pattern") != "none":
                rep.error("MOTION_FREE_NODES", "%s must stay motion-free" % sid)
        if motion.get("trigger") == "user-input" and sid in contracts:
            if not contracts[sid].get("interactive"):
                rep.error("INTERACTIVITY_BUDGET",
                          "%s declares a user-input trigger but its contract is not interactive; only %s are"
                          % (sid, rules["INTERACTIVITY_BUDGET"]["interactiveNodes"]))

    # the two scrubbed systems must not be adjacent
    for a in range(len(scrub_seen)):
        for b in range(a + 1, len(scrub_seen)):
            if abs(scrub_seen[a][0] - scrub_seen[b][0]) <= 1:
                rep.error("NO_CONSECUTIVE_SCROLL_SCRUB",
                          "%s and %s are adjacent scrubbed systems" % (scrub_seen[a][1], scrub_seen[b][1]))

    # -- light subtree only where the contract allows it --------------------
    for i, node in enumerate(nodes):
        if node.get("theme") == "theme.light":
            sid = node.get("section")
            if not contracts.get(sid, {}).get("supportsLightSubtree"):
                rep.error("NO_LIGHT_MODE_FORK",
                          "node %d (%s) requests theme.light, but its contract does not support a light subtree"
                          % (i, sid))
    if spec.get("theme") == "theme.light":
        rep.error("NO_LIGHT_MODE_FORK",
                  "theme.light is SUBTREE-ONLY; there is no light document theme on this site")

    # -- assets: closed roles, pinned policies, no external URLs ------------
    role_defs = roles["roles"]
    pinned = roles["pinnedPolicyRoles"]
    for rid, pol in pinned.items():
        if rid == "note":
            continue
        got = role_defs.get(rid, {}).get("generationPolicy")
        if got != pol:
            rep.error("ASSET_ROLE_PINNED_POLICY",
                      "role %s must be pinned to generationPolicy %r but reads %r "
                      "(membership in the enum is NOT sufficient for a compliance-critical role)"
                      % (rid, pol, got))

    def walk_media(val, path):
        if isinstance(val, dict):
            if "assetRole" in val:
                rid = val["assetRole"]
                if rid not in role_defs:
                    rep.error("ASSET_ROLE_CLOSED",
                              "%s uses assetRole %r, which is not in the closed vocabulary" % (path, rid))
                ref = val.get("assetRef", "")
                if re.match(r"^(https?:)?//", ref):
                    rep.error("NO_EXTERNAL_ASSET_REQUESTS",
                              "%s points at an external URL %r; every asset must be local" % (path, ref))
            for k, v in val.items():
                walk_media(v, "%s.%s" % (path, k))
        elif isinstance(val, list):
            for i, v in enumerate(val):
                walk_media(v, "%s[%d]" % (path, i))

    walk_media(nodes, "nodes")

    # -- inert hrefs ---------------------------------------------------------
    def walk_href(val, path):
        if isinstance(val, dict):
            for k, v in val.items():
                if k == "href" and v != "#":
                    rep.error("ALL_OUTBOUND_HREFS_INERT",
                              "%s.href is %r; every outbound href is deliberately inert ('#')" % (path, v))
                walk_href(v, "%s.%s" % (path, k))
        elif isinstance(val, list):
            for i, v in enumerate(val):
                walk_href(v, "%s[%d]" % (path, i))

    walk_href(nodes, "nodes")

    # -- document height must never be asserted -----------------------------
    def walk_docheight(val, path):
        if isinstance(val, dict):
            for k, v in val.items():
                if k in ("documentHeight", "scrollHeight"):
                    rep.error("NO_DOCUMENT_HEIGHT_CONTRACT",
                              "%s.%s asserts a document height; six sections use content-visibility:auto "
                              "so scrollHeight is not a fidelity metric here" % (path, k))
                walk_docheight(v, "%s.%s" % (path, k))
        elif isinstance(val, list):
            for i, v in enumerate(val):
                walk_docheight(v, "%s[%d]" % (path, i))

    walk_docheight(spec, "spec")

    # -- per-instance copy budgets ------------------------------------------
    for i, node in enumerate(nodes):
        check_budgets(schema["definitions"]["node"], node, "nodes[%d]" % i, rep)

    for line in rep.warnings:
        print(line)
    for line in rep.errors:
        print(line)
    print("semantic_validate: %d error(s), %d warning(s) on %s"
          % (len(rep.errors), len(rep.warnings), os.path.basename(spec_path)))
    return 0 if rep.ok() else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
