import bcrypt from 'bcryptjs';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import type { Product } from './types/shared';

// Seed the database with initial data
export async function seedDatabase() {
  console.log('Seeding database...');

  // Create sample products - matching gem packages from client
  const products: Product[] = [
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
