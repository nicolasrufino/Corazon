import hashlib
import os
import re
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
EVENTBRITE_API_KEY = os.environ.get("EVENTBRITE_API_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_id(*parts: str) -> str:
    key = "".join(parts)
    return hashlib.sha256(key.encode()).hexdigest()[:20]


def map_category(raw: str) -> str:
    raw = (raw or "").lower()
    if any(w in raw for w in ["mental", "behavioral", "substance", "counseling"]):
        return "mental_health"
    if any(w in raw for w in ["food", "pantry", "nutrition", "meal", "hunger"]):
        return "food_bank"
    if any(w in raw for w in ["legal", "law", "court", "justice"]):
        return "legal"
    if any(w in raw for w in ["housing", "shelter", "homeless"]):
        return "housing"
    if any(w in raw for w in ["language", "english", "esl", "literacy"]):
        return "language"
    if any(w in raw for w in ["health", "clinic", "medical", "dental", "vision"]):
        return "health"
    return "health"


LATINO_KEYWORDS = [
    "latino", "latina", "latinx", "hispanic", "chicano", "chicana",
    "mexican", "puerto rican", "hacu", "lucha", "enlace", "casa central",
    "maldef", "lulac", "mecha", "latin fraternity", "latin sorority",
    "alpfa", "shpe", "sacnas", "nahj",
]


def classify_latino(org: str, title: str) -> str:
    """Return 'latino-specific' if the org/title matches known Latino keywords."""
    combined = f"{org} {title}".lower()
    if any(kw in combined for kw in LATINO_KEYWORDS):
        return "latino-specific"
    return "general"


def push_to_supabase(records: list[dict]) -> None:
    for record in records:
        try:
            supabase.table("opportunities").upsert(record).execute()
        except Exception as e:
            print(f"  Failed to insert {record.get('id')}: {e}")
    print(f"  Pushed {len(records)} records")


# ---------------------------------------------------------------------------
# Scraper 1 — Chicago City Data Portal (verified working endpoints)
# ---------------------------------------------------------------------------

CITY_ENDPOINTS = [
    # Family & Support Services delegate agencies — 1300+ social service orgs
    (
        "https://data.cityofchicago.org/resource/jmw7-ijg5.json?$limit=500",
        "human_services",
    ),
    # CDPH Mental Health Resources — 170+ behavioral health providers
    (
        "https://data.cityofchicago.org/resource/vcv6-95ym.json?$limit=200",
        "mental_health",
    ),
    # Primary Care Community Health Centers — 120 clinics
    (
        "https://data.cityofchicago.org/resource/cjg8-dbka.json?$limit=200",
        "health",
    ),
    # CDPH Clinic Locations — public health department sites
    (
        "https://data.cityofchicago.org/resource/kcki-hnch.json?$limit=100",
        "health",
    ),
]


def scrape_chicago_city_data() -> list[dict]:
    records = []

    for url, default_category in CITY_ENDPOINTS:
        print(f"  Fetching {url} ...")
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            rows = response.json()
        except Exception as e:
            print(f"  Error fetching {url}: {e}")
            time.sleep(1)
            continue

        for row in rows:
            # Each dataset uses slightly different field names
            organization = (
                row.get("agency")
                or row.get("organization")
                or row.get("facility")
                or row.get("site_name")
                or row.get("agency_name")
                or ""
            ).strip()
            title = (
                row.get("program_model")
                or row.get("site_name")
                or row.get("clinic_type")
                or row.get("program_name")
                or organization
            ).strip()
            address = (
                row.get("address")
                or row.get("street_address")
                or row.get("site_address")
                or ""
            ).strip()
            phone = (
                row.get("phone")
                or row.get("phone_number")
                or row.get("main_phone")
                or row.get("phone_1")
                or ""
            ).strip()
            neighborhood = (
                row.get("community_area")
                or row.get("community_area_name")
                or ""
            ).strip()

            # Mental health dataset has richer category info
            raw_category = (
                row.get("behavioral_services_types")
                or row.get("clinic_type")
                or row.get("division")
                or default_category
            )
            if isinstance(raw_category, list):
                raw_category = " ".join(raw_category)
            category = map_category(raw_category) if raw_category != default_category else default_category

            # Extra fields from mental health dataset
            languages = row.get("other_languages", "")
            lang_support = "Spanish / Bilingual"
            if languages and "spanish" in languages.lower():
                lang_support = "Spanish / Bilingual (confirmed)"

            if not organization:
                continue

            focus = classify_latino(organization, title)
            records.append(
                {
                    "id": make_id(organization, address),
                    "organization": organization,
                    "title": title,
                    "address": address,
                    "phone": phone,
                    "neighborhood": neighborhood,
                    "location": "Chicago, IL",
                    "category": category,
                    "language_support": lang_support,
                    "source_url": url.split("?")[0],
                    "tags": [focus],
                }
            )

        print(f"  Got {len(rows)} rows from {default_category} endpoint")
        time.sleep(1)

    return records


# ---------------------------------------------------------------------------
# Scraper 2 — Chicago Senior + Warming Centers (replaces dead HRSA API)
# ---------------------------------------------------------------------------

EXTRA_ENDPOINTS = [
    # Senior centers
    (
        "https://data.cityofchicago.org/resource/qhfc-4cw2.json?$limit=100",
        "health",
    ),
    # Warming centers (shelters)
    (
        "https://data.cityofchicago.org/resource/h243-v2q5.json?$limit=300",
        "housing",
    ),
]


def scrape_extra_city_data() -> list[dict]:
    records = []

    for url, default_category in EXTRA_ENDPOINTS:
        print(f"  Fetching {url} ...")
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            rows = response.json()
        except Exception as e:
            print(f"  Error fetching {url}: {e}")
            time.sleep(1)
            continue

        for row in rows:
            organization = (
                row.get("site_name")
                or row.get("program")
                or ""
            ).strip()
            title = (
                row.get("program")
                or row.get("site_type")
                or organization
            ).strip()
            address = (row.get("address") or "").strip()
            phone = (row.get("phone") or "").strip()

            if not organization:
                continue

            focus = classify_latino(organization, title)
            records.append(
                {
                    "id": make_id(organization, address),
                    "organization": organization,
                    "title": title,
                    "address": address,
                    "phone": phone,
                    "location": "Chicago, IL",
                    "category": default_category,
                    "language_support": "Spanish / Bilingual",
                    "source_url": url.split("?")[0],
                    "tags": [focus],
                }
            )

        print(f"  Got {len(rows)} rows from {default_category} endpoint")
        time.sleep(1)

    return records


# ---------------------------------------------------------------------------
# Scraper 3 — Eventbrite Latino events
# ---------------------------------------------------------------------------

def parse_date(raw: str) -> str | None:
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw).strftime("%Y-%m-%d")
    except Exception:
        return None


