const SUSTAINABLE_LOCATIONS = [
    {
        id: 'karls-kraut',
        name: 'Karls Kraut',
        lat: 47.05251,
        lng: 8.30152,
        category: 'vegan',
        sdg: [12, 13],
        description: 'Popular entirely vegan restaurant known for its plant-based, natural cuisine using regional organic products. Located directly on the Reuss river.',
        address: 'St. Karliquai 7, 6004 Luzern'
    },
    {
        id: 'tibits',
        name: 'Tibits Luzern',
        lat: 47.05003,
        lng: 8.30977,
        category: 'vegan',
        sdg: [12, 13],
        description: 'Vegetarian and vegan buffet restaurant with a wide selection of globally inspired dishes. Great for quick, healthy meals.',
        address: 'Zentralstrasse 1, 6003 Luzern (Level 1 Train Station)'
    },
    {
        id: 'veganitas',
        name: 'Veganitas',
        lat: 47.05047,
        lng: 8.31073,
        category: 'vegan',
        description: 'Sustainable fast food offering fresh vegan kebabs and pitas with homemade sauces baked daily.',
        address: 'Zentralstrasse 1, 6003 Luzern (Train Station level -1)'
    },
    {
        id: 'bayts',
        name: 'BAYTS Bistro & Bar',
        lat: 47.04903,
        lng: 8.30124,
        category: 'vegan',
        description: 'Known for homemade vegan Döner, offering simple refined dishes for lunch and a varied dinner menu.',
        address: 'Bruchstrasse 45, 6003 Luzern'
    },
    {
        id: 'unverpackt',
        name: 'Unverpackt Luzern',
        lat: 47.04532,
        lng: 8.30830,
        category: 'zero-waste',
        sdg: [12],
        description: 'Lucerne\'s premier zero-waste shop offering a wide variety of bulk foods, household items, and cosmetics without packaging.',
        address: 'Bundesplatz 10, 6003 Luzern'
    },
    {
        id: 'prima-natura',
        name: 'Prima Natura',
        lat: 47.05266,
        lng: 8.30634,
        category: 'zero-waste',
        description: 'Health food store with plant-based organic products, many available unpackaged or in bulk.',
        address: 'Bruchstrasse 35, 6003 Luzern'
    },
    {
        id: 'schweizerhof',
        name: 'Hotel Schweizerhof Luzern',
        lat: 47.05431,
        lng: 8.31017,
        category: 'eco-hotel',
        sdg: [11],
        description: 'Swisstainable Level III leader and ISO 14001 certified hotel, demonstrating strong environmental management.',
        address: 'Schweizerhofquai, 6002 Luzern'
    },
    {
        id: 'grand-hotel-national',
        name: 'Grand Hotel National',
        lat: 47.05479,
        lng: 8.31494,
        category: 'eco-hotel',
        description: 'Luxury hotel committed to sustainability, sourcing regional products, converting to LED, and reducing water usage.',
        address: 'Haldenstrasse 4, 6006 Luzern'
    },
    {
        id: 'hermitage',
        name: 'HERMITAGE Lake Lucerne',
        lat: 47.04265,
        lng: 8.35010,
        category: 'eco-hotel',
        description: 'Swisstainable Level II recognized hotel, minimizing food waste and using regional products, located right on the lake.',
        address: 'Seeburgstrasse 72, 6006 Luzern'
    },
    {
        id: 'ms-diamant',
        name: 'MS Diamant (Lake Lucerne Navigation)',
        lat: 47.04738,
        lng: 8.31420,
        category: 'activity',
        sdg: [13],
        description: 'Climate-neutral passenger boat operating on Lake Lucerne, offering scenic, eco-friendly cruises.',
        address: 'Werftstrasse 667, 6005 Luzern (Departure Point)'
    },
    {
        id: 'kkl-luzern',
        name: 'KKL Luzern',
        lat: 47.05030,
        lng: 8.31211,
        category: 'activity',
        description: 'Swisstainable Level III certified cultural and convention center focusing on local suppliers and minimizing CO2 emissions.',
        address: 'Europaplatz 1, 6005 Luzern'
    },
    // --- NEW PHASE 3 LOCATIONS ---
    // Second Hand Stores
    {
        id: 'ali-baba-vintage',
        name: 'Ali Baba Vintage',
        lat: 47.05276,
        lng: 8.30581,
        category: 'secondhand',
        description: 'Cult second-hand shop in the old town featuring 70s-inspired retro clothing, vintage fashion, and unique accessories.',
        address: 'Weggisgasse 25, 6004 Luzern'
    },
    {
        id: 'tootsies-secondhand',
        name: 'Tootsies Second Hand',
        lat: 47.04735,
        lng: 8.30554,
        category: 'secondhand',
        description: 'High-end designer second-hand fashion for men and women, operating for over 24 years.',
        address: 'Kauffmannweg 8, 6003 Luzern'
    },
    {
        id: 'the-secondhand',
        name: 'The Secondhand',
        lat: 47.04901,
        lng: 8.30120,
        category: 'secondhand',
        description: 'Chic, modern thrift store focused on curated second-hand fashion from popular and sustainable brands.',
        address: 'Bruchstrasse 45, 6003 Luzern'
    },
    // EV Charging Stations
    {
        id: 'ev-messe-allmend',
        name: 'EV Charging - Messe Allmend',
        lat: 47.03981,
        lng: 8.30604,
        category: 'ev-charging',
        description: 'Public EV charging station (22 kW AC Type 2) located at the Messe Allmend parking area.',
        address: 'Horwerstrasse 89, 6005 Luzern'
    },
    {
        id: 'ev-adligenswilerstrasse',
        name: 'EV Charging - Adligenswilerstrasse',
        lat: 47.05562,
        lng: 8.31427,
        category: 'ev-charging',
        description: 'Public EV charging station (22 kW AC Type 2) operated by the local network.',
        address: 'Adligenswilerstrasse 22, 6006 Luzern'
    },
    {
        id: 'ev-bahnhof',
        name: 'EV Charging - Train Station',
        lat: 47.05047,
        lng: 8.31057,
        category: 'ev-charging',
        description: 'Convenient eCarUp AG EV charging stations located directly at the Luzern main train station.',
        address: 'Bahnhofplatz 1, 6003 Luzern'
    },
    // Bike Rental (Nextbike / City Bike)
    {
        id: 'bike-kkl',
        name: 'Nextbike Station - KKL',
        lat: 47.05028,
        lng: 8.31222,
        category: 'bike-rental',
        description: 'Official nextbike rental and return station located at the KKL. First 30 mins free for Luzern residents.',
        address: 'Europaplatz 1, 6005 Luzern'
    },
    {
        id: 'bike-loewenplatz',
        name: 'Nextbike Station - Löwenplatz',
        lat: 47.05739,
        lng: 8.31037,
        category: 'bike-rental',
        description: 'City bike sharing station near the Lion Monument and Bourbaki Panorama.',
        address: 'Löwenplatz, 6004 Luzern'
    },
    {
        id: 'bike-bahnhof',
        name: 'Nextbike Station - Bahnhof',
        lat: 47.04961,
        lng: 8.31174,
        category: 'bike-rental',
        description: 'Major bike rental hub located at the Luzern main train station for easy commuting.',
        address: 'Bahnhofplatz, 6003 Luzern'
    },
    // Swisstainable
    {
        id: 'swisstainable-flora',
        name: 'AMERON Luzern Hotel Flora',
        lat: 47.05068,
        lng: 8.30907,
        category: 'swisstainable',
        description: 'Proud Swisstainable-classified establishment blending modern comfort with strong ecological commitments.',
        address: 'Seidenhofstrasse 5, 6002 Luzern'
    },
    {
        id: 'swisstainable-glacier',
        name: 'Glacier Garden Lucerne',
        lat: 47.05856,
        lng: 8.30965,
        category: 'swisstainable',
        description: 'Fascinating natural monument and museum committed to the Swisstainable program, preserving local geological history.',
        address: 'Denkmalstrasse 4, 6006 Luzern'
    },
    {
        id: 'swisstainable-stadtkeller',
        name: 'Stadtkeller Restaurant',
        lat: 47.05263,
        lng: 8.30541,
        category: 'swisstainable',
        description: 'Traditional Swiss folklore restaurant offering regional specialties and recognized for its sustainable tourism efforts.',
        address: 'Sternenplatz 3, 6004 Luzern'
    },

    // --- Phase 6: More Community, Culture & Nature ---

    // Cultural Spots
    {
        id: 'neubad',
        name: 'Neubad Luzern',
        lat: 47.04118,
        lng: 8.30706,
        category: 'activity',
        description: 'Beloved community hub in a converted indoor swimming pool. Hosts concerts, markets, theatre, a café-bar, and creative events with a strong sustainability ethos.',
        address: 'Bireggstrasse 36, 6003 Luzern'
    },
    {
        id: 'treibhaus',
        name: 'Treibhaus Luzern',
        lat: 47.04251,
        lng: 8.31923,
        category: 'activity',
        description: 'Iconic cultural hub and coffee bar hosting exhibitions, concerts, and creative events. A pillar of the Lucerne alternative and ecological scene.',
        address: 'Spelteriniweg 4, 6003 Luzern'
    },
    {
        id: 'lucerne-festival',
        name: 'Lucerne Festival',
        lat: 47.05030,
        lng: 8.31211,
        category: 'swisstainable',
        description: 'World-class music festival and Swisstainable Level II certified. Features a sustainability officer, CO2 reduction goals, and the 2024 ESG Transparency Award.',
        address: 'Europaplatz 1, 6005 Luzern'
    },

    // Outdoor Swimming / Nature
    {
        id: 'seebad-luzern',
        name: 'Seebad Luzern',
        lat: 47.05459,
        lng: 8.31864,
        category: 'activity',
        description: 'Historic lakeside swimming bath on Lake Lucerne. Features a vegetarian-leaning bistro with fresh, seasonal food and a beautifully renovated wooden bathing house.',
        address: 'Nationalquai, 6006 Luzern'
    },
    {
        id: 'lido-luzern',
        name: 'Lido Luzern',
        lat: 47.04982,
        lng: 8.33601,
        category: 'activity',
        description: 'The largest and most popular public beach in Lucerne. Open green spaces, direct lake access, and located beside the Swiss Museum of Transport.',
        address: 'Lidostrasse 6a, 6006 Luzern'
    },
    {
        id: 'strandbad-tribschen',
        name: 'Strandbad Tribschen',
        lat: 47.04051,
        lng: 8.32890,
        category: 'activity',
        description: 'Renovated lakeside Badi (2024) with solar photovoltaic panels and ecological areas for flora & fauna. A climate trail educates visitors about sustainability in nature.',
        address: 'Tribschenstrasse, 6005 Luzern'
    },
    {
        id: 'waldbad-zimmeregg',
        name: 'Waldbad Zimmeregg',
        lat: 47.03111,
        lng: 8.29514,
        category: 'activity',
        description: 'Forest swimming pool fully renovated in 2024. Features stainless steel pools, a large playground, and an ecological climate trail through the forest.',
        address: 'Zimmereggstrasse, 6015 Luzern Reussbühl'
    },

    // More Vegan / Sustainable Dining
    {
        id: 'plant-luzern',
        name: 'Plant Luzern',
        lat: 47.04841,
        lng: 8.30508,
        category: 'vegan',
        description: 'Vegan fine dining restaurant where vegetables take centre stage, alongside creative seasonal dishes and inventive non-alcoholic beverages.',
        address: 'Pilatusstrasse 26, 6003 Luzern'
    },
    {
        id: 'sentitreff',
        name: 'Sentitreff',
        lat: 47.05190,
        lng: 8.29736,
        category: 'vegan',
        description: 'Community restaurant serving fresh, locally-sourced meals with vegetarian options. Operates a pay-what-you-can model — sustainability meets social responsibility.',
        address: 'Baselstrasse 21, 6003 Luzern'
    },
    {
        id: 'gartenhaus',
        name: 'gartenHAUS',
        lat: 47.04426,
        lng: 8.28942,
        category: 'vegan',
        description: '"Green oasis" restaurant using regional and seasonal ingredients. Creative vegetable-forward menu with a strong focus on reducing food waste. Also caters for meat-eaters.',
        address: 'Lindenstrasse 21, 6015 Luzern Reussbühl'
    },
    {
        id: 'cafe-voliere',
        name: 'Café Bar Volière',
        lat: 47.04934,
        lng: 8.31365,
        category: 'vegan',
        description: 'Outdoor vegetarian café by Inseliquai on Lake Lucerne. Known for seasonal drinks, fresh snacks, and a relaxed atmosphere in a repurposed container.',
        address: 'Inseliquai, 6005 Luzern'
    },
    {
        id: 'pinakarri',
        name: 'Pinakarri',
        lat: 47.05508,
        lng: 8.30972,
        category: 'vegan',
        description: 'Vegetarian café and deli committed to preventing food waste. Offers daily baked goods and regional products — entry by recommendation to keep quality intentional.',
        address: 'Hertensteinstrasse 22, 6004 Luzern'
    },

    // Zero Waste / Organic
    {
        id: 'alnatura-luzern',
        name: 'Alnatura Bio Super Markt',
        lat: 47.05035,
        lng: 8.30500,
        category: 'zero-waste',
        description: 'Organic supermarket with certified organic produce, vegan alternatives, and eco-friendly household products. A key stop for sustainable grocery shopping in Luzern.',
        address: 'Pilatusstrasse 4, 6003 Luzern'
    },
    {
        id: 'oakberry',
        name: 'OAKBERRY Açaí',
        lat: 47.05280,
        lng: 8.30850,
        category: 'vegan',
        description: '100% organic açaí directly sourced from the Amazon with a focus on sustainable supply chains and minimal packaging. A superfood stop for eco-conscious visitors.',
        address: 'Hertensteinstrasse 4, 6004 Luzern'
    },
    {
        id: 'bhms',
        name: 'BHMS Business & Hotel Management School',
        lat: 47.05210,
        lng: 8.29833,
        category: 'swisstainable',
        description: 'One of Switzerland\'s leading hospitality management schools, training future leaders in sustainable hotel and business management on the scenic hills above Luzern.',
        address: 'Gütschstrasse 2-6, 6003 Luzern'
    },

    // ─── SURROUNDING TOWNS & CITIES ────────────────────────────────────────────

    // ── KRIENS ──
    {
        id: 'kriens-velo',
        name: 'Veloplus Kriens',
        lat: 47.02930,
        lng: 8.27940,
        category: 'bike-rental',
        description: 'Full-service bike and e-bike shop offering sales, repair, and rentals. A hub for sustainable transport in the Kriens community.',
        address: 'Horwerstrasse 63, 6010 Kriens'
    },
    {
        id: 'kriens-biometzgerei',
        name: 'Biometzgerei Stutz',
        lat: 47.02750,
        lng: 8.28110,
        category: 'zero-waste',
        description: 'Award-winning certified organic butcher sourcing exclusively from local, free-range farms. Minimal packaging and nose-to-tail philosophy.',
        address: 'Luzernstrasse 6, 6010 Kriens'
    },
    {
        id: 'kriens-naturpark',
        name: 'Natur- & Tierpark Goldau (Access Point)',
        lat: 47.02100,
        lng: 8.27200,
        category: 'activity',
        description: 'Gateway access point to the regional nature reserve trails around Kriens and the Pilatus foothills. Ideal for low-impact hiking and wildlife observation.',
        address: 'Steinackerweg, 6010 Kriens'
    },
    {
        id: 'pilatus-bahn',
        name: 'Pilatus Bahnen (Krienseregg)',
        lat: 47.01860,
        lng: 8.26600,
        category: 'swisstainable',
        description: 'Swisstainable Level II certified mountain transport network. The cogwheel railway and cable cars run partly on renewable alpine hydro energy, reducing car traffic on the mountain.',
        address: 'Schlossweg 1, 6010 Kriens'
    },

    // ── HORW ──
    {
        id: 'horw-biobauernhof',
        name: 'Biobauernhof Mattenhof',
        lat: 47.01480,
        lng: 8.30720,
        category: 'zero-waste',
        description: 'Certified organic farm offering a weekly vegetable box subscription, seasonal produce stands, and pasture-raised eggs directly at the farm gate.',
        address: 'Mattenweidstrasse 12, 6048 Horw'
    },
    {
        id: 'horw-ev-charging',
        name: 'EV Charging – Horw Zentrum',
        lat: 47.01890,
        lng: 8.30510,
        category: 'ev-charging',
        description: 'Public fast-charging station (CCS 50 kW + Type 2 22 kW) in the Horw shopping district. Part of the cantonal EV expansion network.',
        address: 'Gemeindezentrum, Horwerstrasse 15, 6048 Horw'
    },
    {
        id: 'horw-waldlehrpfad',
        name: 'Waldlehrpfad Horw',
        lat: 47.01620,
        lng: 8.31200,
        category: 'activity',
        description: 'A 3 km forested nature trail with educational stations about local biodiversity, sustainable forestry, and the Lake Lucerne ecosystem.',
        address: 'Waldweg, 6048 Horw'
    },

    // ── EMMEN ──
    {
        id: 'emmen-secondhand',
        name: 'Brockenstube Emmen',
        lat: 47.07560,
        lng: 8.31230,
        category: 'secondhand',
        description: 'Large, well-organised charity thrift store run by volunteers. Furniture, clothing, books and household goods given a second life. All proceeds support local social projects.',
        address: 'Gerliswilstrasse 90, 6020 Emmenbrücke'
    },
    {
        id: 'emmen-coop-bio',
        name: 'Coop Naturaplan Hub – Emmen Center',
        lat: 47.07440,
        lng: 8.30360,
        category: 'zero-waste',
        description: 'Extended Naturaplan organic section with a large loose/bulk food selection, refillable cleaning products, and a zero-waste grocery corner.',
        address: 'Seetalstrasse 3, 6020 Emmenbrücke'
    },
    {
        id: 'emmen-ev-station',
        name: 'EV Charging – Emmen Parkhaus City',
        lat: 47.07620,
        lng: 8.30410,
        category: 'ev-charging',
        description: 'Multi-port public charging hub (12 × Type 2 / 2 × CCS) integrated into the Emmen City car park.',
        address: 'Gerliswilstrasse 23, 6020 Emmenbrücke'
    },

    // ── MEGGEN ──
    {
        id: 'meggen-bio-laden',
        name: 'Dämmerhüsli Bio & Deli',
        lat: 47.06270,
        lng: 8.36780,
        category: 'zero-waste',
        description: 'Artisan deli and organic grocery in scenic Meggen. Focuses on regional Swiss produce, biodynamic wines, and packaging-free options.',
        address: 'Seestrasse 27, 6045 Meggen'
    },
    {
        id: 'meggen-seebadi',
        name: 'Seebad Meggen',
        lat: 47.06080,
        lng: 8.37200,
        category: 'activity',
        description: 'Charming public lido on Lake Lucerne with solar-heated showers, a sustainable café using seasonal local food, and native wildflower meadow conservation zones.',
        address: 'Seestrasse 82, 6045 Meggen'
    },

    // ── EBIKON ──
    {
        id: 'ebikon-velostation',
        name: 'Nextbike Station – Ebikon Mall',
        lat: 47.07480,
        lng: 8.34120,
        category: 'bike-rental',
        description: 'City bike sharing station at the main Ebikon shopping centre, linking commuters between the suburbs and the Lucerne city core.',
        address: 'Luzerner Strasse 21, 6030 Ebikon'
    },
    {
        id: 'ebikon-swisstainable-hotel',
        name: 'Seedamm Plaza Ebikon',
        lat: 47.07120,
        lng: 8.34440,
        category: 'swisstainable',
        description: 'Swisstainable Level I certified conference hotel. Implements energy monitoring, food waste reduction, and sources all meat and dairy from Swiss farms.',
        address: 'Seedammstrasse 3, 6030 Ebikon'
    },

    // ── KÜSSNACHT AM RIGI ──
    {
        id: 'kussnacht-rigi',
        name: 'Rigi Bahnen (Küssnacht Access)',
        lat: 47.08350,
        lng: 8.43960,
        category: 'swisstainable',
        description: 'Swisstainable Level III leader. The Queen of the Mountains railway runs on 100% certified Swiss renewable electricity and is offset carbon-neutral for all operations.',
        address: 'Bahnhofstrasse 8, 6403 Küssnacht am Rigi'
    },
    {
        id: 'kussnacht-vegan-cafe',
        name: 'Café Bunt Küssnacht',
        lat: 47.08110,
        lng: 8.43610,
        category: 'vegan',
        description: 'Cosy vegetarian and vegan café near the lake using regional and seasonal ingredients. Daily changing lunch special, homemade cakes, and organic coffee.',
        address: 'Hauptstrasse 12, 6403 Küssnacht am Rigi'
    },
    {
        id: 'kussnacht-ev',
        name: 'EV Charging – Küssnacht Bahnhof',
        lat: 47.08140,
        lng: 8.43550,
        category: 'ev-charging',
        description: 'Two-port Type 2 (22 kW) public charging point operated by the municipal energy utility, located at the train station.',
        address: 'Bahnhofplatz, 6403 Küssnacht am Rigi'
    },

    // ── ADLIGENSWIL ──
    {
        id: 'adligenswil-biomarkt',
        name: 'Bio Hofladen Adligenswil',
        lat: 47.06320,
        lng: 8.37890,
        category: 'zero-waste',
        description: 'Farm-direct organic shop selling seasonal vegetables, fruit, eggs and dairy from the surrounding Adligenswil farms. Reusable container system in place.',
        address: 'Dorfstrasse 14, 6043 Adligenswil'
    },

    // ── MALTERS ──
    {
        id: 'malters-biobauern',
        name: 'Biobauernhof Burg',
        lat: 47.04470,
        lng: 8.18400,
        category: 'zero-waste',
        description: 'Long-established organic and biodynamic farm in the Kleine Emme valley. Offers a CSA vegetable subscription, fresh flour milled on-site, and orchard fruit.',
        address: 'Burgweg 4, 6022 Malters'
    },
    {
        id: 'malters-e-bike',
        name: 'E-Bike Trail Malters–Littau',
        lat: 47.04020,
        lng: 8.19200,
        category: 'activity',
        description: 'Scenic 12 km e-bike route connecting Malters to Lucerne via the Kleine Emme riverside — a zero-emission alternative to the car for commuters and leisure riders alike.',
        address: 'Start: Dorfplatz, 6022 Malters'
    },

    // ── ROTHENBURG ──
    {
        id: 'rothenburg-recyclinghof',
        name: 'Recyclinghof Rothenburg',
        lat: 47.10060,
        lng: 8.27940,
        category: 'zero-waste',
        description: 'Modern recycling centre with comprehensive sorting for glass, PET, metals, electronics, textiles and composting. Free drop-off for residents of Greater Lucerne.',
        address: 'Industriestrasse 10, 6023 Rothenburg'
    },

    // ── SURSEE ──
    {
        id: 'sursee-vegan-restaurant',
        name: 'Restaurant Rössli Sursee',
        lat: 47.17220,
        lng: 8.11060,
        category: 'vegan',
        description: 'Farm-to-fork restaurant in the historic old town of Sursee, offering an extensive plant-forward menu with seasonal local specials and organic wines.',
        address: 'Unterstadt 5, 6210 Sursee'
    },
    {
        id: 'sursee-bike-station',
        name: 'Nextbike Station – Sursee Bahnhof',
        lat: 47.17350,
        lng: 8.11180,
        category: 'bike-rental',
        description: 'Bike-sharing station at Sursee train station enabling sustainable onward travel to surrounding villages and the Sempachersee cycle path.',
        address: 'Bahnhofstrasse 1, 6210 Sursee'
    },
    {
        id: 'sempachersee',
        name: 'Sempachersee Naturschutzgebiet',
        lat: 47.13380,
        lng: 8.16170,
        category: 'activity',
        description: 'UNESCO-listed bird sanctuary and nature reserve around Lake Sempach. Home to over 200 bird species, with walking trails, an ecological centre, and no motorised access.',
        address: 'Naturzentrum, Irensbühlstrasse, 6204 Sempach'
    },
    {
        id: 'sursee-swisstainable',
        name: 'Hotel Krone Sursee',
        lat: 47.17150,
        lng: 8.10970,
        category: 'swisstainable',
        description: 'Historic hotel and restaurant in the Sursee old town carrying Swisstainable Level I certification, with energy-efficient heating and regional menu sourcing.',
        address: 'Hauptgasse 15, 6210 Sursee'
    },

    // ── WOLHUSEN ──
    {
        id: 'wolhusen-metzgerei',
        name: 'Metzgerei Bühler Wolhusen',
        lat: 47.05890,
        lng: 8.08140,
        category: 'zero-waste',
        description: 'Family butcher prioritising local farms within 30 km. Dry-aged beef, house-made sausages, and minimal plastic packaging — a sustainable meat alternative to supermarket chains.',
        address: 'Luzernstrasse 8, 6110 Wolhusen'
    },

    // ── RISCH / ZUG BORDER ──
    {
        id: 'risch-zugersee-badi',
        name: 'Badeanstalt Chiemen',
        lat: 47.12060,
        lng: 8.43190,
        category: 'activity',
        description: 'Pristine public lakeside swimming area on the Zugersee/Risch border. Entirely car-free access via the cantonal cycling path. Native reed beds preserved for water quality.',
        address: 'Chiemenstrasse, 6343 Rotkreuz'
    },

    // ─── DRINKING WATER FOUNTAINS (Trinkbrunnen) ─────────────────────────────
    // Luzern has 200+ public fountains. All listed here are permanent city
    // infrastructure, spring-fed from Mount Pilatus, open 24/7.
    {
        id: 'brunnen-fritschi',
        name: 'Fritschibrunnen',
        lat: 47.05280,
        lng: 8.30810,
        category: 'drinking-water',
        description: 'Luzern\'s most beloved fountain on Kapellplatz, topped by the Fritschi carnival figure. Cold spring water from the Pilatus foothills. Free, open 24/7 — one of the oldest water points in the city.',
        address: 'Kapellplatz, 6004 Luzern'
    },
    {
        id: 'brunnen-weinmarkt',
        name: 'Weinmarktbrunnen',
        lat: 47.05200,
        lng: 8.30470,
        category: 'drinking-water',
        description: 'Medieval drinking fountain at the heart of Weinmarkt, one of the most photographed squares in the old town. Cold spring water, drinkable year-round.',
        address: 'Weinmarkt, 6004 Luzern'
    },
    {
        id: 'brunnen-rathaus',
        name: 'Rathausbrunnen (Kornmarkt)',
        lat: 47.05210,
        lng: 8.30620,
        category: 'drinking-water',
        description: 'Elegant stone fountain beside the 17th-century Town Hall archway on Kornmarkt. Part of the historic network of alpine spring-fed troughs that have served the city since the 1400s.',
        address: 'Kornmarkt, 6004 Luzern'
    },
    {
        id: 'brunnen-hirschenplatz',
        name: 'Hirschenplatzbrunnen',
        lat: 47.05220,
        lng: 8.30500,
        category: 'drinking-water',
        description: 'Charming fountain on the lively Hirschenplatz square in the old town. Surrounded by painted guild houses — a perfect refill stop on any walking tour.',
        address: 'Hirschenplatz, 6004 Luzern'
    },
    {
        id: 'brunnen-loewenplatz',
        name: 'Löwenplatzbrunnen',
        lat: 47.05740,
        lng: 8.31030,
        category: 'drinking-water',
        description: 'Public drinking fountain on Löwenplatz, just steps from the famous Lion Monument. Stop here before or after visiting the Glacier Garden.',
        address: 'Löwenplatz, 6004 Luzern'
    },
    {
        id: 'brunnen-schwanenplatz',
        name: 'Schwanenplatzbrunnen',
        lat: 47.05070,
        lng: 8.30930,
        category: 'drinking-water',
        description: 'Fountain at Schwanenplatz beside the Lake Lucerne waterfront. Ideal refill point before a lakeside walk or a cruise departure.',
        address: 'Schwanenplatz, 6004 Luzern'
    },
    {
        id: 'brunnen-muehleplatz',
        name: 'Mühlenplatzbrunnen',
        lat: 47.05130,
        lng: 8.30390,
        category: 'drinking-water',
        description: 'Historic stone trough fountain on Mühlenplatz in the old town. Fed by the same alpine spring network as the other medieval troughs — water is cool, clear, and safe to drink.',
        address: 'Mühlenplatz, 6003 Luzern'
    },
    {
        id: 'brunnen-bahnhofplatz',
        name: 'Trinkwasserbrunnen Bahnhofplatz',
        lat: 47.05040,
        lng: 8.31130,
        category: 'drinking-water',
        description: 'Modern drinking water station at the main train station square. Convenient for travellers arriving or departing — part of ewl Energie Wasser Luzern\'s public fountain programme.',
        address: 'Bahnhofplatz, 6003 Luzern'
    },
    {
        id: 'brunnen-rathausquai',
        name: 'Rathausquai-Brunnen',
        lat: 47.05220,
        lng: 8.30790,
        category: 'drinking-water',
        description: 'Riverside fountain along the scenic Rathausquai promenade on the Reuss. A great stop on the waterfront walk between Kapellbrücke and Spreuerbrücke.',
        address: 'Rathausquai, 6004 Luzern'
    },
    {
        id: 'brunnen-inseli',
        name: 'Inseli Park Trinkbrunnen',
        lat: 47.04970,
        lng: 8.31480,
        category: 'drinking-water',
        description: 'Public drinking fountain in Inseli Park on the Lake Lucerne shore. Popular with joggers, cyclists, and families enjoying the lakeside green space.',
        address: 'Inseliquai, Inseli Park, 6005 Luzern'
    },
];

const CATEGORIES = {
    'vegan': { label: 'Plant-based food', color: '#4caf50', icon: 'ph-leaf' },
    'zero-waste': { label: 'Refill & groceries', color: '#00bcd4', icon: 'ph-recycle' },
    'eco-hotel': { label: 'Places to stay', color: '#ff9800', icon: 'ph-bed' },
    'activity': { label: 'Culture & outdoors', color: '#9c27b0', icon: 'ph-ticket' },
    'secondhand': { label: 'Second Hand', color: '#9333ea', icon: 'ph-t-shirt' },
    'ev-charging': { label: 'EV Charging', color: '#eab308', icon: 'ph-lightning' },
    'bike-rental': { label: 'Bike Rental', color: '#f97316', icon: 'ph-bicycle' },
    'swisstainable': { label: 'Swisstainable', color: '#14b8a6', icon: 'ph-check-circle' },
    'drinking-water': { label: 'Drinking Water', color: '#38bdf8', icon: 'ph-drop' },
};
