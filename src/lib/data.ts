// ponytail: content lives in this file until there are enough entries to need Supabase.
// Every secret below is SAMPLE copy from the design — replace with verified entries before launch.

export type LineSlug = "eat" | "drink" | "shop" | "go" | "save" | "whats-on" | "live";

export type Line = {
  slug: LineSlug;
  name: string;
  short: string;
  train: string;
  color: string;
  intro: string;
  tags: string[];
};

export type Hood = {
  slug: string;
  name: string;
  region: "North Side" | "Northwest" | "West" | "Central" | "South" | "Southwest" | "Far South";
  area: number;
  kicker?: string;
  take?: string;
  knownFor?: string;
  bestTime?: string;
  nearestL?: string;
  photo?: string;
};

export type Secret = {
  slug: string;
  title: string;
  line: LineSlug;
  hood: string;
  dek: string;
  body: string[];
  howTo: string[];
  tip?: string;
  address: string;
  hours: string;
  cost: string;
  price: 1 | 2 | 3;
  nearestL: string;
  late?: boolean;
  tags: string[];
  lat: number;
  lng: number;
  verified: string;
  photo: string;
  featured?: boolean;
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

export const HERO_PHOTO = u("1630280407467-c03e6f3e7bdb");

export const LINES: Line[] = [
  { slug: "eat", name: "Where to Eat", short: "Eat", train: "Pink", color: "#E27EA6", intro: "Off-menu orders, the best taco in every neighborhood, and the places locals don't post about.", tags: ["tacos", "late night", "off-menu", "date night", "brunch"] },
  { slug: "drink", name: "Where to Drink", short: "Drink", train: "Red", color: "#C60C30", intro: "Happy hours worth leaving work for, patios, and bars with no sign.", tags: ["happy hour", "patio", "no sign", "mezcal"] },
  { slug: "shop", name: "Where to Shop", short: "Shop", train: "Purple", color: "#522398", intro: "Vintage streets, sample sales and makers you won't find online.", tags: ["vintage", "makers", "markets"] },
  { slug: "go", name: "Where to Go", short: "Go", train: "Blue", color: "#00A1DE", intro: "Rooftop views with no cover, tunnels, murals and secret gardens.", tags: ["views", "murals", "winter", "free"] },
  { slug: "save", name: "Where to Save", short: "Save", train: "Green", color: "#009B3A", intro: "Free museum days and library passes that get you in for $0.", tags: ["free", "museums", "library"] },
  { slug: "whats-on", name: "What's On", short: "What's On", train: "Orange", color: "#F9461C", intro: "This week's fests, markets and the lakefront by season.", tags: ["monthly", "fests", "markets"] },
  { slug: "live", name: "How to Live Here", short: "Live Here", train: "Yellow", color: "#F9E300", intro: "Street cleaning, CTA tricks and how to survive February.", tags: ["cta", "parking", "winter"] },
];

export const HOODS: Hood[] = [
  { slug: "albany-park", name: "Albany Park", region: "Northwest", area: 14 },
  { slug: "andersonville", name: "Andersonville", region: "North Side", area: 77 },
  { slug: "avondale", name: "Avondale", region: "Northwest", area: 21 },
  { slug: "bridgeport", name: "Bridgeport", region: "South", area: 60 },
  { slug: "bronzeville", name: "Bronzeville", region: "South", area: 35 },
  { slug: "chinatown", name: "Chinatown", region: "South", area: 34 },
  { slug: "hyde-park", name: "Hyde Park", region: "South", area: 41 },
  { slug: "humboldt-park", name: "Humboldt Park", region: "West", area: 23 },
  { slug: "lincoln-square", name: "Lincoln Square", region: "North Side", area: 4 },
  { slug: "little-italy", name: "Little Italy", region: "West", area: 28 },
  { slug: "little-village", name: "Little Village", region: "Southwest", area: 30 },
  { slug: "logan-square", name: "Logan Square", region: "Northwest", area: 22 },
  { slug: "loop", name: "Loop", region: "Central", area: 32 },
  {
    slug: "pilsen",
    name: "Pilsen",
    region: "West",
    area: 31,
    kicker: "Lower West Side",
    take: "Pilsen is Chicago's mural capital and still one of its best food neighborhoods. Skip 18th Street on a Saturday afternoon. Come on a weeknight, eat at the counter places on Blue Island, and walk the alleys off 16th where the newer murals go up first.",
    knownFor: "Murals, panaderías, galleries",
    bestTime: "Second Friday art walk",
    nearestL: "Pink Line · 18th",
    photo: u("1773085266957-403475167948"),
  },
  { slug: "rogers-park", name: "Rogers Park", region: "North Side", area: 1 },
  { slug: "uptown", name: "Uptown", region: "North Side", area: 3 },
  { slug: "west-loop", name: "West Loop", region: "Central", area: 28 },
  { slug: "wicker-park", name: "Wicker Park", region: "West", area: 24 },
];

export const SECRETS: Secret[] = [
  {
    slug: "al-pastor-after-midnight",
    title: "The taquería that only makes al pastor after midnight",
    line: "eat", hood: "little-village", featured: true,
    dek: "No sign, no menu online, and a trompo that only turns after 12.",
    body: [
      "By day it's a normal Little Village taquería. After midnight, the kitchen switches to al pastor only. It's not on the menu, not on the sign, and not on their Instagram.",
      "Order “de la casa” and you get four tacos with pineapple shaved straight off the spit. Ask for the green salsa they keep behind the counter: it's hotter than anything on the table and it's the whole point.",
    ],
    howTo: ["Go Thursday to Saturday, after midnight.", "Order “de la casa” at the counter. Cash only, about $12.", "Ask for the salsa verde “de atrás”. Say please."],
    tip: "Street parking on 26th fills up with the bar crowd. Take the Pink Line and walk.",
    address: "26th Street, Little Village", hours: "Thu–Sat, 12am–3am", cost: "About $12 · cash only", price: 1,
    nearestL: "Pink Line · California", late: true, tags: ["tacos", "late night", "off-menu"],
    lat: 41.8445, lng: -87.7085, verified: "2026-10-12", photo: u("1600473763749-5e4212ea0e69"),
  },
  {
    slug: "pilsen-secret-tasting-menu",
    title: "Ask for the 'secret' tasting menu at this Pilsen counter",
    line: "eat", hood: "pilsen",
    dek: "Six courses for the price of two entrées, if you sit at the counter.",
    body: ["The counter seats get a tasting menu the tables never hear about. It changes weekly and runs until the kitchen gets tired."],
    howTo: ["Book the counter, not a table.", "Say “lo que quiera el chef”.", "Budget about $45 a person."],
    address: "Blue Island Ave, Pilsen", hours: "Wed–Sun, 5pm–10pm", cost: "About $45", price: 2,
    nearestL: "Pink Line · 18th", tags: ["date night", "off-menu"],
    lat: 41.8560, lng: -87.6560, verified: "2026-10-04", photo: u("1653796123385-66a9da61557c"),
  },
  {
    slug: "chinatown-5-dollar-bakery-lunch",
    title: "Chinatown's $5 bakery lunch nobody lines up for",
    line: "eat", hood: "chinatown",
    dek: "Three buns and a milk tea for less than a sandwich downtown.",
    body: ["Skip the restaurants with the lines on Wentworth. The bakery's back case has savory buns that sell out by 1pm."],
    howTo: ["Go before noon.", "Grab a tray and tongs, it's self-serve.", "Get the curry beef and the BBQ pork bun."],
    address: "Wentworth Ave, Chinatown", hours: "Daily, 7am–6pm", cost: "About $5", price: 1,
    nearestL: "Red Line · Cermak-Chinatown", tags: ["cheap", "lunch"],
    lat: 41.8525, lng: -87.6320, verified: "2026-09-28", photo: u("1624171239603-c2328405cd4a"),
  },
  {
    slug: "italian-beef-local-order",
    title: "The Italian beef order Chicagoans actually get",
    line: "eat", hood: "little-italy",
    dek: "Dipped, hot, and eaten standing at the counter. Here's how to say it.",
    body: ["Ordering wrong marks you as a tourist instantly. Locals say “beef, hot, dipped” and eat it leaning forward."],
    howTo: ["Say “beef, hot, dipped”.", "Add sweet peppers if you can't handle giardiniera.", "Eat standing at the ledge."],
    address: "Taylor Street, Little Italy", hours: "Daily, 10am–9pm", cost: "About $11", price: 1,
    nearestL: "Blue Line · Racine", tags: ["classic"],
    lat: 41.8690, lng: -87.6600, verified: "2026-10-01", photo: u("1778449736460-9a8f2117571a"),
  },
  {
    slug: "polish-deli-hot-table",
    title: "A Polish deli with a hot table at the back",
    line: "eat", hood: "avondale",
    dek: "Pierogi by weight, behind the sausage counter.",
    body: ["Walk past the grocery aisles to the steam table in the back. Pierogi, gołąbki and soup are sold by the pound."],
    howTo: ["Go at lunch when the table is full.", "Point and order by weight.", "Pay at the deli counter, not the front."],
    address: "Milwaukee Ave, Avondale", hours: "Daily, 9am–7pm", cost: "About $10", price: 1,
    nearestL: "Blue Line · Belmont", tags: ["cheap", "lunch"],
    lat: 41.9390, lng: -87.7110, verified: "2026-09-20", photo: u("1636061212050-b504af7f69fa"),
  },
  {
    slug: "deep-dish-no-tourists",
    title: "Deep dish without the tourists: go here, 3pm",
    line: "eat", hood: "lincoln-square",
    dek: "Same pan, no wait, if you avoid the dinner rush.",
    body: ["The neighborhood place makes deep dish as good as the downtown names. At 3pm on a weekday you'll have the room to yourself."],
    howTo: ["Call ahead, deep dish takes 45 minutes.", "Go mid-afternoon on a weekday."],
    address: "Lincoln Ave, Lincoln Square", hours: "Daily, 11am–10pm", cost: "About $25", price: 2,
    nearestL: "Brown Line · Western", tags: ["classic", "date night"],
    lat: 41.9685, lng: -87.6890, verified: "2026-09-30", photo: u("1678413339391-e61b54304faa"),
  },
  {
    slug: "korean-fried-chicken-window",
    title: "The Korean fried chicken window off Lawrence",
    line: "eat", hood: "albany-park",
    dek: "Takeout only, double fried, worth the walk from the Brown Line.",
    body: ["There's no dining room, just a window and a bench. Order the half-and-half and eat it on the bench."],
    howTo: ["Order half soy garlic, half spicy.", "Expect a 20 minute wait. It's fried to order."],
    address: "Lawrence Ave, Albany Park", hours: "Tue–Sun, 4pm–11pm", cost: "About $20", price: 1,
    nearestL: "Brown Line · Kedzie", late: true, tags: ["late night"],
    lat: 41.9685, lng: -87.7085, verified: "2026-10-08", photo: u("1565280654395-0e72852d2653"),
  },
  {
    slug: "brunch-no-wait-bar",
    title: "Brunch with no wait if you sit at the bar",
    line: "eat", hood: "logan-square",
    dek: "The hour-long list is for tables. The bar is first come.",
    body: ["Every Logan Square brunch spot has a line. This one keeps its bar seats off the waitlist."],
    howTo: ["Go solo or as two.", "Walk straight to the bar and ask."],
    address: "Milwaukee Ave, Logan Square", hours: "Sat–Sun, 9am–3pm", cost: "About $25", price: 2,
    nearestL: "Blue Line · Logan Square", tags: ["brunch"],
    lat: 41.9230, lng: -87.7080, verified: "2026-10-05", photo: u("1755716302452-ecad6b4e89bd"),
  },
  {
    slug: "mezcal-bar-no-sign",
    title: "A mezcal bar with no sign on 18th",
    line: "drink", hood: "pilsen",
    dek: "Look for the blue door and the line of people pretending not to wait.",
    body: ["There's no name outside. The menu is 80 mezcals and a bartender who will pick for you if you ask."],
    howTo: ["Go before 9pm on weekends.", "Ask for a flight of three, under $30."],
    address: "18th Street, Pilsen", hours: "Daily, 5pm–2am", cost: "About $30", price: 2,
    nearestL: "Pink Line · 18th", late: true, tags: ["no sign", "mezcal"],
    lat: 41.8575, lng: -87.6610, verified: "2026-10-10", photo: u("1768163039381-78a2f76a23ce"),
  },
  {
    slug: "vintage-above-panaderia",
    title: "The vintage shop hiding above a panadería",
    line: "shop", hood: "pilsen",
    dek: "Up the side stairs, past the smell of conchas.",
    body: ["The door next to the bakery leads up to two rooms of vintage, priced like nobody's found it yet."],
    howTo: ["Use the side door, not the bakery.", "Saturdays get the new racks."],
    address: "18th Street, Pilsen", hours: "Thu–Sun, 12pm–7pm", cost: "Free to browse", price: 1,
    nearestL: "Pink Line · 18th", tags: ["vintage"],
    lat: 41.8570, lng: -87.6640, verified: "2026-09-26", photo: u("1777869356086-b0351f541ae7"),
  },
  {
    slug: "quinceanera-dress-blocks",
    title: "The 26th Street quinceañera dress blocks, explained",
    line: "shop", hood: "little-village",
    dek: "Two miles of bridal and quince shops, and how to shop them.",
    body: ["26th Street is one of the city's busiest shopping streets. The dress shops cluster on a few blocks and haggling is normal."],
    howTo: ["Start at the arch and walk west.", "Ask about last season's samples."],
    address: "26th Street, Little Village", hours: "Daily, 10am–8pm", cost: "Varies", price: 2,
    nearestL: "Pink Line · Kedzie", tags: ["markets"],
    lat: 41.8445, lng: -87.7050, verified: "2026-09-18", photo: u("1791057199421-ea904bf8d8a5"),
  },
  {
    slug: "pilsen-mural-alley",
    title: "The mural alley most tours walk right past",
    line: "go", hood: "pilsen",
    dek: "New murals go up here first, a block off 16th.",
    body: ["Tours stick to 18th Street. The alley off 16th is where artists paint new work first."],
    howTo: ["Start at 16th and Halsted, walk west.", "Go on a weekday morning for empty photos."],
    address: "Off 16th Street, Pilsen", hours: "Always open", cost: "Free", price: 1,
    nearestL: "Pink Line · 18th", tags: ["murals", "free"],
    lat: 41.8595, lng: -87.6580, verified: "2026-10-02", photo: u("1759728262085-f65a6d43b8a9"),
  },
  {
    slug: "loop-pedway",
    title: "Five miles of tunnels under the Loop, and how to use them in January",
    line: "go", hood: "loop", featured: true,
    dek: "The Pedway connects 40-some blocks without stepping outside.",
    body: ["The Pedway is a network of tunnels and bridges under downtown. Most of it is unmarked, which is why most people never use it."],
    howTo: ["Enter at Block 37 or the Cultural Center.", "Follow the orange Pedway signs.", "Weekdays only, many sections close on weekends."],
    tip: "Download a Pedway map before you go down. Cell signal is spotty.",
    address: "Downtown Loop", hours: "Weekdays, about 6am–6pm", cost: "Free", price: 1,
    nearestL: "Red/Blue Line · Washington", tags: ["winter", "free"],
    lat: 41.8835, lng: -87.6280, verified: "2026-10-06", photo: u("1672600865205-ec18869cbc8c"),
  },
  {
    slug: "library-museum-passes",
    title: "Your library card gets you into museums for free",
    line: "save", hood: "loop", featured: true,
    dek: "Chicago Public Library lends museum passes like books.",
    body: ["A free Chicago Public Library card lets you check out passes to some of the city's museums. Most people with a card don't know."],
    howTo: ["Get a free CPL card at any branch.", "Reserve a pass in the library's museum pass program.", "Pick it up and go."],
    address: "Any Chicago Public Library branch", hours: "Library hours", cost: "Free", price: 1,
    nearestL: "Any line", tags: ["free", "museums", "library"],
    lat: 41.8765, lng: -87.6280, verified: "2026-10-03", photo: u("1746045087140-9b02da35952a"),
  },
  {
    slug: "taco-crawl-first-friday",
    title: "Taco crawl night on the first Friday of every month",
    line: "whats-on", hood: "pilsen",
    dek: "Cheap tacos at a dozen spots along 18th Street.",
    body: ["Once a month, spots along 18th run a taco special the same night. Walk it end to end."],
    howTo: ["Start at the east end around 6pm.", "Bring cash and an appetite."],
    address: "18th Street, Pilsen", hours: "First Friday, 6pm–10pm", cost: "About $2 a taco", price: 1,
    nearestL: "Pink Line · 18th", tags: ["monthly", "tacos"],
    lat: 41.8580, lng: -87.6520, verified: "2026-10-03", photo: u("1788622815828-cfff2fd22fa9"),
  },
  {
    slug: "street-cleaning-alerts",
    title: "Never get a street cleaning ticket again",
    line: "live", hood: "loop",
    dek: "The city will text you before the sweeper comes.",
    body: ["The City of Chicago runs street sweeping alerts by ward. Sign up once and you get a heads-up before your block is swept."],
    howTo: ["Find your ward on the city's website.", "Sign up for sweeping alerts.", "Move the car the night before."],
    address: "Citywide", hours: "April to November", cost: "Free", price: 1,
    nearestL: "Any line", tags: ["parking"],
    lat: 41.8840, lng: -87.6320, verified: "2026-09-29", photo: u("1548550923-92dc37742b76"),
  },
];

export const lineBySlug = (slug: string) => LINES.find((l) => l.slug === slug);
export const hoodBySlug = (slug: string) => HOODS.find((h) => h.slug === slug);
export const secretBySlug = (slug: string) => SECRETS.find((s) => s.slug === slug);
export const secretsIn = (hood: string) => SECRETS.filter((s) => s.hood === hood);
export const secretsOn = (line: string) => SECRETS.filter((s) => s.line === line);

export const monthYear = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
