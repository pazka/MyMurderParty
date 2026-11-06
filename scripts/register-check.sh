#!/usr/bin/env bash
# CI copy of what `hosh-deploy register <app>` validates on the box (hosh-migration scripts/hosh-deploy,
# do_register, 2026-11-06), so a compose/conf change that the box would refuse fails here first.
#   bash scripts/register-check.sh <dir>   (<dir> = a /srv/<app> stand-in: deploy/, docker-compose(.example).yml,
#                                           .env.example and the env file named by ENV_FILE)
set -euo pipefail
dir="$1"
die() { echo "register-check: ✗ $*" >&2; exit 1; }
declare -A C
while IFS= read -r line || [ -n "$line" ]; do
  [[ "$line" =~ ^[[:space:]]*(#|$) ]] && continue
  [[ "$line" =~ ^([A-Z_0-9]+)=(.*)$ ]] || die "bad conf line: $line"
  case " APP REPO DIR ENV_FILE SERVICE IMAGE_VAR IMAGE_REPO HOST BIND HEALTH POST_DEPLOY ROUTE COMPOSE_SHA256 " in
    *" ${BASH_REMATCH[1]} "*) C[${BASH_REMATCH[1]}]="${BASH_REMATCH[2]}" ;;
    *) die "unknown key ${BASH_REMATCH[1]}" ;;
  esac
done < "$dir/deploy/hosh-deploy.conf"
app="${C[SERVICE]}"
[[ "$app" =~ ^[a-z][a-z0-9-]{1,30}$ ]] || die "bad app name '$app' (valid_app)"
for k in SERVICE IMAGE_VAR IMAGE_REPO ENV_FILE HOST BIND HEALTH; do [ -n "${C[$k]:-}" ] || die "$k missing"; done
[[ "${C[IMAGE_REPO]}" =~ ^ghcr\.io/pazka/[a-z0-9._-]+$ ]] || die "IMAGE_REPO must be ghcr.io/pazka/<name>"
[[ "${C[BIND]}" =~ ^127\.0\.0\.1:[0-9]{2,5}$ ]] || die "BIND must be 127.0.0.1:<port>"
[[ "${C[HOST]}" =~ ^[a-z0-9.-]+$ ]] && [[ "${C[HEALTH]}" =~ ^/[A-Za-z0-9/_.-]*$ ]] && [[ "${C[IMAGE_VAR]}" =~ ^[A-Z][A-Z0-9_]*$ ]] || die "bad HOST/HEALTH/IMAGE_VAR"
[ -f "$dir/docker-compose.yml" ] || cp "$dir/docker-compose.example.yml" "$dir/docker-compose.yml"
[ -f "$dir/${C[ENV_FILE]}" ] || die "$dir/${C[ENV_FILE]} missing"
grep -q "^${C[IMAGE_VAR]}=" "$dir/${C[ENV_FILE]}" || die "${C[IMAGE_VAR]} not in ${C[ENV_FILE]} (hosh-deploy rewrites that line)"
grep -q "\${${C[IMAGE_VAR]}" "$dir/docker-compose.yml" || die "compose image does not use \${${C[IMAGE_VAR]}}"
req="$(sed -n 's/^# required:[[:space:]]*//p' "$dir/.env.example" | head -n1)"
for k in $req; do
  [[ "$k" =~ ^[A-Z][A-Z0-9_]*$ ]] || die ".env.example # required: bad name '$k'"
  [ -n "$(sed -n "s/^$k=//p" "$dir/${C[ENV_FILE]}" | tail -n1 | sed -e "s/^'\(.*\)'$/\1/" -e 's/^"\(.*\)"$/\1/')" ] || die "$k is empty"
done
echo "-- compose hardening check"
docker compose --project-directory "$dir" --env-file "$dir/${C[ENV_FILE]}" -f "$dir/docker-compose.yml" config --format json \
  | python3 -c '
import json, sys
svc, bind = sys.argv[1], sys.argv[2]
d = json.load(sys.stdin); bad = []
if svc not in d.get("services", {}): bad.append("service %s not in compose" % svc)
for name, s in d.get("services", {}).items():
    p = name + ": "
    u = str(s.get("user", "")).split(":")[0]
    if u in ("", "0", "root"): bad.append(p + "user must be non-root")
    if not s.get("read_only"): bad.append(p + "read_only: true required")
    if "ALL" not in (s.get("cap_drop") or []): bad.append(p + "cap_drop: [ALL] required")
    if s.get("cap_add"): bad.append(p + "cap_add not allowed")
    if not any(o.replace(" ", "") in ("no-new-privileges:true", "no-new-privileges") for o in (s.get("security_opt") or [])): bad.append(p + "no-new-privileges required")
    if s.get("privileged"): bad.append(p + "privileged not allowed")
    for k in ("network_mode", "pid", "ipc", "userns_mode", "uts"):
        if str(s.get(k, "")).startswith("host"): bad.append(p + k + ": host not allowed")
    if s.get("devices"): bad.append(p + "devices not allowed")
    for v in s.get("volumes") or []:
        if v.get("type") not in ("volume", "tmpfs"): bad.append(p + "only named volumes/tmpfs (got %s %s)" % (v.get("type"), v.get("source")))
    for pt in s.get("ports") or []:
        if pt.get("host_ip") not in ("127.0.0.1", "::1"): bad.append(p + "ports must bind 127.0.0.1")
        elif "%s:%s" % (pt.get("host_ip"), pt.get("published")) != bind: bad.append(p + "published %s:%s != BIND %s" % (pt.get("host_ip"), pt.get("published"), bind))
    if not s.get("healthcheck") or s["healthcheck"].get("disable"): bad.append(p + "healthcheck required")
print("\n".join("  ✗ " + b for b in bad) if bad else "  ✓ hardened (non-root, read-only, cap_drop ALL, no-new-privileges, no host access, loopback port, healthcheck)")
sys.exit(1 if bad else 0)' "${C[SERVICE]}" "${C[BIND]}" || die "compose does not meet the box standard"
grep -q "Host(\`\(@@HOST@@\|__HOST__\)\`)" "$dir/deploy/traefik-route.yml.tmpl" || die "route template has no Host(@@HOST@@) rule"
grep -q '__APP__\|__PORT__' "$dir/deploy/traefik-route.yml.tmpl" && die "route template has unrendered __APP__/__PORT__"
echo "register-check: ✓ $app (${C[HOST]} → ${C[BIND]}, health ${C[HEALTH]})"
