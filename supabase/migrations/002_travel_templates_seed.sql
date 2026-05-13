-- =============================================
-- TripDesk.ai — 50 Travel Templates Seed
-- Migration: 002_travel_templates_seed
-- =============================================

INSERT INTO public.travel_templates (name, category, destination, client_type, content, variables, is_public) VALUES

-- ============================================
-- ITINERARY TEMPLATES (15)
-- ============================================
('7-Day Italy Classic', 'itinerary', 'Italy', 'couples',
'# {{duration}}-Day Italy Classic Itinerary
## For: {{client_name}} | Travel Dates: {{travel_dates}}

### Day 1 — Arrival in Rome
- Arrive at Rome Fiumicino (FCO). Transfer to hotel in the historic center.
- Afternoon: Stroll the Trastevere neighborhood. Settle in and recover from travel.
- Dinner: Traditional Roman trattoria near the Pantheon.
- **Hotel:** {{rome_hotel}} | Check-in from 3pm

### Day 2 — Ancient Rome
- Morning: Colosseum & Roman Forum (skip-the-line tickets included).
- Afternoon: Palatine Hill views, then Circus Maximus walk.
- Evening: Piazza Navona and Campo de'' Fiori.
- **Included:** Guided Colosseum tour

### Day 3 — Vatican & Vatican Museums
- Morning: Vatican Museums & Sistine Chapel (early access entry).
- Afternoon: St. Peter''s Basilica and Square.
- Evening: Dinner in Prati neighborhood.

### Day 4 — Travel to Florence
- Morning: High-speed train Rome → Florence (1h45m, approx €45pp).
- Afternoon: Check in and explore the Duomo neighborhood.
- Evening: Aperitivo on the Arno riverbank.
- **Hotel:** {{florence_hotel}}

### Day 5 — Florence Art & Culture
- Morning: Uffizi Gallery (pre-booked tickets essential — book 6+ weeks ahead).
- Afternoon: Accademia Gallery (Michelangelo''s David). Ponte Vecchio.
- Evening: Dinner in the Oltrarno district.

### Day 6 — Tuscany Day Trip
- Full-day: Chianti wine country, San Gimignano, and Siena.
- Private driver recommended (approx $180 for group).
- Wine tasting at a local Chianti estate included.

### Day 7 — Departure
- Morning: Last espresso and shopping at the Mercato Centrale.
- Transfer to Florence airport (FLR) or Bologna (BLQ).

---
## Pricing Summary
| Item | Estimated Cost |
|---|---|
| Flights (estimated) | {{flight_cost}} |
| Hotels (6 nights) | {{hotel_cost}} |
| Tours & activities | {{activity_cost}} |
| Meals (estimated) | {{meal_cost}} |
| Transportation | {{transport_cost}} |
| **Total Estimated** | **{{total_cost}}** |

*Prices are estimates as of {{quote_date}}. Final pricing confirmed on booking.*

---
## Important Notes
- **Visa:** {{visa_requirements}}
- **Best time to visit:** April–June, September–October
- **Currency:** Euro (€)
- **Travel insurance:** Strongly recommended
- **Source:** {{source_date}}',
ARRAY['duration', 'client_name', 'travel_dates', 'rome_hotel', 'florence_hotel', 'flight_cost', 'hotel_cost', 'activity_cost', 'meal_cost', 'transport_cost', 'total_cost', 'quote_date', 'visa_requirements', 'source_date'],
true),

('7-Day Caribbean All-Inclusive', 'itinerary', 'Caribbean', 'families',
'# 7-Day Caribbean Family Escape
## For: {{client_name}} | Resort: {{resort_name}}, {{destination}}

### Inclusions
✅ All meals and snacks | ✅ Non-premium beverages | ✅ Water sports | ✅ Kids club | ✅ Entertainment

### Day 1 — Arrival Day
- Arrive {{arrival_airport}}. Resort transfer ({{transfer_time}} minutes).
- Check in, explore resort, beach time.
- Welcome dinner at main buffet.

### Days 2–6 — Resort Days
**Each day choose from:**
- Morning: Snorkeling, kayaking, paddleboarding (all included)
- Afternoon: Pool time, beach, or spa (spa treatments extra)
- Kids Club: Ages 4–12, 9am–5pm daily
- Evening: Themed dinners, live entertainment, shows

**Recommended day excursions (extra cost):**
- Day 3: Catamaran snorkel cruise (~$85pp) ⭐ Highly recommended
- Day 4: Local town tour and market ($45pp)
- Day 5: Zipline adventure ($65pp)

### Day 7 — Departure
- Final breakfast. Checkout by 12pm.
- Resort transfer to airport.

---
## Pricing
| | Adult | Child (2–11) |
|---|---|---|
| 7 nights all-inclusive | {{adult_price}} | {{child_price}} |
| Flights (est.) | {{flight_cost}} | {{child_flight}} |
| **Total per person** | **{{total_adult}}** | **{{total_child}}** |

*Family of {{family_size}} total estimated: {{family_total}}*',
ARRAY['client_name', 'resort_name', 'destination', 'arrival_airport', 'transfer_time', 'adult_price', 'child_price', 'flight_cost', 'child_flight', 'total_adult', 'total_child', 'family_size', 'family_total'],
true),

('10-Day Japan Explorer', 'itinerary', 'Japan', 'couples',
'# 10-Day Japan Explorer
## For: {{client_name}} | Season: {{travel_season}}

### Overview
Tokyo (4 nights) → Hakone (1 night) → Kyoto (3 nights) → Osaka (2 nights)

### Days 1–2: Tokyo Arrival & Shibuya
- Day 1: Arrive Narita/Haneda. IC card for subway. Shibuya and Shinjuku exploration.
- Day 2: Senso-ji temple in Asakusa. TeamLab borderless (book in advance). Harajuku.
- **Hotel:** {{tokyo_hotel}} | Shinjuku or Shibuya area recommended

### Days 3–4: Tokyo Deep Dive
- Day 3: Tsukiji outer market breakfast. Ginza. Tokyo Skytree at sunset.
- Day 4: Day trip to Nikko shrines OR Kamakura Great Buddha.

### Day 5: Mt. Fuji & Hakone
- Bullet train to Odawara. Hakone Ropeway. Lake Ashi cruise. Views of Mt. Fuji.
- **Hotel:** {{hakone_ryokan}} (traditional ryokan with onsen — unmissable)

### Days 6–8: Kyoto
- Day 6: Fushimi Inari gates (go early — 6am for fewer crowds). Gion district.
- Day 7: Arashiyama bamboo grove. Tenryu-ji garden. Kinkaku-ji Golden Pavilion.
- Day 8: Nijo Castle. Nishiki Market. Traditional tea ceremony experience.
- **Hotel:** {{kyoto_hotel}}

### Days 9–10: Osaka & Departure
- Day 9: Dotonbori food crawl. Osaka Castle. Kuromon Market.
- Day 10: Last morning in Osaka. Fly home from Kansai Airport (KIX).

---
## Japan Rail Pass
7-day JR Pass recommended: approx $340pp | Covers all Shinkansen travel
Book before leaving home — cannot be purchased inside Japan.

## Practical Notes
- **Visa:** {{visa_info}}
- **Currency:** Cash-heavy society — carry ¥30,000–50,000 at all times
- **Pocket WiFi:** Rent at airport (~$7/day) or get SIM card
- **Tipping:** Not customary — do not tip',
ARRAY['client_name', 'travel_season', 'tokyo_hotel', 'hakone_ryokan', 'kyoto_hotel', 'visa_info'],
true),

