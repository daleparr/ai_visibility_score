-- Final 10 Industry Sectors - Production Ready
-- Run this in Neon SQL Editor

INSERT INTO industry_sectors (slug, name, description, target_audience, active, metadata) VALUES

('igaming', 'iGaming & Online Entertainment', 
 'Online casinos, sports betting, poker platforms, gaming sites, and entertainment betting services.',
 'Casino Operators, Affiliate Managers, Platform Directors',
 true,
 '{"categoryTerms": ["online casinos", "sports betting sites", "poker platforms", "fantasy sports"], "keyPlayers": ["bet365", "DraftKings", "FanDuel", "PokerStars", "888Casino", "William Hill"], "whyValuable": "High customer value, strong brand switching, affiliate-driven, premium pricing opportunity", "promptCount": 22, "expectedBrands": 40}'),

('fashion', 'Fashion & Apparel', 
 'Sustainable fashion, luxury brands, affordable clothing, athletic wear. Track how AI recommends fashion brands across style categories.',
 'Brand Managers, CMOs, Retail Executives',
 true,
 '{"categoryTerms": ["sustainable fashion brands", "luxury fashion", "affordable clothing brands", "athletic wear"], "keyPlayers": ["Nike", "Adidas", "H&M", "Zara", "Patagonia", "Lululemon", "Uniqlo", "ASOS"], "whyValuable": "High brand loyalty, seasonal trends, strong social media presence, significant AI recommendation influence on purchasing decisions", "promptCount": 30, "expectedBrands": 80}'),

('beauty', 'Beauty & Personal Care', 
 'Skincare, makeup, natural beauty products, anti-aging solutions. Monitor how AI assistants recommend beauty and personal care brands.',
 'Brand Managers, Digital Marketing Leads, E-commerce Directors',
 true,
 '{"categoryTerms": ["skincare brands", "makeup brands", "natural beauty products", "anti-aging products"], "keyPlayers": ["L''Oréal", "Sephora", "Glossier", "The Ordinary", "Fenty Beauty", "Charlotte Tilbury", "CeraVe", "Neutrogena"], "whyValuable": "Influencer-driven market, high customer lifetime value, frequent repurchase cycles, strong search intent", "promptCount": 28, "expectedBrands": 90}'),

('politics', 'Politics & Advocacy', 
 'Political campaigns, advocacy groups, think tanks, policy organizations. Monitor AI presentation of political entities.',
 'Campaign Managers, Communications Directors, Policy Advisors',
 true,
 '{"categoryTerms": ["political organizations", "advocacy groups", "think tanks", "policy institutes"], "keyPlayers": ["Various political organizations and advocacy groups"], "whyValuable": "Critical for reputation management, high-stakes messaging, bias detection essential", "promptCount": 20, "expectedBrands": 35}'),

('cpg', 'CPG & FMCG', 
 'Consumer packaged goods, food & beverage, household products. Track AI recommendations for everyday consumer purchases.',
 'Brand Managers, Marketing VPs, Category Leads',
 true,
 '{"categoryTerms": ["food brands", "beverage brands", "household products", "cleaning products"], "keyPlayers": ["Coca-Cola", "PepsiCo", "Unilever", "P&G", "Nestlé", "Kellogg''s", "General Mills"], "whyValuable": "Massive market, high brand loyalty, frequent purchases, strong traditional brand equity", "promptCount": 28, "expectedBrands": 100}'),

('fintech', 'Banking & Fintech', 
 'Digital banks, payment platforms, investment apps, lending services, insurance tech, cryptocurrency.',
 'Product Managers, Marketing Heads, Fintech Founders',
 true,
 '{"categoryTerms": ["digital banking", "payment apps", "investment platforms", "lending services"], "keyPlayers": ["Revolut", "Monzo", "PayPal", "Stripe", "Robinhood", "Coinbase", "Wise", "Klarna"], "whyValuable": "High trust requirements, enterprise buyers, strict compliance, premium pricing", "promptCount": 25, "expectedBrands": 50}'),

('wellness', 'Health & Wellness', 
 'Supplement brands, fitness equipment, wellness products, organic health foods. Monitor health and fitness brand visibility.',
 'Brand Managers, Growth Marketers, Product Leads',
 true,
 '{"categoryTerms": ["supplement brands", "fitness equipment", "wellness products", "organic health foods"], "keyPlayers": ["Peloton", "MyProtein", "Huel", "Optimum Nutrition", "Fitbit", "Garmin", "Theragun", "Athletic Greens"], "whyValuable": "Growing market, research-intensive purchasing, trust and authority critical, recurring subscriptions", "promptCount": 27, "expectedBrands": 75}'),

('automotive', 'Mobility & Automotive', 
 'Auto brands, EV manufacturers, ride-sharing, micro-mobility. Track vehicle and transportation recommendations.',
 'Marketing Directors, Brand Strategists, Product Managers',
 true,
 '{"categoryTerms": ["electric vehicles", "car brands", "ride-sharing services", "e-scooters"], "keyPlayers": ["Tesla", "Ford", "GM", "Toyota", "Uber", "Lyft", "Lime", "Bird"], "whyValuable": "High-value purchases, long research cycles, EV transition opportunity, enterprise fleet buyers", "promptCount": 24, "expectedBrands": 45}'),

('tech', 'Consumer Electronics & Tech', 
 'Smartphones, laptops, gaming peripherals, smart home devices, fitness trackers. Track tech product recommendations in AI.',
 'Product Marketing Managers, Tech CMOs, Category Leads',
 true,
 '{"categoryTerms": ["smartphones", "laptops", "gaming headsets", "smart home devices", "fitness trackers"], "keyPlayers": ["Apple", "Samsung", "Sony", "Dell", "HP", "Fitbit", "Ring", "Nest", "Razer", "Logitech"], "whyValuable": "High-ticket items, extensive research phase, technical comparisons, significant AI query volume", "promptCount": 30, "expectedBrands": 70}'),

('travel', 'Hospitality & Travel', 
 'Hotels, airlines, booking platforms, vacation rentals, travel experiences, tourism services.',
 'Marketing Executives, Revenue Managers, Brand Directors',
 true,
 '{"categoryTerms": ["hotel chains", "airlines", "travel booking platforms", "vacation experiences"], "keyPlayers": ["Marriott", "Hilton", "Airbnb", "Booking.com", "Expedia", "Delta", "American Airlines"], "whyValuable": "Huge marketing budgets, seasonal patterns, review-driven decisions, high competition", "promptCount": 25, "expectedBrands": 60}'),

('home', 'Home & Lifestyle', 
 'Home decor, kitchen appliances, smart home products, furniture brands. Track home and lifestyle brand recommendations.',
 'Brand Managers, E-commerce Leads, Marketing Directors',
 true,
 '{"categoryTerms": ["home decor brands", "kitchen appliances", "smart home products", "furniture brands"], "keyPlayers": ["IKEA", "Wayfair", "Williams Sonoma", "KitchenAid", "Dyson", "Philips Hue", "West Elm", "CB2"], "whyValuable": "High purchase values, long consideration cycles, strong visual/aspirational component, family decision-making", "promptCount": 26, "expectedBrands": 65}')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  target_audience = EXCLUDED.target_audience,
  active = EXCLUDED.active,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Verify all 11 sectors were inserted
SELECT slug, name FROM industry_sectors WHERE active = true ORDER BY name;