def scrape_eventbrite() -> list[dict]:
    if not EVENTBRITE_API_KEY:
        print("  EVENTBRITE_API_KEY not set — skipping")
        return []

    url = (
        "https://www.eventbriteapi.com/v3/events/search/"
        "?location.address=Chicago,IL&q=latino&expand=venue,organizer&page_size=50"
    )
    headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}

    print("  Fetching Eventbrite Latino events ...")
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"  Error fetching Eventbrite data: {e}")
        return []

    events = data.get("events", [])
    records = []

    for event in events:
        event_id = event.get("id", "")
        title = (event.get("name") or {}).get("text", "").strip()
        description_raw = (event.get("description") or {}).get("text", "") or ""
        description = description_raw[:300].strip()

        venue = event.get("venue") or {}
        venue_address = venue.get("address") or {}
        address = (venue_address.get("localized_address_display") or "").strip()
        city = (venue_address.get("city") or "Chicago").strip()

        start_local = (event.get("start") or {}).get("local", "")
        event_date = parse_date(start_local)

        event_url = event.get("url", "")
        organizer = (event.get("organizer") or {}).get("name", "").strip()

        if not title:
            continue

        records.append(
            {
                "id": make_id(event_id),
                "organization": organizer,
                "title": title,
                "description": description,
                "address": address,
                "location": f"{city}, IL" if city else "Chicago, IL",
                "category": "event",
                "event_date": event_date,
                "url": event_url,
                "source_url": event_url,
                "language_support": "Spanish / Bilingual",
            }
        )

    time.sleep(1)
    print(f"  Got {len(records)} Eventbrite events")
    return records


# ---------------------------------------------------------------------------
# Scraper 4 — University Latino orgs (CampusGroups + CampusLabs)
# ---------------------------------------------------------------------------

SEARCH_TERMS = ["latino", "hispanic", "latinx", "chicano"]

# CampusGroups schools — return HTML via AJAX
CAMPUS_GROUPS_SCHOOLS = [
    ("UIC", "https://uic.campusgroups.com"),
    ("Northwestern", "https://catsoncampus.northwestern.edu"),
    ("DePaul", "https://dehub.depaul.edu"),
    ("IIT", "https://312.iit.edu"),
]

# CampusLabs Engage schools — return JSON
CAMPUS_LABS_SCHOOLS = [
    ("UChicago", "https://uchicago.campuslabs.com"),
]