('5-Day Paris Romantic Getaway', 'itinerary', 'France', 'couples',
'# 5-Day Paris Romantic Escape
## For: {{client_name}} | Dates: {{travel_dates}}

### Day 1 — Arrival & Le Marais
- Arrive CDG. RER B train to city center (~€12, 35 minutes).
- Afternoon: Stroll Le Marais district. Place des Vosges.
- Evening: Seine river cruise (€15pp) at sunset. Dinner in Saint-Germain.
- **Hotel:** {{hotel_name}}, {{arrondissement}}

### Day 2 — Iconic Paris
- 9am: Eiffel Tower (book summit tickets 6+ weeks in advance).
- Afternoon: Champs-Élysées and Arc de Triomphe (climb for views).
- Evening: Dinner at a traditional brasserie.

### Day 3 — Art & Culture
- Morning: Louvre Museum (arrive at opening — 9am, closed Tuesdays).
- Afternoon: Tuileries Garden stroll. Palais Royal.
- Evening: Moulin Rouge show (book in advance — {{moulin_rouge_tier}}).

### Day 4 — Versailles Day Trip
- Morning train to Palace of Versailles (45 min, ~€7).
- Explore palace and gardens (half day minimum).
- Return for evening in Montmartre. Sacré-Cœur at sunset.

### Day 5 — Final Morning & Departure
- Final café breakfast and patisserie. Last shopping.
- Transfer to CDG (allow 2.5 hours before departure).

---
**Estimated Budget:** {{budget_estimate}}
**Visa:** {{visa_requirements}}
**Best season:** April–June and September–October avoid peak summer crowds.',
ARRAY['client_name', 'travel_dates', 'hotel_name', 'arrondissement', 'moulin_rouge_tier', 'budget_estimate', 'visa_requirements'],
true),

('8-Day Morocco Adventure', 'itinerary', 'Morocco', 'adventure',
'# 8-Day Morocco Adventure
## For: {{client_name}}

### Day 1 — Marrakech Arrival
- Arrive Marrakech Menara Airport. Transfer to riad in the medina.
- Afternoon: Djemaa el-Fna square at dusk — acrobats, musicians, food stalls.
- **Stay:** {{marrakech_riad}}

### Day 2 — Marrakech Deep Dive
- Morning: Majorelle Garden and YSL Museum (book ahead).
- Afternoon: Bahia Palace and El Badi Palace ruins.
- Evening: Cooking class in a local riad kitchen.

### Day 3 — Atlas Mountains Day Trip
- Full day: Valleys and Berber villages in the High Atlas.
- Optional mule trek, waterfall hike, or local lunch with a family.

### Day 4 — Marrakech to Fes (Scenic Drive)
- Drive via Beni Mellal and the Middle Atlas (5–6 hours with stops).
- Cedars forest — wild Barbary macaques.
- **Stay:** {{fes_riad}}

### Day 5 — Fes el-Bali Medina
- Morning: Chouara Tannery (view from leather shops).
- Guided medina walk — the world''s largest car-free urban zone.
- Medersa Bou Inania. Al-Qarawiyyin University (oldest in the world).

### Day 6 — Fes to Sahara Desert
- Drive through Midelt to Merzouga (6 hours).
- Late afternoon: Camel trek into the dunes. Sunset in the Erg Chebbi.
- **Stay:** Desert camp under the stars.

### Day 7 — Sahara to Marrakech
- Sunrise over dunes. Drive back via Tinerhir gorges and Ouarzazate.
- **Stay:** Ouarzazate or continue to Marrakech.

### Day 8 — Departure
- Final medina shopping. Departure from Marrakech.',
ARRAY['client_name', 'marrakech_riad', 'fes_riad'],
true),

('14-Day Australia East Coast', 'itinerary', 'Australia', 'adventure',
'# 14-Day Australia East Coast
## For: {{client_name}} | Route: Sydney → Brisbane → Cairns

### Days 1–3: Sydney
- Sydney Opera House and Harbour Bridge climb (sunset recommended).
- Bondi Beach to Coogee coastal walk.
- Blue Mountains day trip (Scenic World railway + Three Sisters).

### Days 4–5: Hunter Valley or Byron Bay
- Wine country day trip from Sydney, OR
- Fly/drive to Byron Bay for beaches and surf culture.

### Days 6–8: Brisbane & Gold Coast
- Brisbane: South Bank, Story Bridge, gallery precinct.
- Gold Coast: Surfers Paradise, theme parks (Warner Bros/Dreamworld for families).

### Days 9–11: Whitsundays
- Fly to Proserpine/Hamilton Island.
- Sailing trip through the Whitsunday Islands.
- Whitehaven Beach — one of the world''s finest.

### Days 12–14: Cairns & Great Barrier Reef
- Great Barrier Reef snorkel/dive day trip (essential — {{reef_operator}}).
- Daintree Rainforest tour.
- Kuranda Scenic Railway.
- Fly home from Cairns.',
ARRAY['client_name', 'reef_operator'],
true),

('4-Day New York City Break', 'itinerary', 'USA', 'all',
'# 4-Day New York City
## For: {{client_name}}

### Day 1 — Manhattan Icons
- 9/11 Memorial & Museum (morning, arrive early).
- One World Observatory or Top of the Rock (sunset).
- Broadway show evening ({{show_name}}).

### Day 2 — Central Park & Uptown
- Central Park morning run or bike rental.
- Metropolitan Museum of Art (world-class, free with suggested donation).
- Upper West Side lunch. Lincoln Center evening.

### Day 3 — Brooklyn & Downtown
- Brooklyn Bridge walk (morning light for photos).
- DUMBO neighbourhood. Grimaldi''s pizza.
- Afternoon: Chelsea Market and High Line park.
- Evening: Greenwich Village and West Village dining.

### Day 4 — Final Day
- Staten Island Ferry (free, Statue of Liberty views).
- SoHo shopping.
- JFK/LGA/EWR transfer (allow 2.5 hours minimum).

**Hotel recommendation:** {{hotel_area}} area (Midtown for convenience, Downtown for atmosphere)',
ARRAY['client_name', 'show_name', 'hotel_area'],
true),

('6-Day Costa Rica Eco Adventure', 'itinerary', 'Costa Rica', 'adventure',
'# 6-Day Costa Rica Eco Adventure
## For: {{client_name}}

### Day 1 — San José Arrival
- Arrive SJO. Transfer to hotel. City orientation walk.
- **Stay:** {{sanjose_hotel}}

### Day 2 — Arenal Volcano
- Drive to Arenal region (3.5 hours).
- Afternoon: Zipline canopy tour through cloud forest.
- Evening: Natural hot springs at La Fortuna.
- **Stay:** Arenal lodge with volcano views.

### Day 3 — Arenal Activities
- Morning: White water rafting on Rio Toro (Class III–IV).
- Afternoon: Hanging bridges walk in the rainforest.
- Evening: Night wildlife walk.

### Day 4 — Monteverde Cloud Forest
- Drive to Monteverde (3 hours).
- Cloud forest reserve walk with naturalist guide.
- Butterfly garden and hummingbird gallery.

### Day 5 — Manuel Antonio
- Drive to Pacific coast (3 hours).
- Manuel Antonio National Park — monkeys, sloths, beaches.
- Afternoon: Beach time.

### Day 6 — Departure
- Morning swim. Transfer to SJO for departure.

**Pura Vida tip:** Pack light, bring biodegradable sunscreen, cash in colones for local restaurants.',
ARRAY['client_name', 'sanjose_hotel'],
true),

