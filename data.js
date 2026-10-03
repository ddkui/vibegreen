// Published only after a source and placement review. See LOCATION-REVIEW.md.
const SUSTAINABLE_LOCATIONS = [
    {
        "id": "karls-kraut",
        "name": "Karls Kraut",
        "lat": 47.052494,
        "lng": 8.301499,
        "category": "vegan",
        "sdg": [
            12,
            13
        ],
        "description": "Vegan restaurant whose philosophy specifies seasonal and regional ingredients and reducing waste.",
        "address": "St. Karliquai 7, 6004 Luzern",
        "evidence": {
            "basis": "Fully plant-based menu; seasonal and regional sourcing.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.karlskraut.ch/ueber-uns"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=St.+Karliquai+7%2C+6004+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "tibits",
        "name": "Tibits Luzern",
        "lat": 47.049931,
        "lng": 8.309464,
        "category": "vegan",
        "sdg": [
            12,
            13
        ],
        "description": "Vegetarian and vegan buffet on the first floor of Luzern station.",
        "address": "Zentralstrasse 1, 6003 Luzern (Level 1 Train Station)",
        "evidence": {
            "basis": "Vegetarian restaurant with vegan dishes.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.tibits.ch/de/restaurants/standorte"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Zentralstrasse+1%2C+6003+Luzern+&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "veganitas",
        "name": "Veganitas",
        "lat": 47.049931,
        "lng": 8.309464,
        "category": "vegan",
        "description": "Plant-based pita takeaway inside Luzern station.",
        "address": "Zentralstrasse 1, 6003 Luzern (Train Station level -1)",
        "evidence": {
            "basis": "100% plant-based food.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.veganitas.com/about"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.veganitas.com/contact-us"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Zentralstrasse+1%2C+6003+Luzern+&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "bayts",
        "name": "BAYTS",
        "lat": 47.041706,
        "lng": 8.305777,
        "category": "vegan",
        "description": "Plant-based evening restaurant using seasonal and local ingredients.",
        "address": "Bireggstrasse 24, 6003 Luzern",
        "evidence": {
            "basis": "Fully plant-based, seasonal menu.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.bayts.ch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Bireggstrasse+24%2C+6003+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "prima-natura",
        "name": "Prima Natura",
        "lat": 47.05265,
        "lng": 8.306345,
        "category": "zero-waste",
        "description": "Organic-food retailer listed by Bio Partner. Refill availability is not confirmed.",
        "address": "Eisengasse 12, 6004 Luzern",
        "evidence": {
            "basis": "Organic-food shop; no packaging-free claim.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.biopartner.ch/de/shopfinder"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.prima-natura.ch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Eisengasse+12%2C+6004+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "schweizerhof",
        "name": "Hotel Schweizerhof Luzern",
        "lat": 47.054977,
        "lng": 8.309982,
        "category": "eco-hotel",
        "sdg": [
            11
        ],
        "description": "Hotel reporting ISO 14001 environmental management and Swisstainable Level III — leading.",
        "address": "Schweizerhofquai 3a, 6002 Luzern",
        "evidence": {
            "basis": "ISO 14001; Swisstainable Level III — leading.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.schweizerhof-luzern.ch/hotel-schweizerhof-luzern/nachhaltigkeit"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.schweizerhof-luzern.ch/en/contact"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Schweizerhofquai+3a%2C++Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "grand-hotel-national",
        "name": "Grand Hotel National",
        "lat": 47.054829,
        "lng": 8.314548,
        "category": "eco-hotel",
        "description": "Hotel listed at Swisstainable Level II — engaged.",
        "address": "Haldenstrasse 4, 6006 Luzern",
        "evidence": {
            "basis": "Swisstainable Level II — engaged.",
            "kind": "programme",
            "sources": [
                {
                    "label": "Programme register",
                    "url": "https://st.stnet.ch/nachhaltigkeit/pages/public/service_provider.jsf"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.grandhotel-national.com/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Haldenstrasse+4%2C+6006+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "hermitage",
        "name": "HERMITAGE Lake Lucerne",
        "lat": 47.042789,
        "lng": 8.350227,
        "category": "eco-hotel",
        "description": "Lakeside hotel reporting Swisstainable Level II and a tap-water initiative.",
        "address": "Seeburgstrasse 72, 6006 Luzern",
        "evidence": {
            "basis": "Swisstainable Level II — engaged; Wasser für Wasser.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.hermitage.ch/fr/durabilite"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.hermitage.ch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Seeburgstrasse+72%2C+6006+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "kkl-luzern",
        "name": "KKL Luzern",
        "lat": 47.050617,
        "lng": 8.311931,
        "category": "activity",
        "description": "Cultural centre reporting solar generation, food-waste monitoring and Swisstainable Level III.",
        "address": "Europaplatz 1, 6005 Luzern",
        "evidence": {
            "basis": "Swisstainable Level III — leading; published operational measures.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.kkl-luzern.ch/ueber-uns/nachhaltigkeit"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Europaplatz+1%2C+6005+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "tootsies-secondhand",
        "name": "Tootsies Second Hand",
        "lat": 47.047436,
        "lng": 8.305529,
        "category": "secondhand",
        "description": "Secondhand clothing, shoes and accessories.",
        "address": "Kauffmannweg 8, 6003 Luzern",
        "evidence": {
            "basis": "Resale keeps clothing in use.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.tootsies.ch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Kauffmannweg+8%2C+6003+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "the-secondhand",
        "name": "The Secondhand",
        "lat": 47.048988,
        "lng": 8.301167,
        "category": "secondhand",
        "description": "Secondhand fashion shop buying selected clothing for resale.",
        "address": "Bruchstrasse 45, 6003 Luzern",
        "evidence": {
            "basis": "Buys and resells pre-owned clothing.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.thesecondhand.ch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Bruchstrasse+45%2C+6003+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "swisstainable-flora",
        "name": "AMERON Luzern Hotel Flora",
        "lat": 47.050102,
        "lng": 8.30767,
        "category": "swisstainable",
        "description": "Hotel listed at Swisstainable Level III — leading.",
        "address": "Seidenhofstrasse 5, 6002 Luzern",
        "evidence": {
            "basis": "Swisstainable Level III — leading.",
            "kind": "programme",
            "sources": [
                {
                    "label": "Programme register",
                    "url": "https://st.stnet.ch/nachhaltigkeit/pages/public/service_provider.jsf"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.ameroncollection.com/de/luzern-hotel-flora"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Seidenhofstrasse+5%2C++Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "swisstainable-glacier",
        "name": "Glacier Garden Lucerne",
        "lat": 47.058868,
        "lng": 8.31017,
        "category": "swisstainable",
        "description": "Geological museum listed at Swisstainable Level I — committed.",
        "address": "Denkmalstrasse 4, 6006 Luzern",
        "evidence": {
            "basis": "Swisstainable Level I — committed; programme participation.",
            "kind": "programme",
            "sources": [
                {
                    "label": "Programme register",
                    "url": "https://st.stnet.ch/nachhaltigkeit/pages/public/service_provider.jsf"
                },
                {
                    "label": "Venue details",
                    "url": "https://gletschergarten.ch/de/besuch/besucherinfos/anreise"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Denkmalstrasse+4%2C+6006+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "swisstainable-stadtkeller",
        "name": "Stadtkeller Restaurant",
        "lat": 47.052998,
        "lng": 8.307147,
        "category": "swisstainable",
        "description": "Restaurant listed at Swisstainable Level I — committed.",
        "address": "Sternenplatz 3, 6004 Luzern",
        "evidence": {
            "basis": "Swisstainable Level I — committed; programme participation.",
            "kind": "programme",
            "sources": [
                {
                    "label": "Programme register",
                    "url": "https://st.stnet.ch/nachhaltigkeit/pages/public/service_provider.jsf"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.stadtkeller.ch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "square",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Sternenplatz%20Luzern&type=locations&sr=4326&limit=3"
    },
    {
        "id": "neubad",
        "name": "Neubad Luzern",
        "lat": 47.041458,
        "lng": 8.306971,
        "category": "activity",
        "description": "A reused swimming pool housing culture and a bistro with seasonal, predominantly plant-based meals.",
        "address": "Bireggstrasse 36, 6003 Luzern",
        "evidence": {
            "basis": "Building reuse; seasonal vegetarian and vegan meals.",
            "kind": "tourism",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.luzern.com/de/gastro/neubad-luzern"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Bireggstrasse+36%2C+6003+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "lucerne-festival",
        "name": "Lucerne Festival",
        "lat": 47.050617,
        "lng": 8.311931,
        "category": "swisstainable",
        "description": "Festival listed at Swisstainable Level II. This pin marks its KKL concert venue; check event dates.",
        "address": "Europaplatz 1, 6005 Luzern",
        "evidence": {
            "basis": "Swisstainable Level II — engaged.",
            "kind": "programme",
            "sources": [
                {
                    "label": "Programme register",
                    "url": "https://st.stnet.ch/nachhaltigkeit/pages/public/service_provider.jsf"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.lucernefestival.ch/en/en/causewecare"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Europaplatz+1%2C+6005+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "pilatus-bahn",
        "name": "Pilatus-Bahnen — Kriens valley station",
        "lat": 47.030312,
        "lng": 8.277669,
        "category": "swisstainable",
        "description": "Kriens departure station for the cableway listed at Swisstainable Level III.",
        "address": "Schlossweg 1, 6010 Kriens",
        "evidence": {
            "basis": "Swisstainable Level III — leading.",
            "kind": "programme",
            "sources": [
                {
                    "label": "Programme register",
                    "url": "https://st.stnet.ch/nachhaltigkeit/pages/public/service_provider.jsf"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.pilatus.ch/informieren/anreise-lageplan"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Schlossweg+1%2C+6010+Kriens&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "brunnen-fritschi",
        "name": "Fritschibrunnen",
        "lat": 47.0528,
        "lng": 8.3081,
        "category": "drinking-water",
        "description": "Public fountain named in the city guide. Refill a reusable bottle when running; follow on-site water notices.",
        "address": "Kapellplatz, 6004 Luzern",
        "evidence": {
            "basis": "Public bottle-refill point identified in the city guide.",
            "kind": "municipal",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.stadtluzern.ch/_docn/5020288/neu_Brunnenbroschuere_2022_2Aufl2024_WEB.pdf"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "square"
    },
    {
        "id": "brunnen-weinmarkt",
        "name": "Weinmarktbrunnen",
        "lat": 47.052,
        "lng": 8.3047,
        "category": "drinking-water",
        "description": "Public fountain named in the city guide. Refill a reusable bottle when running; follow on-site water notices.",
        "address": "Weinmarkt, 6004 Luzern",
        "evidence": {
            "basis": "Public bottle-refill point identified in the city guide.",
            "kind": "municipal",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.stadtluzern.ch/_docn/5020288/neu_Brunnenbroschuere_2022_2Aufl2024_WEB.pdf"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "square"
    },
    {
        "id": "brunnen-hirschenplatz",
        "name": "Gänsemännchenbrunnen (Hirschenplatz)",
        "lat": 47.0522,
        "lng": 8.305,
        "category": "drinking-water",
        "description": "Public fountain named in the city guide. Refill a reusable bottle when running; follow on-site water notices.",
        "address": "Hirschenplatz, 6004 Luzern",
        "evidence": {
            "basis": "Public bottle-refill point identified in the city guide.",
            "kind": "municipal",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.stadtluzern.ch/_docn/5020288/neu_Brunnenbroschuere_2022_2Aufl2024_WEB.pdf"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "coordinatePrecision": "square"
    },
    {
        "id": "waerchbrogg-alpenquai",
        "name": "Wärchbrogg Markt Alpenquai",
        "address": "Alpenquai 4, 6005 Luzern",
        "category": "zero-waste",
        "description": "Grocery shop with a refill station for shopping with your own containers.",
        "evidence": {
            "basis": "Packaging-free refill shopping.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.waerchbrogg.ch/detailhandel/verpackungsfrei-einkaufen/"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.waerchbrogg.ch/detailhandel/markt-alpenquai/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.046886,
        "lng": 8.316742,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Alpenquai+4%2C+6005+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "brocki-kriens",
        "name": "Heilsarmee brocki.ch Kriens",
        "address": "Langsägestrasse 5, 6010 Kriens",
        "category": "secondhand",
        "description": "Secondhand furniture, clothing and household goods in a reused factory hall.",
        "evidence": {
            "basis": "Reuse through resale of donated goods.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.brocki.ch/de/filialen/kriens/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.037708,
        "lng": 8.292372,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Langs%C3%A4gestrasse+5%2C+6010+Kriens&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "second-chance-emmen",
        "name": "Second Chance Emmenbrücke",
        "address": "Gerliswilstrasse 42, 6020 Emmenbrücke",
        "category": "secondhand",
        "description": "Caritas secondhand shop with an upcycling atelier.",
        "evidence": {
            "basis": "Resale, repair and upcycling.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://caritas-regio.ch/ueber-caritas/zentralschweiz/second-chance"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.073376,
        "lng": 8.278245,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Gerliswilstrasse+42%2C+6020+Emmenbr%C3%BCcke&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "second-chance-sursee",
        "name": "Second Chance im Städtli Sursee",
        "address": "Unterer Graben 1, 6210 Sursee",
        "category": "secondhand",
        "description": "Caritas secondhand clothing shop, opened in August 2026.",
        "evidence": {
            "basis": "Keeps clothing and household goods in use.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://caritas-regio.ch/ueber-caritas/zentralschweiz/news/second-chance-im-staedtli-sursee-ist-eroeffnet"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.171368,
        "lng": 8.110991,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Unterer+Graben+1%2C+6210+Sursee&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "repair-cafe-bourbaki",
        "name": "Repair Café Luzern — Bourbaki",
        "address": "Löwenplatz 11, 6004 Luzern",
        "category": "activity",
        "description": "Repair sessions at Bourbaki Bar on scheduled dates, not a daily repair shop. Check the organiser’s calendar.",
        "evidence": {
            "basis": "Repair instead of disposal.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.repair-cafe-luzern.ch/"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.bourbakipanorama.ch/museum/besuch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.056984,
        "lng": 8.310934,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=L%C3%B6wenplatz+11%2C+6004+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "vegitat-luzern",
        "name": "Vegitat Luzern",
        "address": "Bleicherstrasse 29, 6003 Luzern",
        "category": "vegan",
        "description": "Vegan takeaway serving seitan döner, wraps and bowls.",
        "evidence": {
            "basis": "Fully vegan food offer.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://vegitat.ch/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.042274,
        "lng": 8.306362,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Bleicherstrasse+29%2C+6003+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "sudpol-plant",
        "name": "Südpol Bistro — plant.",
        "address": "Arsenalstrasse 28, 6010 Kriens",
        "category": "vegan",
        "description": "Südpol’s lunch bistro operated by plant., with a vegan food concept. Check current service days.",
        "evidence": {
            "basis": "Vegan bistro menu.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.sudpol.ch/gastronomie/bistro"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.033386,
        "lng": 8.296551,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Arsenalstrasse+28%2C+6010+Kriens&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "velostation-luzern",
        "name": "Velostation Luzern — Rent a Bike",
        "address": "Frohburgstrasse 5, Luzern",
        "category": "bike-rental",
        "description": "Bike rental pickup, small repairs and secondhand bikes at the station.",
        "evidence": {
            "basis": "Cycle rental, repairs and bicycle reuse.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://caritas-regio.ch/ueber-caritas/zentralschweiz/velostationen"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.047333,
        "lng": 8.313246,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Frohburgstrasse+5%2C+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "ewl-verkehrshaus",
        "name": "ewl charging — Verkehrshaus",
        "address": "Lidostrasse 5, 6006 Luzern",
        "category": "ev-charging",
        "description": "Public EV charging listed by operator ewl. Check availability and tariffs with the operator.",
        "evidence": {
            "basis": "Public charging infrastructure; not a carbon-neutrality claim.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.ewl-luzern.ch/energie/e-mobilitaet/oeffentliche-ladestationen"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.052551,
        "lng": 8.335845,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Lidostrasse+5%2C+6006+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "ewl-industriestrasse",
        "name": "ewl charging — Haupteingang",
        "address": "Industriestrasse 6, 6005 Luzern",
        "category": "ev-charging",
        "description": "Operator-listed public EV charging at ewl’s main entrance.",
        "evidence": {
            "basis": "Public charging infrastructure.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.ewl-luzern.ch/energie/e-mobilitaet/oeffentliche-ladestationen"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.041462,
        "lng": 8.310965,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Industriestrasse+6%2C+6005+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "verkehrshaus",
        "name": "Verkehrshaus der Schweiz",
        "address": "Lidostrasse 5, 6006 Luzern",
        "category": "swisstainable",
        "description": "Museum listed at Swisstainable Level III — leading.",
        "evidence": {
            "basis": "Swisstainable Level III — leading.",
            "kind": "programme",
            "sources": [
                {
                    "label": "Programme register",
                    "url": "https://st.stnet.ch/nachhaltigkeit/pages/public/service_provider.jsf"
                },
                {
                    "label": "Venue details",
                    "url": "https://www.verkehrshaus.ch/de/anreise"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.052551,
        "lng": 8.335845,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Lidostrasse+5%2C+6006+Luzern&type=locations&origins=address&sr=4326&limit=3"
    },
    {
        "id": "preloved-popup",
        "name": "Preloved Pop-up Luzern",
        "address": "Ruopigenplatz 10, 6015 Luzern",
        "category": "secondhand",
        "description": "Secondhand clothing pop-up with scheduled sale days, not regular daily opening. Check the event page.",
        "evidence": {
            "basis": "Resale of pre-owned clothing.",
            "kind": "operator",
            "sources": [
                {
                    "label": "Evidence source",
                    "url": "https://www.preloved-popup.com/"
                }
            ],
            "reviewedAt": "2026-10-03"
        },
        "lat": 47.061035,
        "lng": 8.27404,
        "coordinatePrecision": "building-address",
        "coordinateSource": "https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=Ruopigenplatz+10%2C+6015+Luzern&type=locations&origins=address&sr=4326&limit=3"
    }
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