def _parse_campus_groups_html(html: str, base_url: str, search_terms: list[str]) -> list[dict]:
    """Extract org name and URL from CampusGroups AJAX response.
    Handles both ?club_id= links and /org-slug/ links."""
    soup = BeautifulSoup(html, "html.parser")
    orgs = []
    seen = set()

    for link in soup.find_all("a", href=True):
        href = link["href"]
        name = link.get_text(strip=True)
        if not name:
            continue

        # Match ?club_id= style links
        club_match = re.search(r"club_id=(\d+)", href)
        if club_match:
            org_key = club_match.group(1)
        # Match /org-slug/ style links — only if name contains a search term
        elif any(t in name.lower() for t in search_terms):
            # Skip generic nav links
            if href.startswith("http") or href.startswith("/"):
                org_key = name.lower()
            else:
                continue
        else:
            continue

        if org_key in seen:
            continue
        seen.add(org_key)

        full_url = href if href.startswith("http") else f"{base_url}{href}"
        orgs.append({
            "name": name,
            "club_id": org_key,
            "url": full_url.strip(),
        })
    return orgs


def scrape_campus_groups(school_name: str, base_url: str) -> list[dict]:
    """Scrape a CampusGroups school for Latino orgs."""
    seen_ids = set()
    records = []

    for term in SEARCH_TERMS:
        url = f"{base_url}/club_signup?search={term}&ax=1"
        try:
            response = requests.get(
                url,
                headers={"X-Requested-With": "XMLHttpRequest"},
                timeout=15,
            )
            response.raise_for_status()
            orgs = _parse_campus_groups_html(response.text, base_url, SEARCH_TERMS)
        except Exception as e:
            print(f"    Error searching '{term}' at {school_name}: {e}")
            time.sleep(1)
            continue

        for org in orgs:
            if org["club_id"] in seen_ids:
                continue
            seen_ids.add(org["club_id"])

            records.append({
                "id": make_id(school_name, org["club_id"]),
                "organization": org["name"],
                "title": f"{org['name']} — {school_name}",
                "description": f"Latino/Hispanic student organization at {school_name}",
                "url": org["url"],
                "source_url": org["url"],
                "location": "Chicago, IL",
                "category": "event",
                "language_support": "Spanish / Bilingual",
                "tags": ["student org", school_name.lower(), "latino"],
            })

        time.sleep(1)

    return records


def scrape_campus_labs(school_name: str, base_url: str) -> list[dict]:
    """Scrape a CampusLabs Engage school for Latino orgs (JSON API)."""
    seen_ids = set()
    records = []

    for term in SEARCH_TERMS:
        url = f"{base_url}/engage/api/discovery/search/organizations?query={term}&top=50"
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            print(f"    Error searching '{term}' at {school_name}: {e}")
            time.sleep(1)
            continue

        items = data.get("value", [])
        for item in items:
            org_id = str(item.get("Id", ""))
            if org_id in seen_ids:
                continue
            seen_ids.add(org_id)

            name = (item.get("Name") or "").strip()
            description = (item.get("Summary") or item.get("Description") or "").strip()
            if description:
                description = re.sub(r"<[^>]+>", "", description)[:300].strip()
            website_key = item.get("WebsiteKey", "")
            org_url = f"{base_url}/engage/organization/{website_key}" if website_key else ""

            if not name:
                continue

            records.append({
                "id": make_id(school_name, org_id),
                "organization": name,
                "title": f"{name} — {school_name}",
                "description": description or f"Latino/Hispanic student organization at {school_name}",
                "url": org_url,
                "source_url": org_url,
                "location": "Chicago, IL",
                "category": "event",
                "language_support": "Spanish / Bilingual",
                "tags": ["student org", school_name.lower(), "latino"],
            })

        time.sleep(1)

    return records


def scrape_university_orgs() -> list[dict]:
    """Scrape all Chicago-area universities for Latino student orgs."""
    all_records = []

    for school_name, base_url in CAMPUS_GROUPS_SCHOOLS:
        print(f"  Searching {school_name} ...")
        records = scrape_campus_groups(school_name, base_url)
        print(f"    Found {len(records)} orgs")
        all_records.extend(records)

    for school_name, base_url in CAMPUS_LABS_SCHOOLS:
        print(f"  Searching {school_name} ...")
        records = scrape_campus_labs(school_name, base_url)
        print(f"    Found {len(records)} orgs")
        all_records.extend(records)

    return all_records


# ---------------------------------------------------------------------------
# Scraper 5 — HSI (Hispanic-Serving Institutions) in Illinois
# ---------------------------------------------------------------------------