('10-Day Peru & Machu Picchu', 'itinerary', 'Peru', 'adventure',
'# 10-Day Peru & Machu Picchu
## For: {{client_name}}

### Days 1–2: Lima
- Miraflores district: coastal cliffs, Larcomar mall.
- Barranco arts district. World-class ceviche at Central or Maido.
- Lima food tour evening.

### Days 3–4: Cusco (Acclimatization)
- Fly to Cusco (altitude 3,400m — rest on Day 3, no alcohol).
- Day 4: San Blas neighbourhood, Sacsayhuamán fortress.
- Coca tea is your friend.

### Day 5: Sacred Valley
- Pisac market and ruins. Ollantaytambo fortress.
- Afternoon: Train to Aguas Calientes.
- **Stay:** {{aguas_calientes_hotel}}

### Day 6: Machu Picchu
- Bus up at 6am (arrive before 7am for fewer crowds and best light).
- 2-hour guided tour, then free exploration.
- Optional: Huayna Picchu or Sun Gate hike (must book months in advance).
- Return to Cusco by evening.

### Days 7–8: Cusco Culture
- Qoricancha Temple. Cusco Cathedral. San Pedro Market.
- Optional: Rainbow Mountain day trip (4–5 hour drive, altitude 5,200m).

### Days 9–10: Lima & Departure
- Return to Lima. Final dinner in Miraflores. Departure.',
ARRAY['client_name', 'aguas_calientes_hotel'],
true),

('5-Day Greek Island Hop', 'itinerary', 'Greece', 'couples',
'# 5-Day Greek Island Hop
## For: {{client_name}} | Islands: {{islands}}

### Day 1 — Athens & Santorini
- Morning: Athens — Acropolis and Parthenon (arrive at 8am, closes to tours at noon in summer).
- Afternoon: Ferry or short flight to Santorini.
- Evening: Sunset from Oia. The most photographed sunset in the world.
- **Stay:** {{santorini_hotel}} (caldera view recommended)

### Day 2 — Santorini
- Morning: Perissa black sand beach.
- Afternoon: Akrotiri archaeological site.
- Evening: Fira town dining with caldera views.

### Day 3 — Mykonos
- Ferry Santorini → Mykonos (2.5 hours).
- Afternoon: Little Venice and windmills.
- Evening: Mykonos nightlife (optional).
- **Stay:** {{mykonos_hotel}}

### Day 4 — Mykonos Beaches
- Morning: Paradise Beach or Super Paradise Beach.
- Afternoon: Old Town (Chora) exploration.
- Sunset boat cruise (optional, ~€55pp).

### Day 5 — Return to Athens
- Ferry or flight back to Athens. Departure.

*Best months: May–June or September–October (cooler, fewer crowds, lower prices)*',
ARRAY['client_name', 'islands', 'santorini_hotel', 'mykonos_hotel'],
true),

('7-Day Kenya Safari', 'itinerary', 'Kenya', 'luxury',
'# 7-Day Kenya Safari
## For: {{client_name}} | Season: {{travel_season}}

### Days 1–2: Masai Mara
- Arrive Nairobi. Domestic flight to Masai Mara (45 min).
- Afternoon game drive. Sundowner cocktails in the bush.
- Full day game drive — Big Five territory.
- **Camp:** {{mara_camp}} (luxury tented camp)

### Days 3–4: Amboseli
- Fly to Amboseli. Mt. Kilimanjaro backdrop game drives.
- Largest elephant herds in Africa.
- Maasai village cultural visit.
- **Camp:** {{amboseli_camp}}

### Days 5–6: Samburu
- Fly to Samburu. Unique northern species — reticulated giraffe, Grevy''s zebra.
- Ewaso Ng''iro River — hippos and crocodiles.
- **Camp:** {{samburu_camp}}

### Day 7: Nairobi & Departure
- Morning: Giraffe Centre or David Sheldrick Elephant Orphanage.
- Depart from Jomo Kenyatta International Airport (NBO).

**Best time for Wildebeest Migration:** July–October in the Mara',
ARRAY['client_name', 'travel_season', 'mara_camp', 'amboseli_camp', 'samburu_camp'],
true),

('6-Day Bali Wellness Retreat', 'itinerary', 'Bali', 'couples',
'# 6-Day Bali Wellness & Culture
## For: {{client_name}} | Base: Ubud

### Day 1 — Ubud Arrival
- Arrive Ngurah Rai Airport. Transfer to Ubud (1.5 hours).
- Afternoon: Sacred Monkey Forest.
- Evening: Traditional Kecak fire dance performance.
- **Stay:** {{ubud_retreat}}

### Day 2 — Sunrise & Temples
- 4am: Mount Batur sunrise hike (guide essential, ~$65pp).
- Afternoon: Tirta Empul holy water temple.
- Evening: Balinese cooking class.

### Day 3 — Wellness Day
- Morning yoga class (Ubud has world-class studios).
- Traditional Balinese massage (2 hours, ~$25).
- Afternoon: Rice terrace walk at Tegallalang.

### Day 4 — Seminyak
- Transfer to Seminyak beach area (1.5 hours).
- Afternoon: Seminyak beach and surf lessons.
- Sunset at La Plancha or Ku De Ta.
- **Stay:** {{seminyak_hotel}}

### Day 5 — Uluwatu
- Uluwatu sea temple (dramatic clifftop location).
- Kecak sunset ceremony at the cliff.
- Jimbaran Bay seafood dinner on the beach.

### Day 6 — Departure
- Final Balinese coffee. Transfer to airport.',
ARRAY['client_name', 'ubud_retreat', 'seminyak_hotel'],
true),

('3-Day Dubai City Break', 'itinerary', 'UAE', 'luxury',
'# 3-Day Dubai Luxury City Break
## For: {{client_name}}

### Day 1 — Modern Dubai
- Burj Khalifa At the Top observation deck (book online, €40pp).
- Dubai Mall and Dubai Fountain show (hourly from 6pm, free).
- Palm Jumeirah drive and Atlantis hotel view.
- Evening: Dinner at {{fine_dining_restaurant}}.
- **Hotel:** {{hotel_name}}

### Day 2 — Traditional Dubai
- Morning: Gold Souk and Spice Souk in Deira.
- Abra (water taxi) across Dubai Creek (~1 AED).
- Al Fahidi Historic District and Dubai Museum.
- Afternoon: Desert Safari — dunes, camel ride, falconry, BBQ dinner.

### Day 3 — Beach & Departure
- JBR Beach morning swim.
- Dubai Frame (panoramic views of old and new Dubai).
- Departure from Dubai International (DXB).',
ARRAY['client_name', 'fine_dining_restaurant', 'hotel_name'],
true),

