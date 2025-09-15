/**
 * Comprehensive Brand Category Taxonomy
 * Dynamic categorization system for AI Discoverability Leaderboards
 */

export interface BrandCategory {
  sector: string
  industry: string
  niche: string
  emoji: string
  description: string
  keywords: string[]
  competitorBrands: string[]
  priceRange: 'budget' | 'mid-market' | 'premium' | 'luxury'
  businessModel: 'b2c' | 'b2b' | 'marketplace' | 'subscription' | 'hybrid'
}

export interface CategoryDetectionResult {
  confidence: number
  sector: string
  industry: string
  niche: string
  reasoning: string
  suggestedPeers: string[]
  alternativeCategories: Array<{
    category: string
    confidence: number
    reasoning: string
  }>
}

/**
 * Comprehensive Brand Category Taxonomy
 */
export const BRAND_TAXONOMY: Record<string, BrandCategory> = {
  // 1. Fashion & Apparel 👕
  'luxury-fashion-houses': {
    sector: 'Fashion & Apparel',
    industry: 'Luxury Fashion',
    niche: 'Luxury Fashion Houses',
    emoji: '👑',
    description: 'Ultra-premium fashion houses with heritage and exclusivity',
    keywords: ['luxury', 'haute couture', 'fashion house', 'designer', 'exclusive', 'heritage', 'craftsmanship'],
    competitorBrands: ['Chanel', 'Dior', 'Gucci', 'Prada', 'Louis Vuitton', 'Hermès', 'Versace', 'Balenciaga'],
    priceRange: 'luxury',
    businessModel: 'b2c'
  },
  'streetwear': {
    sector: 'Fashion & Apparel',
    industry: 'Contemporary Fashion',
    niche: 'Streetwear',
    emoji: '🛹',
    description: 'Urban-inspired fashion with cultural relevance and limited drops',
    keywords: ['streetwear', 'urban', 'skate', 'hip-hop', 'limited edition', 'drop', 'culture', 'youth'],
    competitorBrands: ['Supreme', 'Palace', 'Club 1984', 'Stüssy', 'Off-White', 'Fear of God', 'Kith', 'BAPE'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },
  'activewear-athleisure': {
    sector: 'Fashion & Apparel',
    industry: 'Athletic Apparel',
    niche: 'Activewear & Athleisure',
    emoji: '🏃‍♀️',
    description: 'Performance and lifestyle athletic wear for fitness and everyday',
    keywords: ['activewear', 'athleisure', 'fitness', 'workout', 'performance', 'athletic', 'gym', 'yoga'],
    competitorBrands: ['Nike', 'Gymshark', 'Lululemon', 'Alo Yoga', 'Under Armour', 'Adidas', 'Sweaty Betty', 'Outdoor Voices'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },
  'sneakers-footwear': {
    sector: 'Fashion & Apparel',
    industry: 'Footwear',
    niche: 'Sneakers & Footwear',
    emoji: '👟',
    description: 'Athletic and lifestyle footwear with cultural significance',
    keywords: ['sneakers', 'footwear', 'shoes', 'athletic', 'lifestyle', 'limited edition', 'collaboration'],
    competitorBrands: ['Jordan', 'Adidas Originals', 'New Balance', 'Yeezy', 'Converse', 'Vans', 'Nike SB', 'Puma'],
    priceRange: 'mid-market',
    businessModel: 'b2c'
  },
  'online-fashion-giants': {
    sector: 'Fashion & Apparel',
    industry: 'E-commerce Fashion',
    niche: 'Online Fashion Giants',
    emoji: '🌐',
    description: 'Large-scale online fashion retailers with global reach',
    keywords: ['online fashion', 'e-commerce', 'fast fashion', 'global', 'marketplace', 'trendy', 'affordable'],
    competitorBrands: ['ASOS', 'Zalando', 'SHEIN', 'Boohoo', 'H&M', 'Zara', 'Forever 21', 'PrettyLittleThing'],
    priceRange: 'budget',
    businessModel: 'b2c'
  },

  // 2. Beauty & Personal Care 💄
  'global-beauty-retailers': {
    sector: 'Beauty & Personal Care',
    industry: 'Beauty Retail',
    niche: 'Global Beauty Retailers',
    emoji: '💄',
    description: 'Multi-brand beauty retailers with extensive product ranges',
    keywords: ['beauty retailer', 'cosmetics', 'multi-brand', 'makeup', 'skincare', 'fragrance', 'beauty'],
    competitorBrands: ['Sephora', 'Ulta', 'Douglas', 'Boots', 'Sally Beauty', 'Beautylish', 'Cult Beauty', 'Space NK'],
    priceRange: 'mid-market',
    businessModel: 'b2c'
  },
  'clean-eco-beauty': {
    sector: 'Beauty & Personal Care',
    industry: 'Clean Beauty',
    niche: 'Clean & Eco Beauty',
    emoji: '🌿',
    description: 'Natural, organic, and sustainable beauty brands',
    keywords: ['clean beauty', 'natural', 'organic', 'eco-friendly', 'sustainable', 'non-toxic', 'green beauty'],
    competitorBrands: ['Ilia', 'RMS', 'Tata Harper', 'Herbivore', 'Drunk Elephant', 'The Ordinary', 'Glossier', 'Youth to the People'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },
  'luxury-skincare-cosmetics': {
    sector: 'Beauty & Personal Care',
    industry: 'Luxury Beauty',
    niche: 'Luxury Skincare & Cosmetics',
    emoji: '✨',
    description: 'High-end skincare and cosmetics with premium positioning',
    keywords: ['luxury beauty', 'premium skincare', 'high-end cosmetics', 'prestige', 'anti-aging', 'dermatology'],
    competitorBrands: ['La Mer', 'Estée Lauder', 'Dior Beauty', 'Charlotte Tilbury', 'Tom Ford Beauty', 'Chanel Beauty', 'SK-II', 'La Prairie'],
    priceRange: 'luxury',
    businessModel: 'b2c'
  },
  'fragrance': {
    sector: 'Beauty & Personal Care',
    industry: 'Fragrance',
    niche: 'Fragrance',
    emoji: '🌸',
    description: 'Luxury and niche fragrance brands',
    keywords: ['fragrance', 'perfume', 'cologne', 'scent', 'niche fragrance', 'artisanal', 'luxury perfume'],
    competitorBrands: ['Jo Malone', 'Diptyque', 'Le Labo', 'Tom Ford Beauty', 'Byredo', 'Maison Margiela', 'Creed', 'Amouage'],
    priceRange: 'luxury',
    businessModel: 'b2c'
  },

  // 3. Multi-Brand Retail 🛍️
  'luxury-department-stores': {
    sector: 'Multi-Brand Retail',
    industry: 'Department Stores',
    niche: 'Luxury Department Stores',
    emoji: '🏬',
    description: 'Premium department stores with curated luxury selections',
    keywords: ['luxury department store', 'premium retail', 'curated', 'high-end', 'designer', 'exclusive'],
    competitorBrands: ['Selfridges', 'Harrods', 'Nordstrom', 'Saks', 'Bergdorf Goodman', 'Net-a-Porter', 'Matches Fashion', 'Farfetch'],
    priceRange: 'luxury',
    businessModel: 'b2c'
  },
  'mass-market-department-stores': {
    sector: 'Multi-Brand Retail',
    industry: 'Department Stores',
    niche: 'Mass-Market Department Stores',
    emoji: '🏪',
    description: 'Accessible department stores serving mainstream consumers',
    keywords: ['department store', 'mainstream retail', 'family shopping', 'affordable', 'variety', 'everyday'],
    competitorBrands: ['Target', 'John Lewis', 'Macy\'s', 'Kohl\'s', 'JCPenney', 'Dillard\'s', 'Belk', 'Bon-Ton'],
    priceRange: 'mid-market',
    businessModel: 'b2c'
  },
  'online-mega-retailers': {
    sector: 'Multi-Brand Retail',
    industry: 'E-commerce Platforms',
    niche: 'Online Mega-Retailers',
    emoji: '📦',
    description: 'Large-scale online marketplaces with everything-store approach',
    keywords: ['marketplace', 'e-commerce giant', 'online retail', 'everything store', 'global platform', 'logistics'],
    competitorBrands: ['Amazon', 'eBay', 'Rakuten', 'JD.com', 'Alibaba', 'Walmart.com', 'Shopify', 'Etsy'],
    priceRange: 'mid-market',
    businessModel: 'marketplace'
  },
  'category-specialists': {
    sector: 'Multi-Brand Retail',
    industry: 'Specialty Retail',
    niche: 'Category Specialists',
    emoji: '🎯',
    description: 'Retailers specializing in specific product categories',
    keywords: ['specialty retail', 'category expert', 'specialized', 'focused', 'expert', 'niche retail'],
    competitorBrands: ['Best Buy', 'Dick\'s Sporting Goods', 'Decathlon', 'REI', 'Guitar Center', 'GameStop', 'Barnes & Noble', 'Petco'],
    priceRange: 'mid-market',
    businessModel: 'b2c'
  },

  // 4. Food, Beverage & Grocery 🍽️
  'luxury-spirits-wines': {
    sector: 'Food, Beverage & Grocery',
    industry: 'Alcoholic Beverages',
    niche: 'Luxury Spirits & Wines',
    emoji: '🥃',
    description: 'Premium alcoholic beverages with heritage and craftsmanship',
    keywords: ['luxury spirits', 'premium wine', 'whiskey', 'champagne', 'craft', 'aged', 'heritage', 'distillery'],
    competitorBrands: ['Macallan', 'Moët', 'Dom Pérignon', 'Hennessy', 'Johnnie Walker', 'Grey Goose', 'Patron', 'Rémy Martin'],
    priceRange: 'luxury',
    businessModel: 'b2c'
  },
  'premium-coffee-beverages': {
    sector: 'Food, Beverage & Grocery',
    industry: 'Beverages',
    niche: 'Premium Coffee & Beverages',
    emoji: '☕',
    description: 'High-quality coffee and specialty beverages',
    keywords: ['premium coffee', 'specialty coffee', 'artisanal', 'single origin', 'roastery', 'craft beverages'],
    competitorBrands: ['Nespresso', 'Blue Bottle', 'Lavazza', 'Illy', 'Starbucks Reserve', 'Intelligentsia', 'Counter Culture', 'Stumptown'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },
  'global-grocery-giants': {
    sector: 'Food, Beverage & Grocery',
    industry: 'Grocery Retail',
    niche: 'Global Grocery Giants',
    emoji: '🛒',
    description: 'Large-scale grocery retailers with extensive reach',
    keywords: ['grocery', 'supermarket', 'food retail', 'everyday essentials', 'family shopping', 'convenience'],
    competitorBrands: ['Walmart', 'Tesco', 'Carrefour', 'Costco', 'Kroger', 'Sainsbury\'s', 'ASDA', 'Metro'],
    priceRange: 'mid-market',
    businessModel: 'b2c'
  },
  'health-food-organic': {
    sector: 'Food, Beverage & Grocery',
    industry: 'Organic & Health Food',
    niche: 'Health Food & Organic',
    emoji: '🥬',
    description: 'Organic, natural, and health-focused food retailers',
    keywords: ['organic', 'health food', 'natural', 'wellness', 'clean eating', 'sustainable food', 'farm-to-table'],
    competitorBrands: ['Whole Foods', 'Erewhon', 'Planet Organic', 'Fresh Market', 'Sprouts', 'Natural Grocers', 'Earth Fare', 'Fresh Thyme'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },

  // 5. Health, Fitness & Wellness 🏋️
  'wellness-tech-wearables': {
    sector: 'Health, Fitness & Wellness',
    industry: 'Wellness Technology',
    niche: 'Wellness Tech & Wearables',
    emoji: '⌚',
    description: 'Technology-driven wellness and fitness tracking devices',
    keywords: ['wellness tech', 'wearables', 'fitness tracker', 'health monitoring', 'biometrics', 'smart device'],
    competitorBrands: ['Oura', 'Whoop', 'Peloton', 'Tonal', 'Fitbit', 'Garmin', 'Apple Watch', 'Samsung Health'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },
  'supplements-nutrition': {
    sector: 'Health, Fitness & Wellness',
    industry: 'Nutrition & Supplements',
    niche: 'Supplements & Nutrition',
    emoji: '💊',
    description: 'Nutritional supplements and wellness products',
    keywords: ['supplements', 'nutrition', 'vitamins', 'protein', 'wellness', 'health', 'fitness nutrition'],
    competitorBrands: ['MyProtein', 'Ritual', 'Onnit', 'Huel', 'Athletic Greens', 'Thorne', 'Garden of Life', 'Optimum Nutrition'],
    priceRange: 'mid-market',
    businessModel: 'b2c'
  },
  'fitness-apparel': {
    sector: 'Health, Fitness & Wellness',
    industry: 'Fitness Apparel',
    niche: 'Fitness Apparel',
    emoji: '🏋️‍♀️',
    description: 'Specialized fitness and workout clothing',
    keywords: ['fitness apparel', 'workout clothes', 'athletic wear', 'performance gear', 'training', 'exercise'],
    competitorBrands: ['Under Armour', 'Sweaty Betty', 'On Running', 'Rhone', 'Outdoor Voices', 'Alo Yoga', 'Lorna Jane', 'Fabletics'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },

  // 6. Home & Lifestyle 🏠
  'furniture-giants': {
    sector: 'Home & Lifestyle',
    industry: 'Furniture & Home Decor',
    niche: 'Furniture Giants',
    emoji: '🛋️',
    description: 'Large-scale furniture retailers with broad selections',
    keywords: ['furniture', 'home decor', 'interior design', 'home furnishing', 'living space', 'affordable furniture'],
    competitorBrands: ['IKEA', 'Wayfair', 'Ashley', 'West Elm', 'CB2', 'Article', 'Overstock', 'World Market'],
    priceRange: 'mid-market',
    businessModel: 'b2c'
  },
  'premium-design-interiors': {
    sector: 'Home & Lifestyle',
    industry: 'Luxury Home',
    niche: 'Premium Design & Interiors',
    emoji: '🏛️',
    description: 'High-end furniture and interior design brands',
    keywords: ['luxury furniture', 'designer', 'premium interiors', 'high-end home', 'craftsmanship', 'bespoke'],
    competitorBrands: ['Restoration Hardware', 'Herman Miller', 'Vitra', 'Knoll', 'B&B Italia', 'Cassina', 'Poltrona Frau', 'Minotti'],
    priceRange: 'luxury',
    businessModel: 'b2c'
  },
  'sleep-bedding': {
    sector: 'Home & Lifestyle',
    industry: 'Sleep & Wellness',
    niche: 'Sleep & Bedding',
    emoji: '🛏️',
    description: 'Mattresses, bedding, and sleep optimization products',
    keywords: ['mattress', 'bedding', 'sleep', 'comfort', 'memory foam', 'organic bedding', 'sleep tech'],
    competitorBrands: ['Casper', 'Simba', 'Tempur', 'Emma Sleep', 'Purple', 'Saatva', 'Nectar', 'Tuft & Needle'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },

  // 7. Consumer Electronics & Entertainment 🎧
  'tech-giants': {
    sector: 'Consumer Electronics & Entertainment',
    industry: 'Consumer Technology',
    niche: 'Tech Giants',
    emoji: '📱',
    description: 'Major technology companies with ecosystem products',
    keywords: ['technology', 'consumer electronics', 'innovation', 'ecosystem', 'smart devices', 'digital'],
    competitorBrands: ['Apple', 'Samsung', 'Sony', 'Microsoft', 'Google', 'Amazon', 'LG', 'Huawei'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },
  'gaming-hardware': {
    sector: 'Consumer Electronics & Entertainment',
    industry: 'Gaming',
    niche: 'Gaming Hardware & Accessories',
    emoji: '🎮',
    description: 'Gaming-focused hardware and accessories',
    keywords: ['gaming', 'esports', 'gaming hardware', 'accessories', 'performance', 'competitive gaming'],
    competitorBrands: ['Razer', 'Alienware', 'Logitech', 'SteelSeries', 'Corsair', 'HyperX', 'ASUS ROG', 'MSI Gaming'],
    priceRange: 'premium',
    businessModel: 'b2c'
  },
  'audio-music': {
    sector: 'Consumer Electronics & Entertainment',
    industry: 'Audio Equipment',
    niche: 'Audio & Music',
    emoji: '🎧',
    description: 'High-quality audio equipment and music devices',
    keywords: ['audio', 'headphones', 'speakers', 'music', 'sound quality', 'audiophile', 'wireless audio'],
    competitorBrands: ['Bose', 'Sonos', 'Beats', 'Bang & Olufsen', 'Sennheiser', 'Audio-Technica', 'JBL', 'Marshall'],
    priceRange: 'premium',
    businessModel: 'b2c'
  }
}

/**
 * Brand detection keywords for automatic categorization
 */
export const DETECTION_KEYWORDS = {
  // Fashion & Apparel indicators
  fashion: ['fashion', 'clothing', 'apparel', 'style', 'wear', 'outfit', 'garment', 'textile'],
  luxury: ['luxury', 'premium', 'exclusive', 'haute', 'couture', 'designer', 'bespoke', 'artisanal'],
  streetwear: ['streetwear', 'urban', 'street', 'skate', 'hip-hop', 'culture', 'drop', 'limited'],
  activewear: ['activewear', 'athletic', 'fitness', 'workout', 'performance', 'sport', 'gym', 'yoga'],
  
  // Beauty & Personal Care indicators
  beauty: ['beauty', 'cosmetics', 'makeup', 'skincare', 'fragrance', 'perfume', 'personal care'],
  clean: ['clean', 'natural', 'organic', 'eco', 'sustainable', 'non-toxic', 'green'],
  
  // Technology indicators
  tech: ['technology', 'tech', 'digital', 'smart', 'electronic', 'device', 'innovation'],
  gaming: ['gaming', 'game', 'esports', 'gamer', 'console', 'pc gaming', 'competitive'],
  
  // Retail indicators
  retail: ['retail', 'store', 'shop', 'marketplace', 'e-commerce', 'online shopping'],
  department: ['department store', 'multi-brand', 'variety', 'everything store'],
  
  // Home & Lifestyle indicators
  home: ['home', 'furniture', 'interior', 'decor', 'living', 'house', 'design'],
  sleep: ['sleep', 'mattress', 'bedding', 'comfort', 'rest', 'bedroom'],
  
  // Food & Beverage indicators
  food: ['food', 'grocery', 'beverage', 'drink', 'nutrition', 'organic food'],
  spirits: ['spirits', 'wine', 'whiskey', 'champagne', 'alcohol', 'distillery'],
  coffee: ['coffee', 'espresso', 'roastery', 'cafe', 'beans', 'brewing'],
  
  // Wellness indicators
  wellness: ['wellness', 'health', 'fitness', 'nutrition', 'supplement', 'wellbeing'],
  wearable: ['wearable', 'tracker', 'monitor', 'biometric', 'health tech']
}

/**
 * Price range indicators for automatic detection
 */
export const PRICE_INDICATORS = {
  luxury: ['luxury', 'premium', 'exclusive', 'high-end', 'prestige', 'bespoke', 'artisanal', 'heritage'],
  premium: ['premium', 'quality', 'professional', 'performance', 'advanced', 'superior'],
  'mid-market': ['affordable', 'value', 'everyday', 'accessible', 'mainstream', 'family'],
  budget: ['budget', 'discount', 'cheap', 'low-cost', 'economy', 'bargain', 'value']
}

/**
 * Business model indicators
 */
export const BUSINESS_MODEL_INDICATORS = {
  b2c: ['consumer', 'retail', 'shop', 'buy', 'customer', 'personal'],
  b2b: ['business', 'enterprise', 'professional', 'corporate', 'industry', 'commercial'],
  marketplace: ['marketplace', 'platform', 'sellers', 'vendors', 'third-party', 'multi-vendor'],
  subscription: ['subscription', 'monthly', 'recurring', 'membership', 'plan', 'service']
}

/**
 * Get all available categories
 */
export function getAllCategories(): Array<{ sector: string; industry: string; niche: string; emoji: string }> {
  return Object.values(BRAND_TAXONOMY).map(category => ({
    sector: category.sector,
    industry: category.industry,
    niche: category.niche,
    emoji: category.emoji
  }))
}

/**
 * Get categories by sector
 */
export function getCategoriesBySector(sector: string): BrandCategory[] {
  return Object.values(BRAND_TAXONOMY).filter(category => category.sector === sector)
}

/**
 * Get unique sectors
 */
export function getUniqueSectors(): string[] {
  return [...new Set(Object.values(BRAND_TAXONOMY).map(category => category.sector))]
}

/**
 * Find category by niche name
 */
export function findCategoryByNiche(niche: string): BrandCategory | undefined {
  return Object.values(BRAND_TAXONOMY).find(category => 
    category.niche.toLowerCase() === niche.toLowerCase()
  )
}