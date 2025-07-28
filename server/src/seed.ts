import bcrypt from 'bcryptjs';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import type { Product } from './types/shared';

// Seed the database with initial data
export async function seedDatabase() {
  console.log('Seeding database...');

  // Create sample products - matching gem packages from client
  const products: Omit<Product, 'boltLink'>[] = [
    {
      tier: 'starter',
      name: 'Starter Pack',
      category: 'gem_package',
      description: '100 gems to enhance your gameplay',
      image: '/assets/IconGroup_ShopIcon_Gems_s_0.png',
      sku: 'gems-100',
      gemAmount: 100,
      price: 0.99
    },
    {
      tier: 'bronze',
      name: 'Bronze Pack',
      category: 'gem_package',
      description: '500 gems with bonus rewards',
      image: '/assets/IconGroup_ShopIcon_Gems_s_1.png',
      sku: 'gems-500',
      gemAmount: 500,
      price: 4.99
    },
    {
      tier: 'silver',
      name: 'Silver Pack',
      category: 'gem_package',
      description: '1400 gems + 200 bonus gems',
      image: '/assets/IconGroup_ShopIcon_Gems_s_2.png',
      sku: 'gems-1400',
      gemAmount: 1400,
      price: 9.99
    },
    {
      tier: 'gold',
      name: 'Gold Pack',
      category: 'gem_package',
      description: '2500 gems + 500 bonus gems - Most Popular!',
      image: '/assets/IconGroup_ShopIcon_Gems_s_3.png',
      sku: 'gems-3000',
      popular: true,
      gemAmount: 3000,
      price: 19.99
    },
    {
      tier: 'platinum',
      name: 'Platinum Pack',
      category: 'gem_package',
      description: '5500 gems + 1500 bonus gems - 25% OFF',
      image: '/assets/IconGroup_ShopIcon_Gems_s_4.png',
      sku: 'gems-7000',
      gemAmount: 7000,
      savings: '25% OFF',
      price: 39.99
    },
    {
      tier: 'diamond',
      name: 'Diamond Pack',
      category: 'gem_package',
      description: '12000 gems + 4000 bonus gems - 33% OFF',
      image: '/assets/IconGroup_ShopIcon_Gems_s_5.png',
      sku: 'gems-16000',
      gemAmount: 16_000,
      savings: '33% OFF',
      price: 79.99
    }
  ];

  // Insert products
  for (const product of products) {
    try {
      db.createProduct(product);
      console.log(`Created product: ${product.name}`);
    } catch (error) {
      console.log(`Product ${product.name} already exists, skipping...`, error);
    }
  }

  // Create a sample user for testing
  const sampleUserId = uuidv4();
  try {
    const testEmail = process.env.TEST_EMAIL!;
    const testPassword = process.env.TEST_PASSWORD!;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(testPassword, saltRounds);

    console.log('Creating sample user...');
    db.createUser({
      id: sampleUserId,
      username: 'testuser',
      passwordHash: hashedPassword,
      email: testEmail
    });

    console.log('Sample user created with ID:', sampleUserId);
    const profile = db.createUserProfile({
      userId: sampleUserId,
      gems: 50 // Starting gems
    });

    console.log('Created sample user: testuser', profile);
  } catch (error) {
    console.log('Sample user creation failed, user may already exist:', error);
  }

  console.log('Database seeding completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  // db.clearAllData();
  seedDatabase();
}