('9-Day Portugal Explorer', 'itinerary', 'Portugal', 'all',
'# 9-Day Portugal Explorer
## For: {{client_name}} | Lisbon + Porto + Algarve

### Days 1–3: Lisbon
- Belém Tower and Pastéis de Belém (the original custard tarts).
- Alfama district and São Jorge Castle.
- Fado show dinner in Mouraria neighbourhood.
- Day trip: Sintra palaces (30 min train from Rossio station).

### Days 4–5: Douro Valley
- Train or drive to Porto (3 hours).
- Douro Valley wine tour — UNESCO landscape.
- Port wine cellars in Vila Nova de Gaia.

### Days 6–7: Porto
- Livraria Lello (world''s most beautiful bookshop — ticket required).
- Ribeira waterfront. Clérigos Tower.
- Mercado do Bolhão food market.

### Days 8–9: Algarve
- Fly or drive south to the Algarve.
- Ponta da Piedade sea caves (kayak tour recommended).
- Lagos and Sagres beaches.
- Depart from Faro Airport (FAO).

*Visa: {{visa_requirements}} | Currency: Euro | Best months: April–October*',
ARRAY['client_name', 'visa_requirements'],
true),

('5-Day Thailand Beach Escape', 'itinerary', 'Thailand', 'couples',
'# 5-Day Thailand Beach Escape
## For: {{client_name}} | Island: {{island_choice}}

### Day 1 — Arrival
- Fly to {{arrival_airport}}. Transfer to resort.
- Afternoon: Beach orientation, welcome cocktail.
- **Stay:** {{resort_name}}

### Day 2 — Island Exploration
- Morning: Longtail boat tour of surrounding islands and sea caves.
- Afternoon: Snorkeling at coral reef (equipment provided by resort).
- Sunset: Beach dinner with fresh seafood.

### Day 3 — Culture & Temples
- Morning: Visit local Buddhist temple (dress respectfully — cover shoulders/knees).
- Afternoon: Thai cooking class.
- Evening: Night market exploration.

### Day 4 — Adventure Day
- Choose: Sea kayaking, elephant sanctuary visit, or diving excursion.
- (Note: Avoid elephant riding — ethical sanctuaries are walk-alongside only.)
- Sunset boat cruise with dinner.

### Day 5 — Departure
- Final beach morning. Transfer to airport.

*Best season: November–April (dry season). Avoid May–October rainy season for beach holidays.*',
ARRAY['client_name', 'island_choice', 'arrival_airport', 'resort_name'],
true),

-- ============================================
-- PROPOSAL TEMPLATES (10)
-- ============================================
('Standard Travel Proposal', 'proposal', NULL, 'all',
'# Travel Proposal
## Prepared for: {{client_name}}
### Prepared by: {{advisor_name}}, {{business_name}}
### Date: {{proposal_date}} | Valid Until: {{expiry_date}}

---

Dear {{client_name}},

Thank you for choosing {{business_name}} to plan your upcoming trip to {{destination}}. Based on our conversation, I''ve designed the following itinerary with your preferences in mind.

## Your Trip at a Glance
- **Destination:** {{destination}}
- **Dates:** {{travel_dates}}
- **Duration:** {{duration}}
- **Travelers:** {{travelers}}
- **Budget:** {{budget}}

## What''s Included
{{inclusions_list}}

## What''s Not Included
{{exclusions_list}}

## Investment Summary
| Item | Cost |
|---|---|
{{pricing_table}}
| **Total** | **{{total_price}}** |

*Prices are in USD and valid until {{expiry_date}}.*

## Next Steps
1. Review this proposal and let me know any changes
2. Sign the booking agreement
3. Pay deposit of {{deposit_amount}} to hold your dates
4. Final payment due {{final_payment_date}}

I''m confident this will be an unforgettable trip. Please reply to this email or call me at {{advisor_phone}} with any questions.

Warm regards,
{{advisor_name}}
{{business_name}}
{{advisor_email}} | {{advisor_phone}}

---
*Prices are estimates based on current availability. {{business_name}} is not responsible for third-party price changes after confirmation. Travel insurance is strongly recommended.*',
ARRAY['client_name', 'advisor_name', 'business_name', 'proposal_date', 'expiry_date', 'destination', 'travel_dates', 'duration', 'travelers', 'budget', 'inclusions_list', 'exclusions_list', 'pricing_table', 'total_price', 'deposit_amount', 'final_payment_date', 'advisor_phone', 'advisor_email'],
true),

('Luxury Travel Proposal', 'proposal', NULL, 'luxury',
'# Exclusive Travel Experience
## Curated for: {{client_name}}
### {{business_name}} | {{proposal_date}}

---

Dear {{client_name}},

It''s my pleasure to present this exclusive travel experience, designed specifically with your preferences in mind.

## The Experience
{{destination}} | {{travel_dates}} | {{duration}} nights

{{experience_description}}

## Your Private Arrangements
{{private_arrangements}}

## Investment
**Total investment: {{total_price}}** per person, including all arrangements noted above.
A 30% deposit of {{deposit_amount}} secures your dates.

This proposal is held for 7 days. Availability at this level cannot be guaranteed beyond {{expiry_date}}.

Yours sincerely,
{{advisor_name}}
Private Travel Advisor | {{business_name}}',
ARRAY['client_name', 'advisor_name', 'business_name', 'proposal_date', 'destination', 'travel_dates', 'duration', 'experience_description', 'private_arrangements', 'total_price', 'deposit_amount', 'expiry_date'],
true),

('Family Adventure Proposal', 'proposal', NULL, 'families',
'# Family Adventure Proposal
## The {{client_family_name}} Family Trip to {{destination}}
### Prepared by {{advisor_name}} | {{proposal_date}}

---

Hi {{client_first_name}},

I''ve put together a family adventure that balances fun for the kids with experiences the adults will love too. Here''s what I''ve designed:

## Perfect for Your Family
- **Kids ages:** {{children_ages}}
- **What you told me:** {{family_preferences}}
- **Travel dates:** {{travel_dates}}

## The Adventure
{{itinerary_summary}}

## Family-Friendly Features
✅ Kid-safe activities confirmed
✅ Family room accommodations
✅ No long travel legs on any single day
✅ Flexible pace built in

## Investment
| | Per Adult | Per Child |
|---|---|---|
| Package price | {{adult_price}} | {{child_price}} |
| Flights (est.) | {{adult_flight}} | {{child_flight}} |
| **Total per person** | {{adult_total}} | {{child_total}} |

**Family total: {{family_total}}**

Ready to make it official? {{cta_text}}',
ARRAY['client_family_name', 'destination', 'advisor_name', 'proposal_date', 'client_first_name', 'children_ages', 'family_preferences', 'travel_dates', 'itinerary_summary', 'adult_price', 'child_price', 'adult_flight', 'child_flight', 'adult_total', 'child_total', 'family_total', 'cta_text'],
true),

