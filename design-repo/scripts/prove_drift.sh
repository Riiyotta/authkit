#!/usr/bin/env bash
# Prove that extraction/verify_all.py's drift-proofed checks actually CATCH
# drift, rather than merely passing on a correct repo.
#
# For each injected defect: copy the repo to a scratch location, inject the
# defect, confirm verify_all.py FAILS, and confirm it names the right check.
# Finally confirm the REAL repo still passes.
#
# Usage:  bash scripts/prove_drift.sh
set -u

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY="${PYTHON:-python3}"
PASS=0
FAIL=0

say() { printf '%s\n' "$*"; }

# inject <name> <expected-check-token> <python-mutation>
inject() {
  local name="$1" token="$2" mutation="$3"
  local tmp dst out
  tmp="$(mktemp -d)"
  dst="$tmp/design-repo"
  cp -R "$REPO" "$dst"
  if ! "$PY" -c "
import json, sys
DST = sys.argv[1]
$mutation
" "$dst"; then
    say "FAIL  $name -- could not inject the mutation"
    FAIL=$((FAIL + 1)); rm -rf "$tmp"; return
  fi
  out="$("$PY" "$dst/extraction/verify_all.py" 2>&1)"
  if [ $? -eq 0 ]; then
    say "FAIL  $name -- verify_all.py PASSED on a repo with injected drift"
    FAIL=$((FAIL + 1))
  elif ! printf '%s' "$out" | grep -q "$token"; then
    say "FAIL  $name -- failed, but did not name the '$token' check"
    say "$out" | tail -5
    FAIL=$((FAIL + 1))
  else
    say "ok    $name -- caught by the '$token' check"
    PASS=$((PASS + 1))
  fi
  rm -rf "$tmp"
}

say "prove_drift: injecting defects into throwaway copies of the repo"
say ""

# --- 1. allowlist parity: a PHANTOM entry (listed, no contract file) --------
inject "phantom allowlist entry" "allowlist-parity" "
p = DST + '/tokens/llm/component-allowlist.json'
d = json.load(open(p))
d['primitives'].append('primitive.ticker')
json.dump(d, open(p, 'w'), indent=2)
"

# --- 2. allowlist parity: an ORPHAN contract (file, no allowlist entry) -----
inject "orphan contract with no allowlist entry" "allowlist-parity" "
p = DST + '/tokens/llm/component-allowlist.json'
d = json.load(open(p))
d['components'].remove('component.cta-box')
json.dump(d, open(p, 'w'), indent=2)
"

# --- 3. allowlist/schema agreement -----------------------------------------
inject "allowlist settable-property list drifting from the schema" "allowlist-schema" "
p = DST + '/tokens/llm/component-allowlist.json'
d = json.load(open(p))
d['settableNodeProperties']['conversion.cta-header']['contentFields'].append('subheading')
json.dump(d, open(p, 'w'), indent=2)
"

# --- 4a. citation validity: an OUT-OF-RANGE range on an IN-PACKAGE file ----
inject "citation range past the end of an in-package file" "citations" "
p = DST + '/primitives/page-separator.json'
d = json.load(open(p))
d['measuredFrom'] = 'registry.manifest.json:99000-99100'
json.dump(d, open(p, 'w'), indent=2)
"

# --- 4b. citation validity: an OUT-OF-RANGE range on an EXTERNAL file ------
# The external range check can only fire when a sibling source tree is actually
# present -- without one, verify_all.py degrades to a WARNING by design. So
# synthesise a minimal sibling tree inside the throwaway copy's parent, then
# cite past the end of it. This proves the range check really range-checks,
# and is the other half of the graceful-degradation behaviour asserted below.
inject "out-of-range citation against a present sibling source tree" "citations" "
import os
sib = os.path.join(os.path.dirname(DST), 'src', 'components')
os.makedirs(sib)
fh = open(os.path.join(sib, 'primitives.jsx'), 'w')
fh.write('line' + chr(10))
fh.close()
p = DST + '/primitives/page-separator.json'
d = json.load(open(p))
d['measuredFrom'] = '../src/components/primitives.jsx:500-600'
json.dump(d, open(p, 'w'), indent=2)
"

# --- 5. citation validity: an IN-PACKAGE citation to a missing file ---------
inject "in-package citation to a file that does not exist" "citations" "
p = DST + '/primitives/badge.json'
d = json.load(open(p))
d['measuredFrom'] = 'sections/does-not-exist.json:1-5'
json.dump(d, open(p, 'w'), indent=2)
"

