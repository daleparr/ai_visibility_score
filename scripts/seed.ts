import { db } from '../src/lib/db'
import { adiIndustries, adiSubscriptions } from '../src/lib/db/schema'

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Insert default industries
    console.log('📊 Inserting default industries...')
    await db.insert(adiIndustries).values([
      {
        name: 'Streetwear',
        category: 'apparel',
        description: 'Urban fashion and street-inspired clothing brands',
        queryCanon: {
          queries: [
            'What are the best streetwear brands?',
            'How do I style streetwear?',
            'What makes good streetwear?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['style', 'authenticity', 'community']
        }
      },
      {
        name: 'Activewear',
        category: 'apparel',
        description: 'Athletic and fitness-focused clothing brands',
        queryCanon: {
          queries: [
            'Best activewear for running?',
            'What activewear brands are sustainable?',
            'How to choose workout clothes?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['performance', 'comfort', 'durability']
        }
      },
      {
        name: 'Luxury Fashion',
        category: 'luxury',
        description: 'High-end fashion and designer brands',
        queryCanon: {
          queries: [
            'Top luxury fashion brands?',
            'What makes luxury fashion worth it?',
            'How to authenticate luxury items?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['craftsmanship', 'heritage', 'exclusivity']
        }
      },
      {
        name: 'Fast Fashion',
        category: 'mass_market',
        description: 'Affordable, trend-driven fashion retailers',
        queryCanon: {
          queries: [
            'Best affordable fashion brands?',
            'Fast fashion vs sustainable fashion?',
            'Where to buy trendy clothes?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['trends', 'affordability', 'accessibility']
        }
      },
      {
        name: 'Sustainable Fashion',
        category: 'apparel',
        description: 'Eco-conscious and sustainable clothing brands',
        queryCanon: {
          queries: [
            'Most sustainable clothing brands?',
            'How to shop sustainably?',
            'What makes fashion sustainable?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['sustainability', 'transparency', 'ethics']
        }
      },
      {
        name: 'Consumer Electronics',
        category: 'electronics',
        description: 'Technology and electronic device brands',
        queryCanon: {
          queries: [
            'Best tech brands for reliability?',
            'How to choose electronics?',
            'What are the latest tech trends?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['innovation', 'reliability', 'support']
        }
      },
      {
        name: 'Beauty & Cosmetics',
        category: 'beauty',
        description: 'Makeup, skincare, and beauty product brands',
        queryCanon: {
          queries: [
            'Best skincare brands for sensitive skin?',
            'How to choose makeup for my skin tone?',
            'What are clean beauty brands?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['ingredients', 'effectiveness', 'inclusivity']
        }
      },
      {
        name: 'Health & Wellness',
        category: 'health_wellness',
        description: 'Supplements, fitness, and wellness brands',
        queryCanon: {
          queries: [
            'Best supplements for health?',
            'How to choose wellness products?',
            'What wellness brands are trustworthy?'
          ]
        },
        benchmarkCriteria: {
          focusAreas: ['science', 'safety', 'transparency']
        }
      }
    ]).onConflictDoNothing()

    console.log('✅ Industries seeded successfully')

    console.log('🎉 Database seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seed()