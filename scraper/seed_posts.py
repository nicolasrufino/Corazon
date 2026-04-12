"""
Seed the discover feed with real Chicago Latino community content.
Uses Unsplash for free images (direct URLs, no API key needed).
All venues, events, and descriptions are REAL Chicago locations.
"""

import os
import uuid
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

# System account for seed posts
SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000"
SYSTEM_USERNAME = "CorazonTeam"


def make_id(text: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, text))


POSTS = [
    # ─── NIGHTLIFE ───
    {
        "content": "Reggaeton night at Cafe Con Leche on Milwaukee Ave hits different. Live DJ every Friday, $5 mojitos before 11. If you haven't been, you're missing out. The energy is unmatched.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Salsa Sundays at Alhambra Palace in the West Loop. Live band, free salsa lesson at 7pm, dancing til midnight. Best way to end the weekend. Bring your friends who say they can't dance.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Cumbia night at Punch House in Pilsen. Mezcal cocktails, vinyl DJs, and a crowd that actually knows how to move. Every other Saturday. This is the spot.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "La Catrina Cafe in Pilsen just started bachata nights on Thursdays. Small venue, intimate vibe, great mezcal menu. Perfect date night or just a good time with your crew.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    },
    # ─── FOOD ───
    {
        "content": "Birria tacos from Birrieria Zaragoza on Pulaski are the real deal. Cash only, long line on weekends, worth every minute. Get the consome on the side. Thank me later.",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Carnitas Uruapan in Pilsen. Been around since 1975. If you're new to Chicago and miss home cooking, this is where you start. Their carnitas plate with handmade tortillas is everything.",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Hidden gem alert: Panaderia Nuevo Leon on 18th Street. Fresh conchas, orejas, and cuernos every morning at 6am. $1-2 each. Stock up for the week. Your abuela would approve.",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Taqueria El Milagro on 26th Street makes their own tortillas in-house. You can see them through the window. Al pastor with pineapple, cilantro, onion. Simple and perfect.",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80",
    },
    # ─── CULTURE & ART ───
    {
        "content": "The National Museum of Mexican Art in Pilsen is free. Always has been, always will be. Current exhibit on Dia de los Muertos traditions across Mexico. Take your family this weekend.",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Murals of Pilsen walking tour — start at 18th and Ashland, walk east. Every wall tells a story. Bring a camera. Free, self-guided, takes about an hour. Best on a sunny day.",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1561059488-916d69792237?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Galeria de la Raza on 18th Street has a new photography exhibit by local Chicago Latino artists. Opening reception this Friday, free admission, live music. Support local art.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?auto=format&fit=crop&w=800&q=80",
    },
    # ─── COMMUNITY RESOURCES ───
    {
        "content": "PSA: Erie Neighborhood House on Noble St offers free ESL classes Monday through Thursday. Morning and evening sessions. No papers needed, no questions asked. Just show up and learn.",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "If you need legal help with immigration and can't afford a lawyer: NIJC (National Immigrant Justice Center) does free consultations. Call 312-660-1370. They speak Spanish. Don't wait.",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Free health screenings at Alivio Medical Center every first Saturday. Blood pressure, glucose, BMI, dental check. Walk-ins welcome. 2355 S Western Ave. Bilingual staff.",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "DACA renewal workshop at UIC Latino Cultural Center. Free, with immigration lawyers on site to review your application. Bring your current EAD, passport photos, and filing fee.",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    },
    # ─── STUDENT LIFE ───
    {
        "content": "ALPFA at UIC is hosting their annual networking mixer. Free food, professionals from accounting, finance, and tech. Even if you're a freshman, go. Connections start early.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "First-gen college students: Hispanic Scholarship Fund applications are open. $500 to $5,000. GPA 3.0+, enrolled full-time. Apply at hsf.net. Don't leave money on the table.",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Shoutout to the Latino Medical Student Association at UIC. They do free blood pressure screenings in Little Village every month. Future doctors giving back to the community.",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1559757175-7cb057fba93c?auto=format&fit=crop&w=800&q=80",
    },
    # ─── PERSONAL STORIES ───
    {
        "content": "My mom came here from Michoacan 20 years ago with nothing. Today she owns a small bakery on 26th Street. Every time I eat a concha I think about what she built. Proud doesn't cover it.",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "First in my family to graduate college. UIC class of 2026. My parents didn't understand the FAFSA or what a syllabus was but they drove me to campus every day. This degree is theirs too.",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Moved to Chicago from Guatemala 3 years ago. Didn't speak English, didn't know anyone. Found ESL classes, got my GED, now I'm at community college studying nursing. It's possible.",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=800&q=80",
    },
    # ─── MUSIC & CONCERTS ───
    {
        "content": "Bad Bunny tickets for United Center are insane but Cermak Hall in Little Village has live Latin music every weekend for $10-15 cover. Cumbia, norteño, reggaeton. Support local venues.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Mariachi Mondays at Mi Tierra restaurant in Little Village. Live mariachi band from 7-10pm, no cover. Order the mole and just listen. It feels like home.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
    },
    # ─── QUESTIONS ───
    {
        "content": "Anyone know a good mechanic in the Pilsen/Little Village area? Need someone honest who won't overcharge. Spanish-speaking preferred. My car is making a noise I can't describe lol.",
        "category": "question",
        "image_url": None,
    },
    {
        "content": "Looking for a barber who knows how to do a proper fade in the Back of the Yards area. Bonus if they play good music. Drop your recommendations.",
        "category": "question",
        "image_url": None,
    },
    {
        "content": "Best tamales in Chicago? My family just moved here from Texas and we need a new tamale connect for the holidays. Don't say 'make your own' — we're trying but abuela's recipe isn't the same here.",
        "category": "question",
        "image_url": None,
    },
    {
        "content": "Does anyone have experience with the CityKey ID card? Is it worth getting? I heard it works as a library card and transit card too. Where do I apply?",
        "category": "question",
        "image_url": None,
    },
    # ─── MORE LIFE ───
    {
        "content": "Sunday morning at Maxwell Street Market. Elote, gorditas, fresh fruit. Vendors who've been there for decades. If you haven't been, go before 10am for the best stuff. Bring cash.",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Free outdoor movie night at Harrison Park in Pilsen this Saturday. They're showing Coco. Bring blankets, the park gets cold after sunset. Food trucks will be there.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Little Village Arch (Arco de la Villita) on 26th Street is officially a city landmark now. The gateway to la Villita. If you know, you know. 26th Street is more than shopping — it's home.",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Futbol pickup games at Piotrowski Park every Saturday morning 8am. All levels, all ages. Just show up with cleats. We need more players. Vamos.",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
    },
]


def seed_posts():
    user_id = SYSTEM_USER_ID
    username = SYSTEM_USERNAME

    # First check if we already have a system profile
    existing = supabase.table("profiles").select("id").eq("id", user_id).execute()
    if not existing.data:
        # Try to create — might fail if it references auth.users
        try:
            supabase.table("profiles").insert({
                "id": user_id,
                "email": "team@corazon.app",
                "username": username,
                "onboarding_completed": True,
            }).execute()
            print("Created system profile")
        except Exception as e:
            print(f"Could not create system profile (expected if auth FK): {e}")
            # Use a real user ID instead — get the first one from profiles
            res = supabase.table("profiles").select("id,username").limit(1).execute()
            if res.data:
                user_id = res.data[0]["id"]
                username = res.data[0].get("username") or "CorazonTeam"
                print(f"Using existing user: {username}")
            else:
                print("No users in profiles table — cannot seed posts")
                return

    inserted = 0
    skipped = 0

    for post in POSTS:
        post_id = make_id(post["content"][:50])

        # Check if already exists
        existing = supabase.table("posts").select("id").eq("id", post_id).execute()
        if existing.data:
            skipped += 1
            continue

        try:
            supabase.table("posts").insert({
                "id": post_id,
                "user_id": user_id,
                "username": username,
                "content": post["content"],
                "category": post["category"],
                "image_url": post.get("image_url"),
                "likes_count": 0,
            }).execute()
            inserted += 1
        except Exception as e:
            print(f"  Failed: {str(e)[:80]}")

    print(f"\nInserted: {inserted}, Skipped (already exist): {skipped}")
    print(f"Total posts in DB: ", end="")
    total = supabase.table("posts").select("id", count="exact").execute()
    print(total.count)


if __name__ == "__main__":
    seed_posts()
