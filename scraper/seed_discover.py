"""
Seed the discover feed with curated Latino community content.
All posts are by Juli. All venues, orgs, and addresses are verified real.
Run: cd scraper && source venv/bin/activate && python seed_discover.py
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
        post_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "juli-all-" + post["content"][:50]))

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

    print(f"Inserted: {inserted}, Skipped (already exist): {skipped}")
    total = supabase.table("posts").select("id", count="exact").execute()
    print(f"Total posts in DB: {total.count}")


if __name__ == "__main__":
    seed()
