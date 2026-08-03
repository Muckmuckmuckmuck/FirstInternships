#!/usr/bin/env python3
"""
Import cleaned recruiter contacts into `firms` with contact_type='recruiter'.

Keyed by email as the primary key, so re-running is idempotent (upsert) and can never
collide with the domain-keyed company rows.

Stale sources (career-fair PDFs older than 2022) are imported as active=false: the data
is preserved, but users never see it, because an 8-year-old contact almost certainly
bounces and bounces are what damage the sender's Gmail reputation.

Usage: python3 scripts/import_recruiters.py
"""
import json, os, sys, urllib.request

# Never hardcode credentials. Run with:
#   SUPABASE_PROJECT_REF=xxx SUPABASE_PAT=sbp_xxx python3 scripts/import_recruiters.py
REF = os.environ.get('SUPABASE_PROJECT_REF', '')
PAT = os.environ.get('SUPABASE_PAT', '')
if not REF or not PAT:
    sys.exit('Set SUPABASE_PROJECT_REF and SUPABASE_PAT in the environment.')
HERE = os.path.dirname(__file__)


def runsql(q):
    req = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{REF}/database/query',
        data=json.dumps({'query': q}).encode(),
        headers={'Authorization': f'Bearer {PAT}', 'Content-Type': 'application/json',
                 'User-Agent': 'Mozilla/5.0'},
        method='POST')
    return json.load(urllib.request.urlopen(req))


def q(v):
    """SQL-quote a value (or NULL)."""
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def main():
    recs = json.load(open(os.path.join(HERE, 'out', 'recruiters_clean.json')))
    print(f'loaded {len(recs)} clean records')

    before = runsql("select count(*) c from firms;")[0]['c']

    # Guard: an email must never collide with an existing company row id.
    emails = [r['email'] for r in recs]
    inlist = ','.join(q(e) for e in emails)
    clash = runsql(f"select id from firms where id in ({inlist}) and contact_type='company';")
    if clash:
        print('WARNING: id collision with company rows:', clash[:5])

    rows = []
    for r in recs:
        active = 'false' if r.get('stale_source') else 'true'
        rows.append(
            "(" + ",".join([
                q(r['email']),                      # id (email = natural unique key)
                q(r['company'] or r['domain']),     # name
                q(r['company'] or r['domain']),     # dba
                q(r['domain']),                     # domain
                q(r['email']),                      # email
                q(r['contact_name']),               # cname
                q(r['contact_title']),              # ctitle
                q(r['industry'] or 'Other'),        # industry
                q(r['contact_title'] or 'Recruiter'),  # type (shown as Category)
                q(r['city']),                       # city
                q(r['state']),                      # state
                "'recruiter'",                      # source
                "'recruiter'",                      # contact_type
                "'unknown'",                        # verification_status -> 1 credit tier
                q(r['source_url']),                 # source_url  (provenance)
                q(r['context_snippet']),            # context_snippet (proof)
                q(r['collected_at'] or None),       # collected_at
                active,                             # active
            ]) + ")"
        )

    COLS = ("id,name,dba,domain,email,cname,ctitle,industry,type,city,state,source,"
            "contact_type,verification_status,source_url,context_snippet,collected_at,active")

    B = 100
    total = 0
    for i in range(0, len(rows), B):
        chunk = rows[i:i + B]
        sql = (f"insert into public.firms ({COLS}) values " + ",".join(chunk) +
               " on conflict (id) do update set "
               "name=excluded.name, dba=excluded.dba, domain=excluded.domain, "
               "email=excluded.email, cname=excluded.cname, ctitle=excluded.ctitle, "
               "industry=excluded.industry, type=excluded.type, city=excluded.city, "
               "state=excluded.state, source=excluded.source, "
               "contact_type=excluded.contact_type, source_url=excluded.source_url, "
               "context_snippet=excluded.context_snippet, "
               "collected_at=excluded.collected_at, active=excluded.active;")
        runsql(sql)
        total += len(chunk)
        print(f'  imported {total}/{len(rows)}')

    after = runsql("select count(*) c from firms;")[0]['c']
    print(f'\nfirms: {before} -> {after}  (+{after - before})')
    print('\n=== BY TIER ===')
    for r in runsql("""select contact_type, active, count(*) c
                       from firms group by 1,2 order by 1,2;"""):
        print(' ', r)
    print('\n=== SAMPLE ===')
    for r in runsql("""select cname, ctitle, dba, email, city, state
                       from firms where contact_type='recruiter' and active
                       order by random() limit 8;"""):
        print(' ', r)


if __name__ == '__main__':
    main()
