#!/usr/bin/env python3
"""
ETL for named recruiter contacts (the "Contacts" tier).

Reads the raw CSV exports (three different shapes), normalizes them, applies quality
filters, dedupes, and writes clean records ready for import into `firms` with
contact_type='recruiter'.

Why the filters are strict: these are named individuals (personal data), and every
bounce damages the sending user's Gmail reputation, which is the product's core
promise. A smaller, clean list beats a big, dirty one.

Usage:  python3 scripts/etl_recruiters.py
Output: scripts/out/recruiters_clean.json  +  a printed report
"""
import csv, json, os, re, sys, hashlib
from collections import Counter, defaultdict

SRC = os.path.expanduser("~/Downloads")
FILES = [
    "internship_recruiter_contacts.csv",
    "internship_recruiter_contacts (1).csv",
    "internship_recruiter_contacts (2).csv",
    "internship_contacts_2026.csv",
    "state_gov_stem_internship_emails.csv",
    "state_gov_stem_internship_emails (1).csv",
    "table-1785714695057.csv",
]

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")

# Free/personal mail hosts: never a legitimate published work contact for this purpose.
PERSONAL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
    "aol.com", "me.com", "msn.com", "live.com", "comcast.net", "protonmail.com",
}

# Role inboxes. We already ship ~11k of these in the Companies tier. The entire point
# of this new tier is a NAMED human, so a role address adds nothing and dilutes it.
ROLE_LOCALPARTS = {
    "careers", "career", "jobs", "job", "hr", "humanresources", "recruiting",
    "recruitment", "recruiter", "talent", "hiring", "employment", "info", "contact",
    "hello", "admin", "office", "apply", "applications", "internship", "internships",
    "interns", "intern", "joinourteam", "team", "people", "staff", "support",
    "inquiries", "general", "mail", "email", "uradmin", "dmgsec",
}

def norm_space(s):
    return re.sub(r"\s+", " ", (s or "").strip())

def clean_email(raw):
    """Return a normalized email or None. Strips <>, mailto:, whitespace, trailing punctuation."""
    e = norm_space(raw).strip("<>").strip()
    e = re.sub(r"^mailto:", "", e, flags=re.I)
    e = e.strip().strip(".,;:")
    if not e:
        return None
    # Some rows contain multiple addresses; take the first plausible one.
    parts = re.split(r"[;,\s]+", e)
    for p in parts:
        p = p.strip().strip("<>").strip(".,;:")
        if EMAIL_RE.match(p):
            return p.lower()
    return None

def first_person(name):
    """Rows sometimes pack two people into one field ('Joseph Jones / Frank Elgin')."""
    n = norm_space(name)
    if not n:
        return ""
    n = re.split(r"\s*/\s*|\s+and\s+|;", n)[0]
    n = norm_space(n)
    # Drop trailing credentials, e.g. "Mandy C. Andrews, LMSW"
    n = re.sub(r",\s*(Ph\.?D\.?|M\.?Ed\.?|M\.?S\.?|LMSW|MSW|ABPP|CAGS|Psy\.?D\.?|MBA|SHRM.*)\.?$", "", n, flags=re.I)
    return norm_space(n)

def split_city_state(v):
    """'Billings, MT' -> ('Billings','MT')"""
    v = norm_space(v)
    if not v:
        return "", ""
    if "," in v:
        c, s = v.rsplit(",", 1)
        return norm_space(c), norm_space(s).upper()[:2]
    return v, ""

def source_year(url):
    m = re.findall(r"(19|20)\d{2}", url or "")
    yrs = [int(y) for y in re.findall(r"((?:19|20)\d{2})", url or "")]
    return max(yrs) if yrs else None

def load_rows():
    """Read every file, tagging each row with which file it came from.

    Any extra CSV paths passed on the command line are read too, so new batches can be
    processed alongside the originals and deduped against them in one pass.
    """
    rows, seen_hashes, file_report = [], {}, []
    paths = [os.path.join(SRC, f) for f in FILES] + sys.argv[1:]
    for path in paths:
        fn = os.path.basename(path)
        if not os.path.exists(path):
            file_report.append((fn, "MISSING", 0))
            continue
        with open(path, "rb") as fh:
            digest = hashlib.md5(fh.read()).hexdigest()
        if digest in seen_hashes:
            file_report.append((fn, f"identical to {seen_hashes[digest]}", 0))
            continue
        seen_hashes[digest] = fn
        with open(path, newline="", encoding="utf-8-sig") as fh:
            rdr = list(csv.DictReader(fh))
        for r in rdr:
            r["__file"] = fn
        rows.extend(rdr)
        file_report.append((fn, "read", len(rdr)))
    return rows, file_report

