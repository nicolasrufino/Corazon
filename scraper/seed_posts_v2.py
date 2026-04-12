"""
Seed more discover posts — curated Latino community content by Juli.
Covers: business, remittances, know-your-rights, mental health,
kids/family, housing, entrepreneurship, seasonal, faith, nightlife.
"""

import os
import uuid
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

JULI_USERNAME = "Juli"


def get_user_id():
    """Get existing user or create Juli profile."""
    res = supabase.table("profiles").select("id").eq("username", JULI_USERNAME).execute()
    if res.data:
        return res.data[0]["id"]
    # Use first available user and update username
    res = supabase.table("profiles").select("id").limit(1).execute()
    if res.data:
        uid = res.data[0]["id"]
        supabase.table("profiles").update({"username": JULI_USERNAME}).eq("id", uid).execute()
        return uid
    return None


POSTS = [
    # ─── BUSINESS & ENTREPRENEURSHIP ───
    {
        "content": "List of Latino-owned businesses on 26th Street you should know about: La Michoacana (ice cream since '92), Dulcelandia (bulk candy paradise), El Milagro tortilla factory, Nuevo Leon bakery. Support your gente. Share more in comments. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Want to start a business but don't know where to begin? ICNC (Industrial Council of Nearwest Chicago) offers free bilingual workshops on business plans, licenses, and funding. No SSN needed for their programs. 312-421-3941. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Micro-loans for Latino entrepreneurs in Chicago: Accion Chicago offers $500-$100K loans for small businesses. They don't require perfect credit and their staff speaks Spanish. Worth a call if you're trying to grow your negocio. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Food truck permit in Chicago costs $275/year. If you've got a recipe that slaps and you've been thinking about it — the city has a guide in Spanish at chicago.gov. Start small, dream big. Your abuela's recipes could be a business. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=800&q=80",
    },
    # ─── REMITTANCES & MONEY ───
    {
        "content": "Cheapest ways to send money to Mexico from Chicago right now: Wise (best exchange rate, 1-2 days), Remitly (fast, good promos for new users), Xoom by PayPal (instant to bank). Avoid Western Union — fees are insane. Your family deserves every dollar. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "ITIN number: you can file taxes and build credit history even without a SSN. Free ITIN application help at Centro de Trabajadores Unidos, 2141 S Blue Island Ave. They walk you through the whole process in Spanish. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Free tax prep (VITA sites) in Chicago for 2026: Pilsen branch library, UIC, Erie Neighborhood House, and most community centers. If you make under $67K you qualify. Don't pay $200 at a tax office for something that's free. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    },
    # ─── KNOW YOUR RIGHTS ───
    {
        "content": "If ICE comes to your door: you do NOT have to open it. Ask them to slide a warrant under the door. If it's signed by a judge (not just ICE), that's different. Know the difference. NIJC has know-your-rights cards in Spanish — free. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Tenant rights in Chicago: your landlord CANNOT evict you without going to court. They cannot change your locks, shut off utilities, or remove your belongings. Ever. If they try, call Metropolitan Tenants Organization: 773-292-4980 (bilingual). — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Workers' rights: minimum wage in Chicago is $16.20/hr in 2026. Your employer MUST pay you this regardless of your immigration status. If they don't, report to Illinois Department of Labor. They cannot retaliate. You are protected. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    },
    # ─── MENTAL HEALTH ───
    {
        "content": "It's okay to not be okay. Therapy in Spanish exists and it's more accessible than you think. Open Path Collective offers sessions for $30-$80, many bilingual therapists. Your mental health matters as much as your work ethic. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "988 Suicide and Crisis Lifeline now has Spanish-speaking counselors 24/7. Dial 988, press 2 for Spanish. Share this with someone who might need it. Sometimes one call changes everything. — Juli",
        "category": "resource",
        "image_url": None,
    },
    {
        "content": "Being the family translator since age 8 is exhausting. Being the first to navigate college, taxes, doctors — all in a language your parents don't speak. That weight is real. It's okay to ask for help too. You don't have to carry it all alone. — Juli",
        "category": "story",
        "image_url": None,
    },
    # ─── KIDS & FAMILY ───
    {
        "content": "Free summer programs for kids in Chicago: Chicago Park District (every neighborhood), After School Matters (teens, paid), Boys & Girls Club of Chicago, YMCA camps. Registration opens in April. Don't wait — spots fill up fast. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Youth soccer leagues in Pilsen and Little Village: Chicago FC United has bilingual coaches, $50/season includes jersey. Games on Saturdays at Harrison Park. Ages 5-17. Get your kids off the screen and on the field. — Juli",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Bilingual storytime at Pilsen Library every Tuesday at 10am. Perfect for toddlers and preschoolers. They sing songs in Spanish and English, read picture books, do a craft. Free. Your kid learns both languages while having fun. — Juli",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80",
    },
    # ─── HOUSING ───
    {
        "content": "Apartment hunting in Chicago? Red flags: landlord asks for deposit before you see the place, no written lease, utilities not specified, 'cash only.' These are scams. Always get a written lease. Take photos of everything move-in day. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Chicago Low-Income Housing Trust Fund (CLIHTF) has rental assistance for families making under $38K/year. Applications accepted year-round. They also help with security deposits. Call 312-742-0547. Bilingual staff available. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=800&q=80",
    },
    # ─── FAITH & COMMUNITY ───
    {
        "content": "Misa en espanol in Chicago: St. Pius V (Pilsen) has mass in Spanish every Sunday at 8am, 10am, 12pm. Beautiful church, strong community. They also run a food pantry Wednesdays and Fridays. Faith and service together. — Juli",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Whether you're Catholic, Christian, or just spiritual — the community connection through church is real for so many of us. It's not just about faith. It's about belonging. Where's your family's go-to parish in Chicago? — Juli",
        "category": "question",
        "image_url": None,
    },
    # ─── SEASONAL ───
    {
        "content": "Dia de los Muertos 2026 events in Chicago: National Museum of Mexican Art (biggest celebration, free), Pilsen community altar walk on 18th Street, Harrison Park festival. Start planning your ofrenda now. Remember your loved ones. — Juli",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Where to order tamales for Christmas in Chicago: La Casa del Pueblo (26th St), Birrieria Reyes de Ocotlan, or ask your tia — she probably knows someone who makes them from home. Order early, everyone sells out by December 20. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80",
    },
    # ─── NIGHTLIFE & MUSIC ───
    {
        "content": "Best Latin clubs in Chicago if you actually want to dance: Humbolt Park Boathouse (free outdoor events in summer), Le Nocturne (Logan Square, reggaeton + Latin house), Carbon (Wicker Park, perreo nights). You're welcome. — Juli",
        "category": "event",
        "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Chicago has one of the biggest Mexican music scenes outside Mexico City. Norteño, banda, corridos tumbados — live every weekend in Little Village and Cicero. Check La Bamba Lounge, El Gallo Nightclub, and Cermak Hall. Support live music. — Juli",
        "category": "general",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    },
    # ─── MORE QUESTIONS ───
    {
        "content": "What's the best quinceañera venue in the Chicago area under $3K? My cousin's turning 15 and we need a spot that fits 200 people. Bonus if they let you bring your own DJ. Drop your recs. — Juli",
        "category": "question",
        "image_url": None,
    },
    {
        "content": "What do you wish someone had told you when you first moved to Chicago? Whether it was 20 years ago or 2 months ago, drop your best advice for newcomers. Let's help each other out. — Juli",
        "category": "question",
        "image_url": None,
    },
    {
        "content": "Calling all abuelitas and home cooks: what's your go-to recipe when someone in the family is sick? Caldo de pollo? Te de canela? Vaporub on the chest? What's the cure? Let's collect the real remedios. — Juli",
        "category": "question",
        "image_url": None,
    },
    # ─── EDUCATION ───
    {
        "content": "City Colleges of Chicago are essentially free if you're a CPS graduate (Chicago Star Scholarship). Covers tuition + books at any of the 7 campuses. If you graduated from a Chicago public school, you qualify. Don't sleep on this. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "GED in Spanish exists and it's accepted everywhere the English GED is. Preparation classes at Instituto del Progreso Latino (2520 S Western Ave). Free, bilingual support. It's never too late to get your diploma. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    },
    # ─── HEALTH ───
    {
        "content": "No insurance? No problem. CommunityHealth (2611 W Chicago Ave) is 100% free primary care. No income requirements, no immigration questions. Doctors, dentists, vision — all free. Walk-ins accepted. Tell everyone you know. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    },
    {
        "content": "Prenatal care in Spanish: Erie Family Health Center has bilingual OB/GYN services on a sliding scale. Even if you have no insurance, they'll see you. 1347 W Erie St or 1701 W Superior. Your baby's health matters. — Juli",
        "category": "resource",
        "image_url": "https://images.unsplash.com/photo-1559757175-7cb057fba93c?auto=format&fit=crop&w=800&q=80",
    },
    # ─── INSPIRATIONAL ───
    {
        "content": "Reminder: you are not 'just' an immigrant, 'just' a worker, 'just' a student. You are someone who left everything they knew for a chance at something better. That takes more courage than most people will ever understand. Keep going. — Juli",
        "category": "story",
        "image_url": None,
    },
    {
        "content": "The same hands that make tamales at 4am, clean offices at night, and help kids with homework in between — those are the strongest hands in America. Never let anyone make you feel small for how hard you work. — Juli",
        "category": "story",
        "image_url": None,
    },
]


def seed():
    user_id = get_user_id()
    if not user_id:
        print("No user found — cannot seed posts")
        return

    inserted = 0
    skipped = 0

    for post in POSTS:
        post_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "juli-" + post["content"][:50]))

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
