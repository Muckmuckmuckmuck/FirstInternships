#!/usr/bin/env python3
"""
Activation funnel: signup -> onboarding (per screen) -> Gmail -> draft -> send.

Most of this is derived from state that already exists (profiles, gmail_accounts,
send_queue), so it works retroactively. The per-onboarding-screen breakdown comes from
`onboarding_step` events and only covers users who signed up after that shipped.

Usage:
  SUPABASE_PROJECT_REF=xxx SUPABASE_PAT=sbp_xxx python3 scripts/funnel.py
  ...optionally with --since 2026-07-24   (ignore users before a cutoff)
"""
import json, os, sys, urllib.request

REF = os.environ.get("SUPABASE_PROJECT_REF", "")
PAT = os.environ.get("SUPABASE_PAT", "")
if not REF or not PAT:
    sys.exit("Set SUPABASE_PROJECT_REF and SUPABASE_PAT in the environment.")

SINCE = None
if "--since" in sys.argv:
    SINCE = sys.argv[sys.argv.index("--since") + 1]


def runsql(q):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{REF}/database/query",
        data=json.dumps({"query": q}).encode(),
        headers={"Authorization": f"Bearer {PAT}", "Content-Type": "application/json",
                 "User-Agent": "Mozilla/5.0"}, method="POST")
    return json.load(urllib.request.urlopen(req))


def bar(n, top, width=30):
    return "#" * int(round((n / max(1, top)) * width))


where = f"and p.created_at >= date '{SINCE}'" if SINCE else ""
scope = f"users who signed up on/after {SINCE}" if SINCE else "all users"

# ── main funnel (derived from state, so it works retroactively) ──────────────
f = runsql(f"""
with u as (
  select p.id,
    (p.interest is not null and p.interest <> '')                as onboarded,
    exists(select 1 from gmail_accounts g where g.user_id=p.id)  as gmail,
    exists(select 1 from events e where e.user_id=p.id
             and e.event='gmail_connect_clicked')                as tried_gmail,
    exists(select 1 from events e where e.user_id=p.id
             and e.event='generate_email')                       as drafted,
    exists(select 1 from send_queue s where s.user_id=p.id)      as sent
  from profiles p where true {where})
select count(*) signed_up,
       count(*) filter (where onboarded)   finished_onboarding,
       count(*) filter (where tried_gmail) tried_gmail,
       count(*) filter (where gmail)       connected_gmail,
       count(*) filter (where drafted)     drafted,
       count(*) filter (where sent)        sent
from u;""")[0]

print(f"ACTIVATION FUNNEL  ({scope})\n")
steps = [("Signed up", "signed_up"), ("Finished onboarding", "finished_onboarding"),
         ("Clicked connect Gmail", "tried_gmail"), ("Connected Gmail", "connected_gmail"),
         ("Drafted an email", "drafted"), ("Sent an email", "sent")]
top, prev = f["signed_up"], None
for label, k in steps:
    n = f[k]
    drop = "" if prev is None else (f"   -{prev-n} lost" if prev - n > 0 else "")
    pct = f"{round(n/max(1,top)*100):>3}%"
    print(f"  {label:24} {n:3}/{top} {pct}  {bar(n, top)}{drop}")
    prev = n

# ── which onboarding screen loses them (event-based; new signups only) ───────
rows = runsql(f"""
select props->>'name' screen, min((props->>'step')::int) step,
       count(distinct user_id) reached
from events where event='onboarding_step' {where.replace('p.created_at','created_at')}
group by 1 order by 2;""")
print("\nONBOARDING, BY SCREEN (users who reached each)")
if not rows:
    print("  no data yet — this starts collecting from the next signup")
else:
    t, prev = rows[0]["reached"], None
    for r in rows:
        n = r["reached"]
        drop = "" if prev is None else (f"   -{prev-n} lost here" if prev - n > 0 else "")
        print(f"  {r['step']}. {r['screen']:18} {n:3}  {bar(n, t, 22)}{drop}")
        prev = n

# ── stuck users, so you can act on them ─────────────────────────────────────
print("\nSTUCK USERS (signed up, never sent)")
for r in runsql(f"""
select p.email, p.created_at::date::text joined,
  case when p.interest is null or p.interest='' then 'never finished onboarding'
       when not exists(select 1 from gmail_accounts g where g.user_id=p.id) then 'no Gmail connected'
       when not exists(select 1 from events e where e.user_id=p.id and e.event='generate_email') then 'never drafted'
       else 'drafted but never sent' end as stuck_at
from profiles p
where not exists(select 1 from send_queue s where s.user_id=p.id) {where}
order by p.created_at desc;"""):
    print(f"  {(r['email'] or '')[:36]:36} {r['joined']}  {r['stuck_at']}")