('Honeymoon Proposal', 'proposal', NULL, 'couples',
'# Your Dream Honeymoon
## {{client_names}} | {{destination}}
### Crafted with love by {{advisor_name}}, {{business_name}}

---

Congratulations on your upcoming wedding! I''ve designed a honeymoon that will be as unforgettable as the wedding itself.

## Your Honeymoon in Brief
**Where:** {{destination}}
**When:** {{travel_dates}}
**Duration:** {{duration}} nights
**Style:** {{travel_style}}

## Romance Highlights
{{romance_highlights}}

## Your Accommodations
{{accommodation_details}}
*Complimentary honeymoon upgrade requested at all properties.*

## Romantic Extras Included
- Champagne and flower welcome amenity
- One private dinner for two
- {{extra_inclusions}}

## Investment
**Total: {{total_price}}** for both of you.
*Deposit: {{deposit_amount}} to confirm.*

Start your forever with a trip you''ll talk about for the rest of your lives.

{{advisor_name}}
{{business_name}}',
ARRAY['client_names', 'destination', 'advisor_name', 'business_name', 'travel_dates', 'duration', 'travel_style', 'romance_highlights', 'accommodation_details', 'extra_inclusions', 'total_price', 'deposit_amount'],
true),

('Group Tour Proposal', 'proposal', NULL, 'groups',
'# Group Tour Proposal
## {{group_name}} | {{destination}}
### Organizer: {{organizer_name}} | Advisor: {{advisor_name}}

---

## Group Details
- **Group size:** {{group_size}} travelers
- **Destination:** {{destination}}
- **Dates:** {{travel_dates}}
- **Duration:** {{duration}}

## Inclusions
{{inclusions}}

## Group Pricing
| Group Size | Price Per Person |
|---|---|
| {{min_group}}–{{mid_group}} | {{price_tier_1}} |
| {{mid_group}}+  | {{price_tier_2}} |

**Your group of {{group_size}}: {{your_price}} per person**
**Group total: {{group_total}}**

## Free Places
For groups of 15+: one free place per {{free_place_ratio}} paying travelers.

## Deposit Schedule
- Deposit to hold: {{deposit_per_person}} per person by {{deposit_deadline}}
- Full payment: {{full_payment_deadline}}

This price is guaranteed for {{guarantee_days}} days.',
ARRAY['group_name', 'destination', 'organizer_name', 'advisor_name', 'group_size', 'travel_dates', 'duration', 'inclusions', 'min_group', 'mid_group', 'price_tier_1', 'price_tier_2', 'your_price', 'group_total', 'free_place_ratio', 'deposit_per_person', 'deposit_deadline', 'full_payment_deadline', 'guarantee_days'],
true),

-- ============================================
-- EMAIL TEMPLATES (10)
-- ============================================
('Client Inquiry Response', 'email', NULL, 'all',
'Subject: Your {{destination}} Trip — Let''s Make It Happen

Hi {{client_first_name}},

Thank you for reaching out to {{business_name}}! I''m excited to help plan your trip to {{destination}}.

Based on what you''ve shared, I have some great options in mind. To put together the perfect proposal, I have a few quick questions:

1. **Travel dates:** Do you have specific dates in mind, or are you flexible?
2. **Travelers:** How many people, and are there any children? (Ages help with activity planning.)
3. **Style:** Are you looking for a relaxed trip, action-packed adventure, or a mix of both?
4. **Budget range:** Even a rough ballpark helps me find the best options.

I''ll have a detailed proposal ready within {{turnaround}} business days of hearing back from you.

Looking forward to planning this with you!

Best,
{{advisor_name}}
{{business_name}}
{{advisor_phone}} | {{advisor_email}}',
ARRAY['destination', 'client_first_name', 'business_name', 'turnaround', 'advisor_name', 'advisor_phone', 'advisor_email'],
true),

('Booking Confirmation Email', 'email', NULL, 'all',
'Subject: Your {{destination}} Trip is Confirmed! 🎉

Hi {{client_first_name}},

Great news — your trip to {{destination}} is officially confirmed! Here''s everything you need to know.

## Your Booking Reference
**Reference:** {{booking_ref}}
**Destination:** {{destination}}
**Travel Dates:** {{travel_dates}}
**Travelers:** {{traveler_names}}

## What''s Next
- [ ] Receive your detailed travel documents by {{documents_date}}
- [ ] Check passport expiry (must be valid 6 months beyond return date)
- [ ] {{visa_action}} — your visa requirement
- [ ] Purchase travel insurance by {{insurance_deadline}}
- [ ] Final payment due: {{final_payment_date}}

## Your Travel Documents
Your full travel pack — flights, hotel vouchers, and day-by-day guide — will be sent to this email by {{documents_date}}.

## Questions?
I''m always here: {{advisor_email}} or {{advisor_phone}}.

So excited for you. {{destination}} is going to be incredible!

{{advisor_name}}
{{business_name}}',
ARRAY['destination', 'client_first_name', 'booking_ref', 'travel_dates', 'traveler_names', 'documents_date', 'visa_action', 'insurance_deadline', 'final_payment_date', 'advisor_email', 'advisor_phone', 'advisor_name', 'business_name'],
true),

('Payment Reminder Email', 'email', NULL, 'all',
'Subject: Friendly Reminder — Final Payment Due {{due_date}}

Hi {{client_first_name}},

Just a quick reminder that the final payment for your {{destination}} trip is due on **{{due_date}}**.

## Payment Details
**Amount due:** {{amount_due}}
**Due date:** {{due_date}}
**Reference:** {{booking_ref}}

You can pay by: {{payment_methods}}

If payment isn''t received by {{due_date}}, your reservation may be released. If you need to discuss the payment schedule, please reach out as soon as possible.

**Pay now:** {{payment_link}}

Thanks for choosing {{business_name}} — can''t wait to help you experience {{destination}}!

{{advisor_name}}',
ARRAY['client_first_name', 'destination', 'due_date', 'amount_due', 'booking_ref', 'payment_methods', 'payment_link', 'advisor_name', 'business_name'],
true),

('Pre-Departure Checklist Email', 'email', NULL, 'all',
'Subject: Your {{destination}} Trip is {{days_away}} Days Away — Everything You Need

Hi {{client_first_name}},

The countdown is on! Here''s everything you need to prepare for an amazing trip.

## Before You Leave
✅ Passport valid 6 months past {{return_date}}
✅ {{visa_status}}
✅ Travel insurance confirmed (policy: {{insurance_policy}})
✅ Notify your bank of travel dates
✅ Download offline maps for {{destination}}
✅ Pack adaptor for {{plug_type}} outlets
✅ Check airline baggage allowance: {{baggage_allowance}}

## Your Flights
**Outbound:** {{outbound_flight_details}}
**Return:** {{return_flight_details}}

## First Night
**Hotel:** {{first_hotel}} | Check-in: {{checkin_time}}
**Address:** {{hotel_address}}

## Emergency Contacts
- **Your advisor:** {{advisor_phone}} (available 24/7 for emergencies)
- **Local emergency:** {{local_emergency}}
- **Embassy/Consulate:** {{embassy_number}}

Have an incredible trip!

{{advisor_name}}
{{business_name}}',
ARRAY['destination', 'client_first_name', 'days_away', 'return_date', 'visa_status', 'insurance_policy', 'plug_type', 'baggage_allowance', 'outbound_flight_details', 'return_flight_details', 'first_hotel', 'checkin_time', 'hotel_address', 'advisor_phone', 'local_emergency', 'embassy_number', 'advisor_name', 'business_name'],
true),

