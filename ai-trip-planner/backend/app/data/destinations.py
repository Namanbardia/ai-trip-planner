from typing import Dict, List, Any

SEED_DESTINATIONS: Dict[str, Dict[str, Any]] = {
    "paris": {
        "name": "Paris",
        "country": "France",
        "lat": 48.8566,
        "lng": 2.3522,
        "city_tier": 1,
        "description": "The City of Light, world-renowned for art, gastronomy, historic monuments, and romantic river walks.",
        "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        "attractions": [
            {
                "id": "par_1", "name": "Eiffel Tower", "category": "Architecture",
                "lat": 48.8584, "lng": 2.2945, "rating": 4.7, "duration_hours": 2.5,
                "description": "Iconic wrought-iron lattice tower offering sweeping views of Paris.",
                "tags": ["landmark", "viewpoint", "architecture", "photography"],
                "reviews": ["Breathtaking sunset views across the Seine", "Must-visit landmark"]
            },
            {
                "id": "par_2", "name": "Louvre Museum", "category": "Art",
                "lat": 48.8606, "lng": 2.3376, "rating": 4.8, "duration_hours": 3.0,
                "description": "World's largest art museum, home to the Mona Lisa and Venus de Milo.",
                "tags": ["art", "museum", "history", "renaissance"],
                "reviews": ["Incredible masterpieces, need several hours", "Glass pyramid is stunning"]
            },
            {
                "id": "par_3", "name": "Musée d'Orsay", "category": "Art",
                "lat": 48.8599, "lng": 2.3265, "rating": 4.8, "duration_hours": 2.5,
                "description": "Former grand railway station showcasing Impressionist masterpieces by Monet, Renoir, and Van Gogh.",
                "tags": ["art", "museum", "impressionism", "monet"],
                "reviews": ["Monet and Van Gogh galleries are unforgettable"]
            },
            {
                "id": "par_4", "name": "Sainte-Chapelle", "category": "History",
                "lat": 48.8554, "lng": 2.3450, "rating": 4.7, "duration_hours": 1.2,
                "description": "Gothic royal chapel famed for 15 towering stained glass windows with radiant light.",
                "tags": ["history", "architecture", "spirituality", "gothic"],
                "reviews": ["Stained glass when the sun shines is magical"]
            },
            {
                "id": "par_5", "name": "Sacré-Cœur & Montmartre", "category": "Viewpoint",
                "lat": 48.8867, "lng": 2.3431, "rating": 4.6, "duration_hours": 2.0,
                "description": "White-domed basilica atop Montmartre hill overlooking all of Paris, surrounded by artist plazas.",
                "tags": ["viewpoint", "spirituality", "historic", "photography"],
                "reviews": ["Panoramic views over the entire city and charming cobblestone alleys"]
            },
            {
                "id": "par_6", "name": "Luxembourg Gardens", "category": "Nature",
                "lat": 48.8462, "lng": 2.3371, "rating": 4.7, "duration_hours": 1.5,
                "description": "Lush formal palace park with tree-lined promenades, Medici fountain, and green chairs.",
                "tags": ["nature", "park", "relaxation", "peaceful"],
                "reviews": ["Tranquil oasis in the heart of the Latin Quarter"]
            },
            {
                "id": "par_7", "name": "Arc de Triomphe", "category": "History",
                "lat": 48.8738, "lng": 2.2950, "rating": 4.6, "duration_hours": 1.5,
                "description": "Monumental arch honoring French soldiers with a rooftop view along 12 grand avenues.",
                "tags": ["monument", "history", "viewpoint", "architecture"],
                "reviews": ["Rooftop view of the radiating avenues is spectacular"]
            },
            {
                "id": "par_8", "name": "Centre Pompidou", "category": "Art",
                "lat": 48.8606, "lng": 2.3522, "rating": 4.5, "duration_hours": 2.0,
                "description": "Radical high-tech modern art complex with colorful exterior pipes and escalators.",
                "tags": ["art", "modern", "contemporary", "exhibition"],
                "reviews": ["Modern art collection is vast and outdoor escalators have great views"]
            },
            {
                "id": "par_9", "name": "Le Marais Historic District", "category": "Food",
                "lat": 48.8575, "lng": 2.3622, "rating": 4.7, "duration_hours": 2.5,
                "description": "Trendy medieval neighborhood with courtyards, artisan boutiques, famous falafel, and cozy bistros.",
                "tags": ["food", "shopping", "historic", "cafes", "culture"],
                "reviews": ["Best culinary stroll and vibrant boutique alleys"]
            },
            {
                "id": "par_10", "name": "Panthéon", "category": "History",
                "lat": 48.8462, "lng": 2.3460, "rating": 4.6, "duration_hours": 1.5,
                "description": "Neoclassical temple containing the crypts of Marie Curie, Victor Hugo, and Voltaire.",
                "tags": ["history", "monument", "architecture"],
                "reviews": ["Foucault pendulum demonstration and grand crypt"]
            },
            {
                "id": "par_11", "name": "Musée Rodin", "category": "Art",
                "lat": 48.8553, "lng": 2.3158, "rating": 4.7, "duration_hours": 2.0,
                "description": "Sculptor Auguste Rodin's peaceful villa and manicured rose garden featuring The Thinker.",
                "tags": ["art", "sculpture", "nature", "garden", "peaceful"],
                "reviews": ["Walking through the quiet sculpture garden is deeply relaxing"]
            },
            {
                "id": "par_12", "name": "Canal Saint-Martin", "category": "Food",
                "lat": 48.8715, "lng": 2.3664, "rating": 4.6, "duration_hours": 2.0,
                "description": "Scenic bohemian canal with iron footbridges, waterside wine bars, bakeries, and indie cafes.",
                "tags": ["food", "culture", "relaxation", "cafes", "scenic"],
                "reviews": ["Picnicking by the water with fresh baguette and cheese"]
            },
            {
                "id": "par_13", "name": "Catacombs of Paris", "category": "History",
                "lat": 48.8338, "lng": 2.3324, "rating": 4.5, "duration_hours": 1.8,
                "description": "Underground ossuary labyrinth holding the remains of more than six million Parisians.",
                "tags": ["history", "underground", "unusual", "heritage"],
                "reviews": ["Eerie yet deeply fascinating piece of history beneath the streets"]
            },
            {
                "id": "par_14", "name": "Palais Garnier (Paris Opera)", "category": "Architecture",
                "lat": 48.8719, "lng": 2.3316, "rating": 4.8, "duration_hours": 1.5,
                "description": "Opulent 19th-century opera house with grand marble staircase and Chagall painted ceiling.",
                "tags": ["architecture", "history", "opera", "luxury"],
                "reviews": ["The grand staircase and gold chandeliers feel like a royal palace"]
            },
            {
                "id": "par_15", "name": "Jardin des Plantes", "category": "Nature",
                "lat": 48.8436, "lng": 2.3598, "rating": 4.6, "duration_hours": 2.0,
                "description": "France's historic botanical garden with giant 19th-century glasshouses, rose gardens, and alpine flora.",
                "tags": ["nature", "garden", "botanical", "peaceful", "flora"],
                "reviews": ["Greenhouses and botanical paths are serene away from crowds"]
            },
            {
                "id": "par_16", "name": "Rue Cler Market Street", "category": "Food",
                "lat": 48.8570, "lng": 2.3060, "rating": 4.6, "duration_hours": 1.5,
                "description": "Pedestrian gourmet street packed with cheese mongers, patisseries, chocolatiers, and open cafes.",
                "tags": ["food", "market", "pastries", "culinary"],
                "reviews": ["Quintessential Parisian food street near the Eiffel Tower"]
            },
            {
                "id": "par_17", "name": "Musée de l'Orangerie", "category": "Art",
                "lat": 48.8637, "lng": 2.3228, "rating": 4.7, "duration_hours": 1.5,
                "description": "Oval galleries specifically built to showcase Claude Monet's massive Water Lilies murals.",
                "tags": ["art", "monet", "painting", "serene"],
                "reviews": ["Sitting in the oval room surrounded by Monet's water lilies is hypnotic"]
            },
            {
                "id": "par_18", "name": "Parc des Buttes-Chaumont", "category": "Nature",
                "lat": 48.8809, "lng": 2.3828, "rating": 4.7, "duration_hours": 2.0,
                "description": "Dramatic public park featuring cliffs, waterfalls, suspension bridges, and a hilltop temple.",
                "tags": ["nature", "park", "viewpoint", "scenic", "relaxing"],
                "reviews": ["Paris's most creative park with rolling green hills and secret caves"]
            }
        ],
        "hotels": [
            { "id": "hot_par_1", "name": "Hôtel Le Marais Bastille", "lat": 48.8580, "lng": 2.3680, "rating": 4.6, "amenities": ["Free WiFi", "Breakfast", "Metro 2 mins", "Boutique"] },
            { "id": "hot_par_2", "name": "citizenM Paris Gare de Lyon", "lat": 48.8445, "lng": 2.3730, "rating": 4.7, "amenities": ["Rooftop Bar", "High-speed WiFi", "Smart Room Controls"] },
            { "id": "hot_par_3", "name": "Hôtel Saint-Germain Des Prés", "lat": 48.8530, "lng": 2.3330, "rating": 4.8, "amenities": ["Historic Character", "Artisan Cafes nearby", "Concierge"] },
            { "id": "hot_par_4", "name": "Pullman Paris Tour Eiffel", "lat": 48.8550, "lng": 2.2930, "rating": 4.7, "amenities": ["Tower Views", "Fitness Lounge", "Fine Dining"] }
        ]
    },
    "tokyo": {
        "name": "Tokyo",
        "country": "Japan",
        "lat": 35.6762,
        "lng": 139.6503,
        "city_tier": 1,
        "description": "Futuristic metropolis seamlessly balancing ultra-modern technology, historic shrines, and unmatched cuisine.",
        "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        "attractions": [
            { "id": "tok_1", "name": "Senso-ji Temple", "category": "Spirituality", "lat": 35.7148, "lng": 139.7967, "rating": 4.8, "duration_hours": 2.0, "description": "Tokyo's oldest Buddhist temple founded in 645 AD with Nakamise market stalls.", "tags": ["temple", "spirituality", "history", "street food"] },
            { "id": "tok_2", "name": "Meiji Jingu Shrine", "category": "Spirituality", "lat": 35.6764, "lng": 139.6993, "rating": 4.7, "duration_hours": 1.5, "description": "Serene Shinto shrine enveloped in an evergreen cedar forest beside Harajuku.", "tags": ["shrine", "nature", "peaceful", "spirituality"] },
            { "id": "tok_3", "name": "Shibuya Crossing & Sky", "category": "Viewpoint", "lat": 35.6595, "lng": 139.7004, "rating": 4.8, "duration_hours": 2.0, "description": "Iconic scramble crossing and 360-degree open-air rooftop observation deck.", "tags": ["viewpoint", "photography", "modern", "skyline"] },
            { "id": "tok_4", "name": "teamLab Planets", "category": "Art", "lat": 35.6491, "lng": 139.7898, "rating": 4.9, "duration_hours": 2.5, "description": "Immersive digital art museum where visitors walk through water and crystal mirror rooms.", "tags": ["art", "modern", "digital", "immersive"] },
            { "id": "tok_5", "name": "Tsukiji Outer Market", "category": "Food", "lat": 35.6655, "lng": 139.7708, "rating": 4.6, "duration_hours": 2.0, "description": "Vibrant wholesale food district packed with fresh sashimi, tamagoyaki, and matcha.", "tags": ["food", "street food", "market", "culinary"] },
            { "id": "tok_6", "name": "Shinjuku Gyoen National Garden", "category": "Nature", "lat": 35.6852, "lng": 139.7101, "rating": 4.7, "duration_hours": 2.0, "description": "Expansive traditional Japanese landscaped garden with tea houses and ponds.", "tags": ["nature", "park", "peaceful", "relaxation"] },
            { "id": "tok_7", "name": "Akihabara Electric Town", "category": "Culture", "lat": 35.6983, "lng": 139.7731, "rating": 4.5, "duration_hours": 2.5, "description": "Epicenter of Japanese otaku culture, retro gaming arcades, and gadget stores.", "tags": ["shopping", "culture", "gaming", "neon"] },
            { "id": "tok_8", "name": "Tokyo National Museum (Ueno)", "category": "History", "lat": 35.7189, "lng": 139.7765, "rating": 4.7, "duration_hours": 2.5, "description": "Japan's oldest museum housing samurai armor, swords, and ancient national treasures.", "tags": ["history", "museum", "samurai", "heritage"] },
            { "id": "tok_9", "name": "Omoide Yokocho (Memory Lane)", "category": "Food", "lat": 35.6934, "lng": 139.6998, "rating": 4.6, "duration_hours": 1.5, "description": "Atmospheric narrow lantern-lit alley in Shinjuku packed with tiny yakitori stalls.", "tags": ["food", "nightlife", "yakitori", "izakaya"] },
            { "id": "tok_10", "name": "Mori Art Museum (Roppongi)", "category": "Art", "lat": 35.6605, "lng": 139.7292, "rating": 4.6, "duration_hours": 2.0, "description": "Top-floor contemporary art museum with city views from the 53rd floor of Roppongi Hills.", "tags": ["art", "contemporary", "viewpoint", "skyline"] },
            { "id": "tok_11", "name": "Yanaka Old Town", "category": "History", "lat": 35.7265, "lng": 139.7680, "rating": 4.7, "duration_hours": 2.0, "description": "One of Tokyo's few surviving pre-war neighborhoods with wooden homes and quiet temples.", "tags": ["history", "nostalgic", "walking", "traditional"] },
            { "id": "tok_12", "name": "Nezu Shrine", "category": "Spirituality", "lat": 35.7202, "lng": 139.7607, "rating": 4.7, "duration_hours": 1.2, "description": "Ancient hillside shrine famed for winding tunnels of red vermillion torii gates and azaleas.", "tags": ["shrine", "torii", "peaceful", "photography"] },
            { "id": "tok_13", "name": "Odaiba Seaside Park", "category": "Viewpoint", "lat": 35.6298, "lng": 139.7744, "rating": 4.6, "duration_hours": 2.0, "description": "Futuristic waterfront district with views of the illuminated Rainbow Bridge and Tokyo Bay.", "tags": ["viewpoint", "bay", "skyline", "evening"] },
            { "id": "tok_14", "name": "Rikugien Classical Garden", "category": "Nature", "lat": 35.7327, "lng": 139.7460, "rating": 4.7, "duration_hours": 1.5, "description": "Stroll garden created in 1702 recreating 88 scenes from famous classical Japanese poems.", "tags": ["nature", "garden", "traditional", "serene"] }
        ],
        "hotels": [
            { "id": "hot_tok_1", "name": "Hotel Gracery Shinjuku", "lat": 35.6953, "lng": 139.7020, "rating": 4.6, "amenities": ["Godzilla Terrace", "5 mins to Shinjuku Stn", "English Staff"] },
            { "id": "hot_tok_2", "name": "The Gate Hotel Asakusa Kaminarimon", "lat": 35.7118, "lng": 139.7960, "rating": 4.7, "amenities": ["Skytree View Lounge", "Beside Senso-ji", "Top Breakfast"] },
            { "id": "hot_tok_3", "name": "Shibuya Stream Excel Hotel Tokyu", "lat": 35.6575, "lng": 139.7028, "rating": 4.8, "amenities": ["Direct Shibuya Stn Access", "Designer Decor", "Modern gym"] }
        ]
    },
    "london": {
        "name": "London",
        "country": "United Kingdom",
        "lat": 51.5074,
        "lng": -0.1278,
        "city_tier": 1,
        "description": "Dynamic royal capital steeped in Roman history, world-class free museums, and historic river vistas.",
        "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
        "attractions": [
            { "id": "lon_1", "name": "British Museum", "category": "History", "lat": 51.5194, "lng": -0.1270, "rating": 4.8, "duration_hours": 3.0, "description": "Vast world museum housing the Rosetta Stone, Parthenon sculptures, and Egyptian mummies.", "tags": ["history", "museum", "antiquities", "culture"] },
            { "id": "lon_2", "name": "Tower of London & Crown Jewels", "category": "History", "lat": 51.5081, "lng": -0.0759, "rating": 4.7, "duration_hours": 2.5, "description": "Nearly 1,000-year-old medieval royal fortress and prison safeguarding the Crown Jewels.", "tags": ["castle", "history", "medieval", "fortress"] },
            { "id": "lon_3", "name": "Tate Modern", "category": "Art", "lat": 51.5076, "lng": -0.0994, "rating": 4.7, "duration_hours": 2.5, "description": "Turbine Hall and international modern art galleries in a former Bankside power station.", "tags": ["art", "modern", "contemporary", "gallery"] },
            { "id": "lon_4", "name": "Borough Market", "category": "Food", "lat": 51.5055, "lng": -0.0910, "rating": 4.7, "duration_hours": 2.0, "description": "London's oldest food market with artisanal cheeses, hot salt beef sandwiches, and oysters.", "tags": ["food", "market", "street food", "culinary"] },
            { "id": "lon_5", "name": "Westminster Abbey", "category": "Spirituality", "lat": 51.4994, "lng": -0.1274, "rating": 4.7, "duration_hours": 2.0, "description": "Gothic coronation church of British monarchs since 1066 and resting place of kings.", "tags": ["history", "gothic", "spirituality", "architecture"] },
            { "id": "lon_6", "name": "Sky Garden", "category": "Viewpoint", "lat": 51.5111, "lng": -0.0837, "rating": 4.7, "duration_hours": 1.5, "description": "Three-story glass dome atop 20 Fenchurch Street offering 360-degree landscaped views.", "tags": ["viewpoint", "skyline", "panorama", "photography"] },
            { "id": "lon_7", "name": "Hyde Park & Kensington Gardens", "category": "Nature", "lat": 51.5073, "lng": -0.1657, "rating": 4.7, "duration_hours": 2.0, "description": "350-acre royal green space with the Serpentine boating lake and flower promenades.", "tags": ["nature", "park", "relaxation", "peaceful"] },
            { "id": "lon_8", "name": "Covent Garden Plaza", "category": "Culture", "lat": 51.5117, "lng": -0.1240, "rating": 4.6, "duration_hours": 2.0, "description": "19th-century market building filled with buskers, boutique bakeries, craft stalls, and tea rooms.", "tags": ["culture", "shopping", "food", "entertainment"] },
            { "id": "lon_9", "name": "St Paul's Cathedral", "category": "Architecture", "lat": 51.5138, "lng": -0.0984, "rating": 4.7, "duration_hours": 2.0, "description": "Sir Christopher Wren's baroque dome dominating London's skyline with whispering gallery.", "tags": ["architecture", "baroque", "history", "viewpoint"] },
            { "id": "lon_10", "name": "Camden Lock Market", "category": "Food", "lat": 51.5414, "lng": -0.1466, "rating": 4.5, "duration_hours": 2.5, "description": "Eclectic canal-side markets renowned for international street food, vintage clothes, and music.", "tags": ["food", "market", "alternative", "nightlife"] }
        ],
        "hotels": [
            { "id": "hot_lon_1", "name": "The Hoxton Holborn", "lat": 51.5170, "lng": -0.1210, "rating": 4.7, "amenities": ["Boutique Design", "Covent Garden Walk", "Great Coffee"] },
            { "id": "hot_lon_2", "name": "citizenM Tower of London", "lat": 51.5100, "lng": -0.0760, "rating": 4.6, "amenities": ["Direct Tube Access", "Tower Views", "Smart Rooms"] },
            { "id": "hot_lon_3", "name": "The Resident Victoria", "lat": 51.4975, "lng": -0.1440, "rating": 4.8, "amenities": ["Near Buckingham Palace", "Quiet Street", "Kitchenettes"] }
        ]
    },
    "rome": {
        "name": "Rome",
        "country": "Italy",
        "lat": 41.9028,
        "lng": 12.4964,
        "city_tier": 2,
        "description": "The Eternal City, where millennia of history, classical ruins, and vibrant piazza culture come alive.",
        "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
        "attractions": [
            { "id": "rom_1", "name": "Colosseum & Roman Forum", "category": "History", "lat": 41.8902, "lng": 12.4922, "rating": 4.8, "duration_hours": 3.0, "description": "Gladiator arena built in 80 AD and political heart of ancient Rome.", "tags": ["history", "ancient", "monument", "ruins"] },
            { "id": "rom_2", "name": "Vatican Museums & Sistine Chapel", "category": "Art", "lat": 41.9065, "lng": 12.4536, "rating": 4.9, "duration_hours": 3.5, "description": "Michelangelo's Sistine Chapel ceiling frescoes and classical sculptures.", "tags": ["art", "museum", "history", "spirituality"] },
            { "id": "rom_3", "name": "Pantheon", "category": "Architecture", "lat": 41.8986, "lng": 12.4769, "rating": 4.8, "duration_hours": 1.0, "description": "Best-preserved Roman temple with open central dome oculus.", "tags": ["architecture", "history", "ancient"] },
            { "id": "rom_4", "name": "Trevi Fountain", "category": "Viewpoint", "lat": 41.9009, "lng": 12.4833, "rating": 4.7, "duration_hours": 1.0, "description": "Baroque marble fountain masterpiece in the historic heart of Rome.", "tags": ["monument", "baroque", "photography"] },
            { "id": "rom_5", "name": "Borghese Gallery & Gardens", "category": "Art", "lat": 41.9142, "lng": 12.4921, "rating": 4.8, "duration_hours": 2.0, "description": "Bernini's marble sculptures and Caravaggio paintings in a peaceful park.", "tags": ["art", "sculpture", "nature", "park"] },
            { "id": "rom_6", "name": "Trastevere Historic Quarter", "category": "Food", "lat": 41.8890, "lng": 12.4700, "rating": 4.7, "duration_hours": 2.5, "description": "Bohemian district of ivy-clad ochre lanes and authentic Roman trattorias.", "tags": ["food", "dining", "culture", "pasta"] },
            { "id": "rom_7", "name": "Piazza Navona", "category": "Architecture", "lat": 41.8992, "lng": 12.4731, "rating": 4.7, "duration_hours": 1.2, "description": "Baroque plaza with Bernini's Fountain of the Four Rivers and street artists.", "tags": ["architecture", "fountains", "piazza"] },
            { "id": "rom_8", "name": "Castel Sant'Angelo", "category": "History", "lat": 41.9031, "lng": 12.4663, "rating": 4.6, "duration_hours": 2.0, "description": "Hadrian's mausoleum turned papal fortress overlooking the Tiber River.", "tags": ["castle", "history", "viewpoint"] },
            { "id": "rom_9", "name": "Campo de' Fiori Market", "category": "Food", "lat": 41.8956, "lng": 12.4722, "rating": 4.5, "duration_hours": 1.5, "description": "Lively open-air morning market with fresh fruits, spices, and bakeries.", "tags": ["food", "market", "culture"] },
            { "id": "rom_10", "name": "Aventine Hill & Keyhole View", "category": "Viewpoint", "lat": 41.8845, "lng": 12.4795, "rating": 4.7, "duration_hours": 1.5, "description": "Quiet hilltop with orange gardens and secret keyhole view of St Peter's dome.", "tags": ["viewpoint", "peaceful", "sunset", "hidden"] },
            { "id": "rom_11", "name": "Testaccio Market & Classic Trattorias", "category": "Food", "lat": 41.8760, "lng": 12.4755, "rating": 4.8, "duration_hours": 2.0, "description": "The true culinary heart of Rome, famed for Trapizzino street sandwiches, artisan cheese stalls, and authentic cacio e pepe trattorias.", "tags": ["food", "market", "street food", "pasta", "dining"] },
            { "id": "rom_12", "name": "Jewish Ghetto & Roman Carciofi Trail", "category": "Food", "lat": 41.8925, "lng": 12.4780, "rating": 4.7, "duration_hours": 1.5, "description": "Historic quarter famous for ancient Roman-Jewish gastronomy, golden fried artichokes (carciofi alla giudia), and ricotta cherry cakes.", "tags": ["food", "history", "jewish", "dining", "bakery"] }
        ],
        "hotels": [
            { "id": "hot_rom_1", "name": "Hotel Artemide", "lat": 41.9005, "lng": 12.4940, "rating": 4.8, "amenities": ["Rooftop Restaurant", "Spa", "Central Repubblica"] },
            { "id": "hot_rom_2", "name": "Trastevere Urban House", "lat": 41.8885, "lng": 12.4715, "rating": 4.5, "amenities": ["Cozy Boutique", "Authentic Neighborhood"] }
        ]
    },
    "barcelona": {
        "name": "Barcelona",
        "country": "Spain",
        "lat": 41.3874,
        "lng": 2.1686,
        "city_tier": 2,
        "description": "Catalan coastal capital of modernist Antoni Gaudí architecture, Mediterranean beaches, and tapas culture.",
        "image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
        "attractions": [
            { "id": "bcn_1", "name": "Sagrada Família", "category": "Architecture", "lat": 41.4036, "lng": 2.1744, "rating": 4.9, "duration_hours": 2.5, "description": "Gaudí's master basílica with organic stone columns and stained-glass lighting.", "tags": ["architecture", "gaudi", "monument"] },
            { "id": "bcn_2", "name": "Park Güell", "category": "Nature", "lat": 41.4145, "lng": 2.1527, "rating": 4.6, "duration_hours": 2.0, "description": "Park featuring mosaic salamanders, viaducts, and sea terrace views.", "tags": ["nature", "gaudi", "viewpoint", "mosaic"] },
            { "id": "bcn_3", "name": "Casa Batlló", "category": "Architecture", "lat": 41.3917, "lng": 2.1649, "rating": 4.8, "duration_hours": 1.5, "description": "Marine-inspired modernist mansion resembling dragon scales and bone balconies.", "tags": ["architecture", "gaudi", "art", "design"] },
            { "id": "bcn_4", "name": "Gothic Quarter & Cathedral", "category": "History", "lat": 41.3839, "lng": 2.1762, "rating": 4.7, "duration_hours": 2.5, "description": "Atmospheric labyrinth of narrow medieval alleys and hidden tapas plazas.", "tags": ["history", "medieval", "architecture", "tapas"] },
            { "id": "bcn_5", "name": "La Boqueria Food Market", "category": "Food", "lat": 41.3817, "lng": 2.1716, "rating": 4.6, "duration_hours": 1.5, "description": "Historic market bursting with fresh juices, seafood, and jamón tapas counters.", "tags": ["food", "market", "tapas", "seafood"] },
            { "id": "bcn_6", "name": "Montjuïc Castle & Cable Car", "category": "Viewpoint", "lat": 41.3630, "lng": 2.1658, "rating": 4.6, "duration_hours": 2.5, "description": "Hilltop fortress with sweeping views of the harbor and Olympic park.", "tags": ["viewpoint", "castle", "harbor"] },
            { "id": "bcn_7", "name": "Picasso Museum (El Born)", "category": "Art", "lat": 41.3853, "lng": 2.1809, "rating": 4.6, "duration_hours": 2.0, "description": "Houses one of the most extensive collections of artworks by Pablo Picasso.", "tags": ["art", "museum", "picasso", "culture"] },
            { "id": "bcn_8", "name": "Barceloneta Beach Promenade", "category": "Nature", "lat": 41.3784, "lng": 2.1894, "rating": 4.5, "duration_hours": 2.0, "description": "Sunny Mediterranean boardwalk with seafood paella restaurants and sea breeze.", "tags": ["beach", "sea", "relaxation", "paella"] },
            { "id": "bcn_9", "name": "Carrer de Blai (Pintxos & Tapas Street)", "category": "Food", "lat": 41.3735, "lng": 2.1645, "rating": 4.7, "duration_hours": 2.0, "description": "Barcelona's pedestrian tapas boulevard lined with Basque pintxos bars, vermouth bodegas, and craft beers.", "tags": ["food", "tapas", "pintxos", "street food", "nightlife"] },
            { "id": "bcn_10", "name": "Mercat de Santa Caterina & El Born Tapas", "category": "Food", "lat": 41.3860, "lng": 2.1790, "rating": 4.8, "duration_hours": 2.0, "description": "Colorful wavy-roofed neighborhood market surrounded by artisan bakeries, olive oil bars, and traditional Catalan bistros.", "tags": ["food", "market", "catalan", "bistro", "tapas"] }
        ],
        "hotels": [
            { "id": "hot_bcn_1", "name": "Hotel Jazz Barcelona", "lat": 41.3860, "lng": 2.1660, "rating": 4.6, "amenities": ["Rooftop Pool", "Plaza Catalunya 2 mins", "Modern Rooms"] },
            { "id": "hot_bcn_2", "name": "H10 Cubik", "lat": 41.3882, "lng": 2.1725, "rating": 4.8, "amenities": ["Near Gothic Quarter", "Sky Bar", "Luxury Design"] }
        ]
    },
    "jaipur": {
        "name": "Jaipur",
        "country": "India",
        "lat": 26.9124,
        "lng": 75.7873,
        "city_tier": 3,
        "description": "The regal Pink City of Rajasthan, acclaimed for hilltop forts, royal palaces, and vibrant bazaars.",
        "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        "attractions": [
            { "id": "jai_1", "name": "Amber Palace & Fort", "category": "History", "lat": 26.9855, "lng": 75.8513, "rating": 4.8, "duration_hours": 3.0, "description": "Massive 16th-century fortress of sandstone overlooking Maota Lake, famous for Sheesh Mahal.", "tags": ["fort", "history", "heritage", "palace"] },
            { "id": "jai_2", "name": "Hawa Mahal (Palace of Winds)", "category": "Architecture", "lat": 26.9239, "lng": 75.8267, "rating": 4.6, "duration_hours": 1.5, "description": "Pink honeycomb facade featuring 953 intricate jharokha latticework windows.", "tags": ["monument", "architecture", "history"] },
            { "id": "jai_3", "name": "City Palace Jaipur", "category": "History", "lat": 26.9258, "lng": 75.8236, "rating": 4.6, "duration_hours": 2.0, "description": "Grand palace complex fusing Mughal and Rajput architecture.", "tags": ["palace", "history", "museum", "culture"] },
            { "id": "jai_4", "name": "Jantar Mantar Observatory", "category": "History", "lat": 26.9248, "lng": 75.8246, "rating": 4.6, "duration_hours": 1.5, "description": "UNESCO World Heritage astronomical observatory with the world's largest stone sundial.", "tags": ["history", "science", "unesco"] },
            { "id": "jai_5", "name": "Nahargarh Fort Sunset Viewpoint", "category": "Viewpoint", "lat": 26.9372, "lng": 75.8155, "rating": 4.7, "duration_hours": 2.0, "description": "Hilltop fortress offering sweeping sunset vistas across the entire Pink City skyline.", "tags": ["viewpoint", "sunset", "fort", "scenic"] },
            { "id": "jai_6", "name": "Johari & Bapu Bazaars", "category": "Food", "lat": 26.9200, "lng": 75.8230, "rating": 4.5, "duration_hours": 2.0, "description": "Lively old city markets famed for bandhani textiles, kachoris, and authentic lassi.", "tags": ["shopping", "food", "market", "culture"] },
            { "id": "jai_7", "name": "Albert Hall Central Museum", "category": "Art", "lat": 26.9116, "lng": 75.8193, "rating": 4.6, "duration_hours": 1.8, "description": "Indo-Saracenic museum housing royal miniatures, carpets, and metal art.", "tags": ["art", "museum", "architecture"] },
            { "id": "jai_8", "name": "Jal Mahal (Water Palace)", "category": "Viewpoint", "lat": 26.9535, "lng": 75.8462, "rating": 4.5, "duration_hours": 1.0, "description": "Submerged red sandstone palace floating serenely in the middle of Man Sagar Lake.", "tags": ["palace", "water", "scenic", "photography"] },
            { "id": "jai_9", "name": "Masala Chowk Open-Air Food Court", "category": "Food", "lat": 26.9105, "lng": 75.8205, "rating": 4.7, "duration_hours": 1.5, "description": "Open-air heritage food courtyard gathering Jaipur's 21 most famous street food stalls (golgappas, samosas, chole bhature, falooda).", "tags": ["food", "street food", "chaat", "dining", "pink city"] },
            { "id": "jai_10", "name": "Rawat Mishthan Bhandar & LMB Food Walk", "category": "Food", "lat": 26.9225, "lng": 75.8010, "rating": 4.8, "duration_hours": 1.5, "description": "Legendary sweet and savory houses world-famed for spicy pyaaz ki kachori, mawa kachori, and authentic Rajasthani thali.", "tags": ["food", "kachori", "sweets", "rajasthani", "heritage"] }
        ],
        "hotels": [
            { "id": "hot_jai_1", "name": "Alsisar Haveli - Heritage Hotel", "lat": 26.9220, "lng": 75.7990, "rating": 4.7, "amenities": ["Traditional Courtyard", "Outdoor Pool", "Fresco Art"] },
            { "id": "hot_jai_2", "name": "Shahpura House", "lat": 26.9280, "lng": 75.7920, "rating": 4.8, "amenities": ["Royal Rajput Decor", "Rooftop Restaurant", "Spa"] }
        ]
    },
    "delhi": {
        "name": "Delhi",
        "country": "India",
        "lat": 28.6139,
        "lng": 77.2090,
        "city_tier": 2,
        "description": "India's historic capital blending ancient Mughal forts, majestic colonial avenues, sacred spiritual temples, and legendary culinary bazaars.",
        "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
        "attractions": [
            {
                "id": "del_1", "name": "Lotus Temple (Bahá'í House of Worship)", "category": "Spirituality",
                "lat": 28.5535, "lng": 77.2588, "rating": 4.8, "duration_hours": 1.5,
                "description": "Architectural marvel shaped like a blooming white marble lotus flower, welcoming people of all faiths for silent meditation in tranquil ponds.",
                "tags": ["spirituality", "architecture", "peaceful", "meditation", "iconic", "temple"],
                "reviews": ["Breathtaking 27 pure white marble petals", "Deeply peaceful sanctuary with manicured gardens"]
            },
            {
                "id": "del_2", "name": "Red Fort (Lal Qila)", "category": "History",
                "lat": 28.6562, "lng": 77.2410, "rating": 4.7, "duration_hours": 2.5,
                "description": "Massive 17th-century Mughal imperial fortress of red sandstone, featuring royal audience halls (Diwan-i-Khas) and historic battlements.",
                "tags": ["fort", "history", "unesco", "mughal", "monument", "heritage"],
                "reviews": ["Grandeur of the Mughal empire is palpable", "Lahori Gate and evening light show are spectacular"]
            },
            {
                "id": "del_3", "name": "Qutub Minar Complex", "category": "History",
                "lat": 28.5244, "lng": 77.1855, "rating": 4.8, "duration_hours": 2.0,
                "description": "World's tallest brick minaret (72.5m) soaring over ancient Mehrauli ruins and the rust-resistant 1,600-year-old Iron Pillar of Delhi.",
                "tags": ["history", "unesco", "ancient", "architecture", "monument"],
                "reviews": ["Intricate Quranic stone carvings and magnificent Iron Pillar", "Stunning at golden hour"]
            },
            {
                "id": "del_4", "name": "India Gate & Kartavya Path", "category": "Architecture",
                "lat": 28.6129, "lng": 77.2295, "rating": 4.7, "duration_hours": 1.5,
                "description": "Triumphal arch war memorial standing at the heart of Delhi, flanked by sweeping ceremonial lawns and the National War Memorial.",
                "tags": ["landmark", "monument", "history", "photography", "evening"],
                "reviews": ["Magical under night illumination with ice cream on the lawns", "Heart of the nation"]
            },
            {
                "id": "del_5", "name": "Humayun's Tomb", "category": "History",
                "lat": 28.5933, "lng": 77.2507, "rating": 4.8, "duration_hours": 2.0,
                "description": "Magnificent red sandstone and Persian garden tomb of Emperor Humayun, the architectural inspiration for the Taj Mahal.",
                "tags": ["history", "unesco", "mughal", "gardens", "architecture"],
                "reviews": ["Symmetrical charbagh gardens and dome are pure poetry", "Less crowded than Red Fort and stunningly restored"]
            },
            {
                "id": "del_6", "name": "Swaminarayan Akshardham", "category": "Spirituality",
                "lat": 28.6127, "lng": 77.2773, "rating": 4.9, "duration_hours": 3.0,
                "description": "Colossal traditional Hindu temple complex carved entirely from Rajasthani pink sandstone and Italian Carrara marble, featuring musical water fountains.",
                "tags": ["spirituality", "temple", "art", "sculpture", "culture"],
                "reviews": ["Most visually overwhelming stone craftsmanship on earth", "Sahaj Anand water fountain show is world-class"]
            },
            {
                "id": "del_7", "name": "Jama Masjid", "category": "Spirituality",
                "lat": 28.6507, "lng": 77.2334, "rating": 4.7, "duration_hours": 1.5,
                "description": "One of India's largest mosques built by Shah Jahan in 1656, offering panoramic views of Old Delhi from its southern minaret.",
                "tags": ["spirituality", "history", "mosque", "viewpoint", "mughal"],
                "reviews": ["Vast red sandstone courtyard holding 25,000 worshippers", "Climbing the minaret gives the best Old Delhi vista"]
            },
            {
                "id": "del_8", "name": "Chandni Chowk & Khari Baoli", "category": "Food",
                "lat": 28.6560, "lng": 77.2280, "rating": 4.6, "duration_hours": 2.5,
                "description": "Bustling 17th-century bazaar famous for Asia's largest spice market, jalebis, Paranthe Wali Gali, and authentic kebabs.",
                "tags": ["food", "market", "street food", "culture", "spices"],
                "reviews": ["Sensory overload of spices, tea, and street parathas", "Rickshaw ride through the narrow lanes is unforgettable"]
            },
            {
                "id": "del_9", "name": "Gurudwara Bangla Sahib", "category": "Spirituality",
                "lat": 28.6263, "lng": 77.2090, "rating": 4.9, "duration_hours": 1.5,
                "description": "Prominent Sikh house of worship with golden domes, serene sacred pool (sarovar), and the heartwarming 24/7 community langar kitchen.",
                "tags": ["spirituality", "sikh", "peaceful", "culture", "community"],
                "reviews": ["Peaceful soul-cleansing atmosphere", "Witnessing the free community kitchen feeding thousands daily is humbling"]
            },
            {
                "id": "del_10", "name": "Lodhi Gardens & Historic Tombs", "category": "Nature",
                "lat": 28.5931, "lng": 77.2197, "rating": 4.8, "duration_hours": 2.0,
                "description": "Historic 90-acre landscaped park sheltering 15th-century Sayyid and Lodi tombs, lush green lawns, and peaceful walking trails.",
                "tags": ["nature", "park", "peaceful", "heritage", "greenery"],
                "reviews": ["Delhi's most charming morning walk among ancient tombs", "Peaceful oasis in the heart of the city"]
            },
            {
                "id": "del_11", "name": "Hauz Khas Village & Fort Ruins", "category": "History",
                "lat": 28.5529, "lng": 77.1945, "rating": 4.6, "duration_hours": 2.0,
                "description": "Medieval reservoir complex and madrasa ruins seamlessly merging with lakeside views, stone pavilions, and charming rooftop cafes.",
                "tags": ["history", "fort", "ruins", "cafes", "lake", "viewpoint"],
                "reviews": ["Sunset over Hauz Khas lake from the stone arches", "Fascinating blend of medieval fort and lakeside dining"]
            },
            {
                "id": "del_12", "name": "Agrasen Ki Baoli", "category": "History",
                "lat": 28.6258, "lng": 77.2250, "rating": 4.6, "duration_hours": 1.0,
                "description": "Ancient 14th-century historical stepwell with 108 stone steps descending deep beneath the bustling streets of Connaught Place.",
                "tags": ["history", "ancient", "architecture", "photography", "hidden"],
                "reviews": ["Hidden gem right in central Delhi", "Geometric stone arches make dramatic photography"]
            },
            {
                "id": "del_13", "name": "National Museum, Janpath", "category": "Art",
                "lat": 28.6118, "lng": 77.2193, "rating": 4.7, "duration_hours": 2.5,
                "description": "India's premier museum holding the Dancing Girl of Mohenjo-daro, Buddhist relics, Tanjore paintings, and ancient Chola bronzes.",
                "tags": ["art", "museum", "history", "antiquities", "culture"],
                "reviews": ["Harappan Indus Valley civilization artifacts are priceless", "Exceptional Buddhist gallery"]
            },
            {
                "id": "del_14", "name": "National Gallery of Modern Art (NGMA)", "category": "Art",
                "lat": 28.6102, "lng": 77.2340, "rating": 4.7, "duration_hours": 2.0,
                "description": "Former palace of the Maharaja of Jaipur housing India's foremost collection of contemporary art, Amrita Sher-Gil, and Rabindranath Tagore.",
                "tags": ["art", "modern", "contemporary", "paintings", "exhibition"],
                "reviews": ["Quiet paradise for fine art lovers near India Gate"]
            },
            {
                "id": "del_15", "name": "Dilli Haat INA", "category": "Food",
                "lat": 28.5735, "lng": 77.2078, "rating": 4.6, "duration_hours": 2.0,
                "description": "Open-air rural craft bazaar and authentic food village showcasing regional folk handicrafts and authentic food stalls from all 28 states of India.",
                "tags": ["food", "shopping", "crafts", "culture", "street food"],
                "reviews": ["Best momos, litti chokha, and Kashmiri kahwa in one place", "Genuine artisan stalls"]
            },
            {
                "id": "del_16", "name": "Sunder Nursery Heritage Park", "category": "Nature",
                "lat": 28.5950, "lng": 77.2435, "rating": 4.9, "duration_hours": 2.0,
                "description": "Delhi's 'Central Park'—a 90-acre UNESCO-restored garden boasting 16th-century Mughal monuments, micro-habitats, and weekend organic farmers markets.",
                "tags": ["nature", "park", "heritage", "peaceful", "flora", "relaxation"],
                "reviews": ["Most beautifully landscaped park in India", "Ponds, birds, and Mughal pavilions are serene"]
            },
            {
                "id": "del_17", "name": "Paranthe Wali Gali", "category": "Food",
                "lat": 28.6558, "lng": 77.2301, "rating": 4.7, "duration_hours": 1.5,
                "description": "Legendary 1870s culinary lane in Chandni Chowk serving hot, deep-fried stuffed flatbreads (paneer, rabri, cashew, mint) paired with sweet lassi and tamarind chutneys.",
                "tags": ["food", "street food", "heritage", "breakfast", "chandni chowk", "desserts"],
                "reviews": ["Iconic 150-year-old culinary institution", "Khoya and rabri paranthas are sinful delicacies"]
            },
            {
                "id": "del_18", "name": "Karim's & Matia Mahal Food Trail", "category": "Food",
                "lat": 28.6502, "lng": 77.2341, "rating": 4.8, "duration_hours": 2.0,
                "description": "Historic 1913 culinary institution opposite Jama Masjid, famed for royal Mughal gastronomy, mutton nihari, seekh kebabs, korma, and hot khameeri rotis.",
                "tags": ["food", "mughal", "kebabs", "street food", "dinner", "old delhi"],
                "reviews": ["Best mutton burra and butter chicken on earth", "Matia Mahal alleyway aroma of roasting kebabs is unforgettable"]
            },
            {
                "id": "del_19", "name": "Majnu Ka Tilla (Little Tibet)", "category": "Food",
                "lat": 28.7025, "lng": 77.2275, "rating": 4.7, "duration_hours": 2.0,
                "description": "Vibrant riverside Tibetan enclave packed with authentic Himalayan eateries, spicy laphing street carts, steamed devil momos, thukpa, and artisan Korean cafes.",
                "tags": ["food", "tibetan", "momos", "cafes", "street food", "culture"],
                "reviews": ["Authentic spicy laphing and buff momos in cozy alleyways", "Feels like stepping straight into Dharamshala"]
            },
            {
                "id": "del_20", "name": "Pandara Road Food Enclave", "category": "Food",
                "lat": 28.6080, "lng": 77.2360, "rating": 4.8, "duration_hours": 1.5,
                "description": "Delhi's most celebrated late-night culinary enclave near India Gate, famed for world-class butter chicken, slow-cooked dal makhani, and Gulati sizzling kebabs.",
                "tags": ["food", "curry", "dining", "delicacy", "evening", "north indian"],
                "reviews": ["Unrivaled butter chicken and garlic naan at Gulati", "The gold standard of Delhi North Indian cuisine"]
            },
            {
                "id": "del_21", "name": "Connaught Place Heritage Cafes & Bakeries", "category": "Food",
                "lat": 28.6328, "lng": 77.2197, "rating": 4.7, "duration_hours": 2.0,
                "description": "Centuries of culinary heritage in the colonial Georgian arcades, featuring Wenger's Bakery (1926) for chocolate eclairs, Indian Coffee House, and Keventers milkshakes.",
                "tags": ["food", "cafes", "bakery", "pastries", "heritage", "central delhi"],
                "reviews": ["Wenger's patties and pastries are timeless", "Sipping coffee on the Indian Coffee House rooftop terrace is nostalgic"]
            },
            {
                "id": "del_22", "name": "Khan Market Gourmet & Cafe Trail", "category": "Food",
                "lat": 28.6000, "lng": 77.2270, "rating": 4.8, "duration_hours": 2.0,
                "description": "Upscale cosmopolitan foodie hub featuring Khan Chacha's legendary mutton kathi rolls, artisan Italian espresso bars, European bakeries, and gourmet bistros.",
                "tags": ["food", "cafes", "bistro", "kathi rolls", "desserts", "lifestyle"],
                "reviews": ["Best mutton tikka rolls at Khan Chacha", "Vibrant European-style cafe culture and artisan gelato"]
            }
        ],
        "hotels": [
            { "id": "hot_del_1", "name": "The Imperial New Delhi", "lat": 28.6230, "lng": 77.2180, "rating": 4.8, "amenities": ["Historic Art Deco Luxury", "Heritage Gardens", "Central Janpath"] },
            { "id": "hot_del_2", "name": "The Leela Palace Chanakyapuri", "lat": 28.5790, "lng": 77.1890, "rating": 4.9, "amenities": ["Rooftop Infinity Pool", "Diplomatic Enclave", "Fine Dining"] },
            { "id": "hot_del_3", "name": "Haveli Dharampura (Old Delhi Heritage)", "lat": 28.6530, "lng": 77.2310, "rating": 4.7, "amenities": ["Mughal Courtyard", "Near Jama Masjid", "Classical Kathak Shows"] },
            { "id": "hot_del_4", "name": "Taj Mahal Hotel (Number One Mansingh)", "lat": 28.6050, "lng": 77.2250, "rating": 4.8, "amenities": ["Lutyens' Delhi", "Near India Gate", "Spa & Luxury Concierge"] }
        ]
    }
}
SEED_DESTINATIONS["new delhi"] = SEED_DESTINATIONS["delhi"]

