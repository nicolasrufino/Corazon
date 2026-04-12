"""
Seed discover posts — social life, culture, everyday Latino life in Chicago.
Less resources, more vibes. All by Juli.
"""

import os
import uuid
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

JULI_USERNAME = "Juli"


def get_user_id():
    res = supabase.table("profiles").select("id").eq("username", JULI_USERNAME).execute()
    if res.data:
        return res.data[0]["id"]
    res = supabase.table("profiles").select("id").limit(1).execute()
    return res.data[0]["id"] if res.data else None


POSTS = [
    # ─── EVERYDAY LIFE ───
    {
        "content": "The way my mom plays Juan Gabriel at full volume every Saturday morning while cleaning the house. That's not just music, that's a whole cultural experience. If you know, you know. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Walking down 18th Street in Pilsen on a Sunday morning. Smell of fresh pan dulce, someone's radio playing cumbia, kids running around, abuelos sitting outside. This is home. — Juli",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Nobody talks about how hard it is to explain to your non-Latino friends why you can't just 'leave early' from a family party. Bro, my tia hasn't even brought out the second round of food yet. We're here til midnight minimum. — Juli",
        "category": "general",
        "image_url": None,
    },
    {
        "content": "That feeling when you hear someone speaking Spanish at the grocery store and you just feel... safe. Like you're not the only one. Small thing but it means everything when you're far from home. — Juli",
        "category": "story",
        "image_url": None,
    },
    {
        "content": "Chicago winter hit different when you grew up somewhere warm. First winter here my mom wore three jackets and still said 'hace mucho frio.' Five years later she's outside in a hoodie shoveling snow like nothing. Adaptation is real. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Shoutout to every Latino dad who fixes everything with WD-40 and duct tape. My pops fixed the kitchen faucet, the car door, and somehow a laptop with just those two things. Engineers without the degree. — Juli",
        "category": "general",
        "image_url": None,
    },
    # ─── SOCIAL LIFE & GOING OUT ───
    {
        "content": "Friday night plan that never fails: tacos from the street cart on California and 26th, then walk to Punch House for mezcal. Total cost: maybe $30. Better than any fancy downtown dinner. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "If you haven't done a Sunday morning at Maxwell Street Market followed by coffee at Jumping Bean in Pilsen, you haven't experienced Chicago properly. That's the perfect Sunday. Bring cash for the market. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Karaoke nights at La Catrina in Pilsen on Wednesdays. Everyone thinks they're Luis Miguel after two drinks. Honestly the worse you sing the more fun it is. No judgment zone. Bring your whole crew. — Juli",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Summer in Chicago is when we come alive. BBQs in Humboldt Park, volleyball at the beach, elote carts everywhere, music from every car window. We survive winter for these 3 months. Make every day count. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Lowrider car show in Little Village this summer was insane. Custom paint jobs, hydraulics, the whole community out. Kids getting their faces painted, elote lady making bank. This is what culture looks like. — Juli",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
    },
    # ─── FOOD CULTURE ───
    {
        "content": "Hot take: Chicago Mexican food is better than LA Mexican food. I said what I said. The birria here, the street elote, the tamale ladies on every corner. Fight me in the comments. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Rating every elote cart I find in Chicago this summer. Current champion: the lady outside Home Depot on Pulaski. Perfect amount of mayo, lime, and tajin. If you see a red cart with an umbrella, that's the one. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "My abuela's caldo de res recipe could solve world peace. Literally every problem disappears after a bowl. Sick? Caldo. Sad? Caldo. Bad day at work? You already know. Some things medicine can't do that caldo can. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Sunday morning routine: walk to the panaderia, grab a bag of conchas and a champurrado, bring it home, watch novelas with my mom. Cost: $5. Vibes: priceless. This is the life. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    },
    # ─── DATING & RELATIONSHIPS ───
    {
        "content": "Dating as a first-gen Latino in Chicago: 'What do your parents do?' becomes a whole life story about sacrifice, immigration, and why you take school so seriously. The right person will get it. — Juli",
        "category": "general",
        "image_url": None,
    },
    {
        "content": "Best date spots in Pilsen that won't break the bank: Dusek's for cocktails, Thalia Hall rooftop in summer, mural walk on 18th Street, then churros from the cart on Ashland. Romantic and real. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
    },
    # ─── IDENTITY & CULTURE ───
    {
        "content": "Being bicultural means switching between two versions of yourself 50 times a day. Professional English at work, Spanish with familia, Spanglish with friends. It's exhausting but it's also our superpower. We move between worlds. — Juli",
        "category": "story",
        "image_url": None,
    },
    {
        "content": "Took my white friend to a Mexican party. She was shocked we were still going at 2am. Girl, this is the EARLY part. Wait til the tios start requesting norteñas. We don't leave til the sun comes up. — Juli",
        "category": "general",
        "image_url": None,
    },
    {
        "content": "Things that hit different when you're Latino: the smell of Pine-Sol on Saturday mornings, your mom's chancleta threat, the sound of a pressure cooker, getting called by your full government name when you're in trouble. Universal experiences. — Juli",
        "category": "general",
        "image_url": None,
    },
    {
        "content": "My nephew asked me why we have two flags in the house. Told him one is where our family comes from, and one is where we're building our future. We don't choose one or the other. We carry both. — Juli",
        "category": "story",
        "image_url": "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?auto=format&fit=crop&w=800&q=80",
    },
    # ─── SPORTS & FITNESS ───
    {
        "content": "Watching Liga MX at a bar in Little Village is a whole event. Strangers become brothers, everyone's yelling, someone orders a round for the table when there's a goal. Better than any stadium experience. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "6am run along the lakefront trail. Sun coming up over the lake. City waking up. Headphones in, Bad Bunny on shuffle. There's no better way to start the day in Chicago. Free therapy. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Boxing gyms in Latino neighborhoods don't get enough credit. $50/month, real trainers, community vibes. Cicero Boxing Club, Pilsen Boxing, Back of the Yards Athletic Club. Get in shape and make friends. Way better than a fancy gym. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80",
    },
    # ─── FASHION & STYLE ───
    {
        "content": "Thrift stores in Pilsen and Little Village are undefeated. Found a vintage Selena tour tee for $4 at Village Discount last week. The gentrified vintage shops downtown would charge $80 for the same thing. Know your spots. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
    },
    # ─── MORE QUESTIONS ───
    {
        "content": "Where do you go when you miss home? Not home as in your apartment — home as in where you grew up, the country your family left. What's your spot in Chicago that makes the homesickness a little easier? — Juli",
        "category": "question",
        "image_url": None,
    },
    {
        "content": "What's the most underrated neighborhood in Chicago for Latinos? Everyone talks about Pilsen and Little Village but where else should people look? Drop your hidden gems. — Juli",
        "category": "question",
        "image_url": None,
    },
    {
        "content": "Coffee or champurrado? This is a serious question and I need answers. And don't say 'both' — you have to pick one for the rest of your life. Go. — Juli",
        "category": "question",
        "image_url": None,
    },
]


def seed():
    user_id = get_user_id()
    if not user_id:
        print("No user found")
        return

    inserted = 0
    skipped = 0

    for post in POSTS:
        post_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "juli3-" + post["content"][:50]))

        existing = supabase.table("posts").select("id").eq("id", post_id).execute()
        if existing.data:
            skipped += 1
            continue

        try:
            supabase.table("posts").insert({
                "id": post_id,
                "user_id": user_id,
                "username": JULI_USERNAME,
                "content": post["content"],
                "category": post["category"],
                "image_url": post.get("image_url"),
                "likes_count": 0,
            }).execute()
            inserted += 1
        except Exception as e:
            print(f"  Failed: {str(e)[:80]}")

    print(f"Inserted: {inserted}, Skipped: {skipped}")
    total = supabase.table("posts").select("id", count="exact").execute()
    print(f"Total posts in DB: {total.count}")


if __name__ == "__main__":
    seed()