('Post-Trip Follow-Up Email', 'email', NULL, 'all',
'Subject: Hope {{destination}} Was Everything You Dreamed Of!

Hi {{client_first_name}},

Welcome home! I hope you''re still riding the high from your {{destination}} trip.

I''d love to hear how it went — any highlights, surprises, or moments that took your breath away?

When you get a minute, it would mean the world if you could:

**Leave a quick review:** {{review_link}}

Your feedback helps other travelers trust us with their trips — and it genuinely makes a difference.

## Already Thinking About Your Next Adventure?
Based on what I know about you, I think you''d love:
- **{{suggestion_1}}** — {{suggestion_1_reason}}
- **{{suggestion_2}}** — {{suggestion_2_reason}}

Reply to this email anytime — I''m always happy to start dreaming up the next one.

Until the next adventure,
{{advisor_name}}
{{business_name}}',
ARRAY['destination', 'client_first_name', 'review_link', 'suggestion_1', 'suggestion_1_reason', 'suggestion_2', 'suggestion_2_reason', 'advisor_name', 'business_name'],
true),

('Visa Requirements Email', 'email', NULL, 'all',
'Subject: Visa Information for Your {{destination}} Trip

Hi {{client_first_name}},

Here''s the visa information for your {{destination}} trip based on your {{nationality}} passport.

## Visa Requirement
**Status:** {{visa_status}}
{{visa_details}}

## Important Dates
- **Application opens:** {{application_open}}
- **Apply by:** {{apply_by}} (we recommend applying as soon as possible)
- **Processing time:** {{processing_time}}
- **Cost:** {{visa_cost}}

## How to Apply
{{application_instructions}}

## Documents Required
{{required_documents}}

---
*This information is current as of {{info_date}}. Visa requirements can change — always verify directly with the {{destination}} embassy or consulate before travel.*

Any questions? I''m happy to help.

{{advisor_name}}',
ARRAY['destination', 'client_first_name', 'nationality', 'visa_status', 'visa_details', 'application_open', 'apply_by', 'processing_time', 'visa_cost', 'application_instructions', 'required_documents', 'info_date', 'advisor_name'],
true),

('Trip Cancellation Notice', 'email', NULL, 'all',
'Subject: Important Update Regarding Your {{destination}} Trip

Hi {{client_first_name}},

I''m sorry to be writing with this news. Unfortunately, {{cancellation_reason}}, and we need to discuss your options.

## What This Means for Your Booking
{{impact_description}}

## Your Options
1. **Rebook for a later date** — I can rebook you for {{alternative_dates}} at no rebooking fee
2. **Change destination** — I can redirect your deposit to any other trip we plan together
3. **Full refund** — Subject to supplier cancellation terms: {{refund_details}}

## Refund Timeline
If applicable, refunds will be processed within {{refund_timeline}}.

I know this is disappointing, and I''m sorry. Please reply or call me at {{advisor_phone}} and we''ll find the best path forward together.

{{advisor_name}}
{{business_name}}',
ARRAY['destination', 'client_first_name', 'cancellation_reason', 'impact_description', 'alternative_dates', 'refund_details', 'refund_timeline', 'advisor_phone', 'advisor_name', 'business_name'],
true),

('Travel Insurance Recommendation', 'email', NULL, 'all',
'Subject: Don''t Forget Travel Insurance for {{destination}}

Hi {{client_first_name}},

Before your trip to {{destination}}, I want to make sure you''re protected with the right travel insurance.

## Why It Matters
With {{total_trip_cost}} invested in this trip, insurance protects you against:
- Trip cancellation or interruption (including medical emergencies)
- Medical expenses abroad ({{destination}} healthcare costs: {{healthcare_note}})
- Lost or delayed baggage
- Emergency evacuation

## What I Recommend
For your specific trip, I suggest a policy that includes:
- **Trip cancellation:** 100% of trip cost
- **Medical coverage:** Minimum $100,000 (higher for remote destinations)
- **Emergency evacuation:** Minimum $500,000
- **Cancel For Any Reason (CFAR):** Highly recommended for flexibility

## Options to Consider
{{insurance_options}}

*I am not an insurance agent and cannot sell or advise on specific policies. The above is general guidance only. Please read all policy terms before purchasing.*

{{advisor_name}}',
ARRAY['destination', 'client_first_name', 'total_trip_cost', 'healthcare_note', 'insurance_options', 'advisor_name'],
true),

('Group Departure Logistics Email', 'email', NULL, 'groups',
'Subject: {{destination}} Group Trip — Final Logistics

Hi everyone,

We''re {{days_away}} days away from departure and I want to make sure everything runs smoothly. Here''s everything you need to know.

## Meeting Point
**Date:** {{departure_date}}
**Time:** {{meeting_time}} (please arrive 15 minutes early)
**Location:** {{meeting_point}}
**Look for:** {{identifier}} (how to find our group)

## What to Bring
{{packing_list}}

## Group Contact
Save my number: {{advisor_phone}}
Group WhatsApp: {{whatsapp_link}}

## Final Reminders
- {{reminder_1}}
- {{reminder_2}}
- {{reminder_3}}

See you all very soon!

{{advisor_name}}
{{business_name}}',
ARRAY['destination', 'days_away', 'departure_date', 'meeting_time', 'meeting_point', 'identifier', 'packing_list', 'advisor_phone', 'whatsapp_link', 'reminder_1', 'reminder_2', 'reminder_3', 'advisor_name', 'business_name'],
true),

('Referral Thank You Email', 'email', NULL, 'all',
'Subject: Thank You for the Referral, {{client_first_name}}!

Hi {{client_first_name}},

I just wanted to say a big thank you for referring {{referred_name}} to {{business_name}}. It means so much that you trusted me with someone you know.

As a thank you, I''ve applied a {{credit_amount}} credit to your account — ready to use on your next trip.

## Your Referral Credit
**Amount:** {{credit_amount}}
**Valid until:** {{credit_expiry}}
**How to use:** Just mention it when we start planning your next adventure.

Looking forward to helping you both travel the world!

{{advisor_name}}
{{business_name}}',
ARRAY['client_first_name', 'referred_name', 'business_name', 'credit_amount', 'credit_expiry', 'advisor_name'],
true),

-- ============================================
-- SOCIAL MEDIA TEMPLATES (7)
-- ============================================
('Instagram Tour Package Post', 'social_media', NULL, 'all',
'✈️ New tour just dropped!

{{tour_name}} | {{destination}} | {{duration}} days

{{short_description}}

What''s included:
✅ {{inclusion_1}}
✅ {{inclusion_2}}
✅ {{inclusion_3}}
✅ {{inclusion_4}}

Starting from just {{price_from}} per person.

Dates available: {{available_dates}}

Ready to go? Link in bio to book, or DM us for a personalised quote 💌

{{hashtags}}',
ARRAY['tour_name', 'destination', 'duration', 'short_description', 'inclusion_1', 'inclusion_2', 'inclusion_3', 'inclusion_4', 'price_from', 'available_dates', 'hashtags'],
true),

('Facebook Travel Deal Post', 'social_media', NULL, 'all',
'🌍 TRAVEL DEAL | {{destination}}

We''ve just released {{tour_name}} and spots are filling fast.

📅 Dates: {{travel_dates}}
👥 Group size: Limited to {{max_travelers}} travelers
💰 From: {{price_from}} per person
⏰ Book by: {{booking_deadline}} for early bird pricing

What makes this trip special:
→ {{highlight_1}}
→ {{highlight_2}}
→ {{highlight_3}}

Questions? Drop them in the comments or send us a message.

{{cta}} 👉 {{booking_link}}',
ARRAY['destination', 'tour_name', 'travel_dates', 'max_travelers', 'price_from', 'booking_deadline', 'highlight_1', 'highlight_2', 'highlight_3', 'cta', 'booking_link'],
true),