# --- 6. manifest counts: a hand-bumped, wrong number -----------------------
inject "manifest count bumped by hand to a wrong value" "manifest-counts" "
p = DST + '/registry.manifest.json'
d = json.load(open(p))
d['counts']['sections'] = 22
json.dump(d, open(p, 'w'), indent=2)
"

# --- 7. manifest counts: a count that is right today but stops tracking ----
inject "a real contract file added without the manifest count following" "manifest-counts" "
import shutil
shutil.copy(DST + '/primitives/badge.json', DST + '/primitives/extra-primitive.json')
d = json.load(open(DST + '/primitives/extra-primitive.json'))
d['id'] = 'primitive.extra'
json.dump(d, open(DST + '/primitives/extra-primitive.json', 'w'), indent=2)
al = DST + '/tokens/llm/component-allowlist.json'
a = json.load(open(al))
a['primitives'].append('primitive.extra')
json.dump(a, open(al, 'w'), indent=2)
"

# --- 8. version parity -----------------------------------------------------
inject "allowlistVersion drifting from the allowlist's own version" "version-parity" "
p = DST + '/registry.manifest.json'
d = json.load(open(p))
d['allowlistVersion'] = '9.9.9'
json.dump(d, open(p, 'w'), indent=2)
"

# --- 9. entryPoints self-containment ---------------------------------------
inject "an entryPoint pointing outside the package" "entryPoints" "
p = DST + '/registry.manifest.json'
d = json.load(open(p))
d['entryPoints'].append('../CLONE_SPEC.md')
json.dump(d, open(p, 'w'), indent=2)
"

# --- 10. compliance: a pinned role moved to a DIFFERENT-BUT-VALID policy ---
# This is the case a membership-in-enum check cannot catch.
inject "compliance role repointed to another VALID policy value" "asset-roles" "
p = DST + '/assets/asset-roles.json'
d = json.load(open(p))
assert d['roles']['person.headshot']['generationPolicy'] == 'must-not-reproduce-real-entity'
d['roles']['person.headshot']['generationPolicy'] = 'may-generate-new'
assert d['roles']['person.headshot']['generationPolicy'] in d['generationPolicyEnum']
json.dump(d, open(p, 'w'), indent=2)
"

# --- 11. asset-role guidance stripped --------------------------------------
inject "asset role stripped of its AI-generation guidance" "asset-roles" "
p = DST + '/assets/asset-roles.json'
d = json.load(open(p))
del d['roles']['customer.logo']['guidance']
json.dump(d, open(p, 'w'), indent=2)
"

# --- 12. absolute local path reintroduced ----------------------------------
inject "absolute local machine path reintroduced" "absolute-paths" "
p = DST + '/registry.manifest.json'
d = json.load(open(p))
d['sourceProject']['path'] = chr(47) + 'Users' + chr(47) + 'someone' + chr(47) + 'authkit'
json.dump(d, open(p, 'w'), indent=2)
"

say ""
say "confirming graceful degradation (external citations WARN, never FAIL):"
GTMP="$(mktemp -d)"
cp -R "$REPO" "$GTMP/design-repo"
GOUT="$("$PY" "$GTMP/design-repo/extraction/verify_all.py" 2>&1)"
GCODE=$?
if [ "$GCODE" -ne 0 ]; then
  say "FAIL  a sibling-free copy does NOT verify cleanly"
  printf '%s\n' "$GOUT" | tail -10
  FAIL=$((FAIL + 1))
elif ! printf '%s' "$GOUT" | grep -q "external (no sibling source tree)"; then
  say "FAIL  a sibling-free copy passed but did not report its external citations"
  FAIL=$((FAIL + 1))
else
  say "ok    sibling-free copy passes, reporting external citations as a warning"
  say "      $(printf '%s' "$GOUT" | grep 'citations:')"
  PASS=$((PASS + 1))
fi
rm -rf "$GTMP"

say ""
say "confirming the REAL repo still passes, unmutated:"
if "$PY" "$REPO/extraction/verify_all.py" >/dev/null 2>&1; then
  say "ok    real repo passes verify_all.py"
  PASS=$((PASS + 1))
else
  say "FAIL  real repo does NOT pass verify_all.py"
  "$PY" "$REPO/extraction/verify_all.py" 2>&1 | tail -20
  FAIL=$((FAIL + 1))
fi

say ""
say "prove_drift: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