def scrape_hsi_directory() -> list[dict]:
    """Pull Illinois HSIs from the College Scorecard API."""
    url = (
        "https://api.data.gov/ed/collegescorecard/v1/schools.json"
        "?fields=school.name,school.city,school.state,school.school_url,"
        "school.minority_serving.hispanic,latest.student.size"
        "&school.minority_serving.hispanic=1"
        "&school.state=IL"
        "&per_page=100"
        "&api_key=DEMO_KEY"
    )
    print(f"  Fetching College Scorecard HSI data ...")

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"  Error fetching HSI data: {e}")
        return []

    results = data.get("results", [])
    records = []

    for school in results:
        name = (school.get("school.name") or "").strip()
        city = (school.get("school.city") or "").strip()
        state = school.get("school.state", "IL")
        website = school.get("school.school_url", "")
        if website and not website.startswith("http"):
            website = f"https://{website}"
        student_size = school.get("latest.student.size") or 0

        if not name:
            continue

        records.append({
            "id": make_id("hsi", name),
            "organization": name,
            "title": f"{name} — Hispanic-Serving Institution",
            "description": f"{name} is a federally designated Hispanic-Serving Institution in {city}, IL with {student_size:,} students.",
            "url": website,
            "source_url": "https://collegescorecard.ed.gov",
            "location": f"{city}, {state}",
            "category": "scholarship",
            "language_support": "Spanish / Bilingual",
            "tags": ["HSI", "university", "education", "latino"],
        })

    time.sleep(1)
    print(f"  Got {len(records)} Illinois HSIs")
    return records


# ---------------------------------------------------------------------------
# Scraper 6 — Vocational / trade / workforce programs (College Scorecard)
# ---------------------------------------------------------------------------

def scrape_vocational_programs() -> list[dict]:
    """Pull vocational/trade schools in Chicago area from College Scorecard.
    school.institutional_characteristics.level = 3 means less-than-2-year (trade/vocational)
    school.degrees_awarded.predominant = 1 means predominantly certificate programs
    """
    records = []
    for query_params in [
        # Trade/vocational schools in IL
        "school.degrees_awarded.predominant=1&school.state=IL&per_page=100",
        # 2-year schools (community colleges not already covered as HSIs)
        "school.institutional_characteristics.level=2&school.state=IL&school.minority_serving.hispanic=0&per_page=50",
    ]:
        url = (
            f"https://api.data.gov/ed/collegescorecard/v1/schools.json"
            f"?fields=school.name,school.city,school.state,school.school_url,"
            f"latest.student.size,latest.student.demographics.race_ethnicity.hispanic"
            f"&{query_params}"
            f"&api_key=DEMO_KEY"
        )
        print(f"  Fetching vocational/trade data ...")
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            print(f"  Error: {e}")
            time.sleep(1)
            continue

        results = data.get("results", [])
        for school in results:
            name = (school.get("school.name") or "").strip()
            city = (school.get("school.city") or "").strip()
            website = school.get("school.school_url", "")
            if website and not website.startswith("http"):
                website = f"https://{website}"
            hispanic_pct = school.get("latest.student.demographics.race_ethnicity.hispanic") or 0
            student_size = school.get("latest.student.size") or 0

            if not name:
                continue

            # Only include Chicago-area or schools with significant Hispanic enrollment
            chicago_area = city.lower() in [
                "chicago", "cicero", "berwyn", "oak park", "evanston",
                "aurora", "elgin", "joliet", "waukegan", "melrose park",
            ]
            if not chicago_area and hispanic_pct < 0.15:
                continue

            focus = "latino-specific" if hispanic_pct >= 0.25 else "general"
            desc = f"{name} in {city}, IL"
            if hispanic_pct > 0:
                desc += f" — {hispanic_pct:.0%} Hispanic enrollment"
            if student_size:
                desc += f", {student_size:,} students"

            records.append({
                "id": make_id("vocational", name),
                "organization": name,
                "title": f"{name} — Vocational/Trade Program",
                "description": desc,
                "url": website,
                "source_url": "https://collegescorecard.ed.gov",
                "location": f"{city}, IL",
                "category": "job",
                "language_support": "Spanish / Bilingual" if hispanic_pct >= 0.15 else "",
                "tags": [focus, "vocational", "trade", "workforce"],
            })

        time.sleep(1)

    print(f"  Got {len(records)} vocational/trade programs")
    return records


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Scraping Chicago city data (health, mental health, social services)...")
    city_records = scrape_chicago_city_data()
    push_to_supabase(city_records)

    print("Scraping senior + warming centers...")
    extra_records = scrape_extra_city_data()
    push_to_supabase(extra_records)

    print("Scraping Eventbrite Latino events...")
    events = scrape_eventbrite()
    push_to_supabase(events)

    print("Scraping university Latino orgs...")
    uni_records = scrape_university_orgs()
    push_to_supabase(uni_records)

    print("Scraping HSI directory (Illinois)...")
    hsi_records = scrape_hsi_directory()
    push_to_supabase(hsi_records)

    print("Scraping vocational/trade programs...")
    vocational_records = scrape_vocational_programs()
    push_to_supabase(vocational_records)

    total = len(city_records) + len(extra_records) + len(events) + len(uni_records) + len(hsi_records) + len(vocational_records)
    print(f"Done. {total} total records processed.")