('Client Travel Story Post', 'social_media', NULL, 'all',
'Client story ❤️

{{client_first_name}} just got back from {{destination}} and we couldn''t be happier for them.

"{{client_quote}}"

This is exactly why we do what we do. Helping {{client_type}} experience the world and come home with stories that last a lifetime.

Planning your own {{destination}} trip? We''d love to help.

DM us or visit the link in bio.

{{hashtags}}',
ARRAY['client_first_name', 'destination', 'client_quote', 'client_type', 'hashtags'],
true),

('Destination Spotlight Post', 'social_media', NULL, 'all',
'🗺️ Destination of the Month: {{destination}}

Here''s why {{destination}} should be on your 2025 travel list:

🌟 {{reason_1}}
🌟 {{reason_2}}
🌟 {{reason_3}}
🌟 {{reason_4}}

Best time to visit: {{best_time}}
Getting there: {{how_to_get_there}}
Starting budget: From {{budget_from}} per person

Save this post for when you''re ready to plan 📌

Have you been? Drop a 🙋 in the comments!

{{hashtags}}',
ARRAY['destination', 'reason_1', 'reason_2', 'reason_3', 'reason_4', 'best_time', 'how_to_get_there', 'budget_from', 'hashtags'],
true),

('Last Minute Deal Post', 'social_media', NULL, 'all',
'⚡ LAST MINUTE | {{destination}} — {{dates}}

Spaces just opened up on our {{tour_name}} departure.

{{last_minute_price}} per person (was {{original_price}})
Departure: {{departure_date}} — only {{spaces_left}} spots left

What''s included: {{inclusions_brief}}

This won''t last. First come, first served.

DM "{{destination_code}}" to secure your spot now.

{{hashtags}}',
ARRAY['destination', 'dates', 'tour_name', 'last_minute_price', 'original_price', 'departure_date', 'spaces_left', 'inclusions_brief', 'destination_code', 'hashtags'],
true),

('Travel Tips Educational Post', 'social_media', NULL, 'all',
'{{number}} tips for travelling to {{destination}} in {{year}} 🧳

Most people don''t know these:

1️⃣ {{tip_1}}
2️⃣ {{tip_2}}
3️⃣ {{tip_3}}
4️⃣ {{tip_4}}
5️⃣ {{tip_5}}

Bonus: {{bonus_tip}}

Save this before your trip 📌

Planning a trip to {{destination}}? We can handle everything — DM us or link in bio.

{{hashtags}}',
ARRAY['number', 'destination', 'year', 'tip_1', 'tip_2', 'tip_3', 'tip_4', 'tip_5', 'bonus_tip', 'hashtags'],
true),

('New Tour Announcement Post', 'social_media', NULL, 'all',
'🚀 JUST LAUNCHED: {{tour_name}}

We''ve been working on this one for months and it''s finally here.

{{tour_description}}

📍 {{destination}}
📅 {{departure_dates}}
👥 Maximum {{group_size}} people
💰 From {{price}}

Early bird offer: {{early_bird_offer}} — ends {{early_bird_deadline}}

Full details at the link in bio. Questions? We''re in the DMs.

{{hashtags}}',
ARRAY['tour_name', 'tour_description', 'destination', 'departure_dates', 'group_size', 'price', 'early_bird_offer', 'early_bird_deadline', 'hashtags'],
true),

-- ============================================
-- INVOICE TEMPLATES (4)
-- ============================================
('Standard Travel Invoice', 'invoice', NULL, 'all',
'INVOICE

{{business_name}}
{{business_address}}
{{business_phone}} | {{business_email}}

---

INVOICE TO:
{{client_name}}
{{client_email}}

Invoice #: {{invoice_number}}
Invoice Date: {{invoice_date}}
Due Date: {{due_date}}

---

SERVICES

| Description | Amount |
|---|---|
{{line_items}}

| | |
|---|---|
| Subtotal | {{subtotal}} |
| Taxes/Fees | {{taxes}} |
| **TOTAL DUE** | **{{total_due}}** |

---

PAYMENT DETAILS
{{payment_instructions}}

Reference: {{invoice_number}}

---
Thank you for your business.
{{business_name}} | {{business_phone}}',
ARRAY['business_name', 'business_address', 'business_phone', 'business_email', 'client_name', 'client_email', 'invoice_number', 'invoice_date', 'due_date', 'line_items', 'subtotal', 'taxes', 'total_due', 'payment_instructions'],
true),

('Deposit Invoice', 'invoice', NULL, 'all',
'DEPOSIT INVOICE

{{business_name}}

To: {{client_name}}
Invoice #: {{invoice_number}}-DEP
Date: {{invoice_date}}

Trip: {{trip_description}}
Travel Dates: {{travel_dates}}

---

DEPOSIT REQUIRED TO CONFIRM BOOKING

| | |
|---|---|
| Total Trip Value | {{total_value}} |
| Deposit ({{deposit_pct}}%) | {{deposit_amount}} |
| **Amount Due Now** | **{{deposit_amount}}** |
| Balance Due | {{balance_due}} |
| Balance Due Date | {{balance_due_date}} |

---
{{payment_instructions}}

By paying this deposit you confirm acceptance of our booking terms and cancellation policy.

{{advisor_name}} | {{business_name}}',
ARRAY['business_name', 'client_name', 'invoice_number', 'invoice_date', 'trip_description', 'travel_dates', 'total_value', 'deposit_pct', 'deposit_amount', 'balance_due', 'balance_due_date', 'payment_instructions', 'advisor_name'],
true),

('Final Balance Invoice', 'invoice', NULL, 'all',
'FINAL BALANCE INVOICE

{{business_name}}

To: {{client_name}}
Invoice #: {{invoice_number}}-FINAL
Date: {{invoice_date}}
**DUE DATE: {{due_date}}**

Trip: {{trip_description}} | {{travel_dates}}

---

| | |
|---|---|
| Total Trip Value | {{total_value}} |
| Less Deposit Paid ({{deposit_date}}) | -{{deposit_paid}} |
| **Final Balance Due** | **{{balance_due}}** |

---
**IMPORTANT:** Final balance must be received by {{due_date}}.
Failure to pay by this date may result in cancellation and loss of deposit.

{{payment_instructions}}

{{advisor_name}} | {{business_name}} | {{advisor_phone}}',
ARRAY['business_name', 'client_name', 'invoice_number', 'invoice_date', 'due_date', 'trip_description', 'travel_dates', 'total_value', 'deposit_date', 'deposit_paid', 'balance_due', 'payment_instructions', 'advisor_name', 'advisor_phone'],
true),

