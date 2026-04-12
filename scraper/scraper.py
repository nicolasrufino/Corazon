import hashlib
import os
import time
from datetime import datetime

import requests
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


def push_to_supabase(records: list[dict]) -> None:
    for record in records:
        try:
            supabase.table("opportunities").upsert(record).execute()
        except Exception as e:
            print(f"  Failed to insert {record.get('id')}: {e}")
    print(f"  Pushed {len(records)} records")


# ---------------------------------------------------------------------------
# Scraper 1 — Chicago City Data Portal
# ---------------------------------------------------------------------------

CITY_ENDPOINTS = [
    (
        "https://data.cityofchicago.org/resource/jje6-ixkq.json?$limit=500",
        "human_services",
    ),
    (
        "https://data.cityofchicago.org/resource/v233-ph49.json?$limit=200",
        "mental_health",
    ),
    (
        "https://data.cityofchicago.org/resource/fhy8-j3hw.json?$limit=200",
        "food_bank",
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
            organization = (
                row.get("agency_name")
                or row.get("site_name")
                or row.get("provider_name")
                or ""
            ).strip()
            title = (
                row.get("program_name")
                or row.get("service_type")
                or row.get("program_type")
                or organization
            ).strip()
            address = (
                row.get("address")
                or row.get("site_address")
                or row.get("location_address")
                or ""
            ).strip()
            phone = (row.get("phone") or row.get("phone_number") or "").strip()
            neighborhood = (
                row.get("community_area_name")
                or row.get("community_area")
                or ""
            ).strip()
            raw_category = row.get("category") or row.get("service_type") or default_category
            category = map_category(raw_category) if raw_category != default_category else default_category

            if not organization:
                continue

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
                    "language_support": "Spanish / Bilingual",
                    "source_url": url,
                }
            )

        print(f"  Got {len(rows)} rows from {default_category} endpoint")
        time.sleep(1)

    return records


# ---------------------------------------------------------------------------
# Scraper 2 — HRSA Community Health Centers
# ---------------------------------------------------------------------------

def scrape_hrsa() -> list[dict]:
    url = "https://findahealthcenter.hrsa.gov/api/v1.0/sites?q=chicago%2C+il&pageSize=100"
    print(f"  Fetching {url} ...")

    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"  Error fetching HRSA data: {e}")
        return []

    # HRSA wraps results in various shapes depending on version
    sites = (
        data.get("sites")
        or data.get("results")
        or data.get("data")
        or (data if isinstance(data, list) else [])
    )

    records = []
    for site in sites:
        name = (site.get("site_name") or site.get("name") or "").strip()
        address = (
            site.get("site_address")
            or site.get("address")
            or site.get("street_address")
            or ""
        ).strip()
        phone = (site.get("site_phone") or site.get("phone") or "").strip()
        city = (site.get("site_city") or site.get("city") or "Chicago").strip()

        if not name:
            continue

        records.append(
            {
                "id": make_id(name, address),
                "organization": name,
                "title": f"Health Center — {name}",
                "address": address,
                "phone": phone,
                "location": f"{city}, IL",
                "category": "health",
                "language_support": "Spanish / Bilingual",
                "source_url": url,
            }
        )

    time.sleep(1)
    print(f"  Got {len(records)} HRSA health centers")
    return records


# ---------------------------------------------------------------------------
# Scraper 3 — Eventbrite Latino events
# ---------------------------------------------------------------------------

def parse_date(raw: str) -> str | None:
    """Parse Eventbrite ISO date string to YYYY-MM-DD."""
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

    print(f"  Fetching Eventbrite Latino events ...")
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
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Scraping Chicago city data...")
    city_records = scrape_chicago_city_data()
    push_to_supabase(city_records)

    print("Scraping HRSA health centers...")
    hrsa_records = scrape_hrsa()
    push_to_supabase(hrsa_records)

    print("Scraping Eventbrite Latino events...")
    events = scrape_eventbrite()
    push_to_supabase(events)

    print("Done.")