def normalize(r):
    """Map any of the three CSV shapes onto one record."""
    keys = {k.lower().strip(): k for k in r.keys() if k}

    def g(*names):
        for n in names:
            k = keys.get(n)
            if k and r.get(k) is not None:
                return norm_space(r[k])
        return ""

    email = clean_email(g("contact_email", "email"))
    name = first_person(g("contact_name", "name", "contact"))
    company = g("company", "organization")
    title = g("contact_title", "role", "title")
    domain = g("domain").lower()
    city = g("city")
    state = g("state")
    if not city:
        city, state2 = split_city_state(g("city, state", "city,state"))
        state = state or state2
    return {
        "email": email,
        "contact_name": name,
        "contact_title": title,
        "company": company,
        "domain": domain,
        "industry": g("industry"),
        "city": city,
        "state": (state or "").upper()[:2],
        "source_url": g("source_url"),
        "context_snippet": g("context_snippet")[:600],
        "page_type": g("page_type"),
        "collected_at": g("collected_at"),
        "__file": r.get("__file", ""),
    }

def completeness(rec):
    """Used to pick the best record when the same email appears in several files."""
    score = 0
    for f, w in (("source_url", 3), ("context_snippet", 2), ("contact_name", 2),
                 ("contact_title", 1), ("company", 1), ("city", 1), ("industry", 1)):
        if rec.get(f):
            score += w
    return score

def main():
    raw, file_report = load_rows()
    recs = [normalize(r) for r in raw]

    rejects = Counter()
    kept = {}
    for rec in recs:
        e = rec["email"]
        if not e:
            rejects["no/invalid email"] += 1
            continue
        local, _, dom = e.partition("@")
        if dom in PERSONAL_DOMAINS:
            rejects["personal email host"] += 1
            continue
        if re.sub(r"[^a-z]", "", local) in ROLE_LOCALPARTS:
            rejects["role inbox (already in Companies tier)"] += 1
            continue
        if not rec["contact_name"]:
            rejects["no named person"] += 1
            continue
        if not rec["company"]:
            rejects["no company"] += 1
            continue
        if not rec["domain"]:
            rec["domain"] = dom
        # keep the most complete version of a duplicate email
        prev = kept.get(e)
        if prev is None or completeness(rec) > completeness(prev):
            kept[e] = rec

    dupes = sum(1 for r in recs if r["email"]) - len(
        {r["email"] for r in recs if r["email"]}
    )

    out = list(kept.values())
    for r in out:
        yr = source_year(r["source_url"])
        r["source_year"] = yr
        # Sources older than ~4 years are very likely stale (people change jobs).
        r["stale_source"] = bool(yr and yr < 2022)

    os.makedirs(os.path.join(os.path.dirname(__file__), "out"), exist_ok=True)
    outpath = os.path.join(os.path.dirname(__file__), "out", "recruiters_clean.json")
    with open(outpath, "w") as fh:
        json.dump(out, fh, indent=1)

    # ---- report ----
    print("=== FILES ===")
    for fn, status, n in file_report:
        print(f"  {fn:48} {status:28} {n}")
    print(f"\nraw rows parsed: {len(recs)}")
    print("\n=== REJECTED ===")
    for k, v in rejects.most_common():
        print(f"  {v:5}  {k}")
    print(f"\nduplicate email rows collapsed: {dupes}")
    print(f"\n=== CLEAN UNIQUE CONTACTS: {len(out)} ===")
    print(f"  with source_url : {sum(1 for r in out if r['source_url'])}")
    print(f"  with snippet    : {sum(1 for r in out if r['context_snippet'])}")
    print(f"  with title      : {sum(1 for r in out if r['contact_title'])}")
    print(f"  stale (<2022)   : {sum(1 for r in out if r['stale_source'])}")
    print("\n  top states:", Counter(r["state"] for r in out if r["state"]).most_common(8))
    print("  top industries:", Counter(r["industry"] for r in out if r["industry"]).most_common(6))
    print(f"\nwrote {outpath}")

if __name__ == "__main__":
    main()