('Group Tour Invoice', 'invoice', NULL, 'groups',
'GROUP TOUR INVOICE

{{business_name}}

Group: {{group_name}}
Contact: {{group_organizer}}
Invoice #: {{invoice_number}}
Date: {{invoice_date}}

Tour: {{tour_name}}
Destination: {{destination}}
Dates: {{travel_dates}}

---

| Traveler | Amount |
|---|---|
{{traveler_line_items}}

| | |
|---|---|
| Subtotal | {{subtotal}} |
| Group discount | -{{discount}} |
| **Total** | **{{total_due}}** |
| Deposit paid | -{{deposit_paid}} |
| **Balance Due** | **{{balance_due}}** |

Due date: {{due_date}}

{{payment_instructions}}

{{advisor_name}} | {{business_name}}',
ARRAY['business_name', 'group_name', 'group_organizer', 'invoice_number', 'invoice_date', 'tour_name', 'destination', 'travel_dates', 'traveler_line_items', 'subtotal', 'discount', 'total_due', 'deposit_paid', 'balance_due', 'due_date', 'payment_instructions', 'advisor_name'],
true),

-- ============================================
-- DESTINATION REPORT TEMPLATES (4)
-- ============================================
('Full Destination Research Report', 'report', NULL, 'all',
'# {{destination}} Destination Report
## Prepared by TripDesk.ai for {{business_name}}
### Research Date: {{report_date}} | All data verified as of this date

---

## 1. Destination Overview
{{destination_overview}}

## 2. Best Time to Visit
| Season | Months | Weather | Crowds | Prices |
|---|---|---|---|---|
{{seasonal_table}}

**Recommendation:** {{best_season_recommendation}}

## 3. Visa Requirements by Nationality
| Nationality | Visa Required | How to Apply | Cost | Processing Time |
|---|---|---|---|---|
{{visa_table}}

*Source: Official embassy/government websites as of {{report_date}}. Verify before advising clients.*

## 4. US State Department Advisory
**Current Level:** {{advisory_level}} — {{advisory_description}}
**Source:** travel.state.gov | Checked: {{report_date}}
{{advisory_details}}

## 5. Getting There
**Main Airports:** {{airports}}
**Airlines:** {{airlines}}
**Average Flight Time from US:** {{flight_time}}
**Typical Round-Trip Fares:** {{fare_range}}

## 6. Getting Around
{{transportation_section}}

## 7. Accommodation Guide
| Category | Price Range | Best Areas |
|---|---|---|
{{accommodation_table}}

## 8. Average Trip Costs (Per Person Per Day)
| Category | Budget | Mid-Range | Luxury |
|---|---|---|---|
| Accommodation | {{budget_hotel}} | {{mid_hotel}} | {{luxury_hotel}} |
| Meals | {{budget_food}} | {{mid_food}} | {{luxury_food}} |
| Activities | {{budget_activities}} | {{mid_activities}} | {{luxury_activities}} |
| Local transport | {{budget_transport}} | {{mid_transport}} | {{luxury_transport}} |
| **Total** | **{{budget_total}}** | **{{mid_total}}** | **{{luxury_total}}** |

*Prices in USD, estimates only, subject to change.*

## 9. Top Experiences
{{top_experiences}}

## 10. Hidden Gems
{{hidden_gems}}

## 11. Cultural Notes & Etiquette
{{cultural_notes}}

## 12. Health & Safety
{{health_safety}}

## 13. Packing Guide
{{packing_guide}}

---
*This report is for internal advisor use. All dynamic information (prices, advisories, visa rules) must be verified before communicating to clients. Information is believed accurate as of {{report_date}}.*',
ARRAY['destination', 'business_name', 'report_date', 'destination_overview', 'seasonal_table', 'best_season_recommendation', 'visa_table', 'advisory_level', 'advisory_description', 'advisory_details', 'airports', 'airlines', 'flight_time', 'fare_range', 'transportation_section', 'accommodation_table', 'budget_hotel', 'mid_hotel', 'luxury_hotel', 'budget_food', 'mid_food', 'luxury_food', 'budget_activities', 'mid_activities', 'luxury_activities', 'budget_transport', 'mid_transport', 'luxury_transport', 'budget_total', 'mid_total', 'luxury_total', 'top_experiences', 'hidden_gems', 'cultural_notes', 'health_safety', 'packing_guide'],
true),

('Quick Destination Brief', 'report', NULL, 'all',
'# {{destination}} — Quick Brief
## {{report_date}} | For internal use

**State Dept Advisory:** {{advisory_level}} | {{advisory_summary}}
**Best time to visit:** {{best_months}}
**Visa (US passport):** {{visa_us}}
**Currency:** {{currency}} | Approx. exchange: {{exchange_rate}}
**Language:** {{language}}
**Time zone:** {{timezone}}

## Can''t Miss
1. {{highlight_1}}
2. {{highlight_2}}
3. {{highlight_3}}

## Typical Budget (per person per day)
- Budget: {{budget}}
- Mid-range: {{midrange}}
- Luxury: {{luxury}}

## Watch Out For
{{warnings}}

## Advisor Tips
{{advisor_tips}}

*Source: {{sources}} | {{report_date}}*',
ARRAY['destination', 'report_date', 'advisory_level', 'advisory_summary', 'best_months', 'visa_us', 'currency', 'exchange_rate', 'language', 'timezone', 'highlight_1', 'highlight_2', 'highlight_3', 'budget', 'midrange', 'luxury', 'warnings', 'advisor_tips', 'sources'],
true),

('Visa Requirements Report', 'report', NULL, 'all',
'# Visa Requirements Report
## Destination: {{destination}}
## Client: {{client_name}} | Nationality: {{client_nationality}}
## Prepared: {{report_date}}

---

## Visa Requirement
**Status:** {{visa_status}}
**Type:** {{visa_type}}

## Details
{{visa_details}}

## Application Process
**Where to apply:** {{application_source}}
**Cost:** {{visa_cost}}
**Processing time:** {{processing_time}}
**How far in advance:** Apply at least {{advance_time}} before travel

## Required Documents
{{required_docs}}

## Entry Requirements
- Passport valid until: {{passport_validity_required}}
- {{other_entry_requirements}}

## Important Notes
{{important_notes}}

---
*Information sourced from: {{source_name}} on {{report_date}}. Visa requirements change frequently — verify directly with the relevant embassy before advising the client to apply.*

**US Embassy/Consulate in {{destination}}:** {{embassy_contact}}',
ARRAY['destination', 'client_name', 'client_nationality', 'report_date', 'visa_status', 'visa_type', 'visa_details', 'application_source', 'visa_cost', 'processing_time', 'advance_time', 'required_docs', 'passport_validity_required', 'other_entry_requirements', 'important_notes', 'source_name', 'embassy_contact'],
true),

('Travel Advisory Summary', 'report', NULL, 'all',
'# US State Department Travel Advisory
## Destination: {{destination}}
## Checked: {{check_date}} | Source: travel.state.gov

---

## Advisory Level
# Level {{level}}: {{level_description}}

## Official Summary
{{official_summary}}

## Key Risk Areas
{{risk_areas}}

## Recommended Precautions
{{precautions}}

## Restricted Areas
{{restricted_areas}}

## Emergency Contacts
- **US Embassy in {{destination}}:** {{embassy_phone}}
- **Emergency line:** {{emergency_line}}
- **STEP Program:** Register at step.state.gov

---
**Advisor Note:** {{advisor_recommendation}}

*This advisory was accurate as of {{check_date}}. Advisories can change rapidly. Always check travel.state.gov before finalising client travel to this destination.*',
ARRAY['destination', 'check_date', 'level', 'level_description', 'official_summary', 'risk_areas', 'precautions', 'restricted_areas', 'embassy_phone', 'emergency_line', 'advisor_recommendation'],
true);
