import bcrypt from 'bcryptjs';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

// Seed the database with initial data
export async function seedDatabase() {
  console.log('Seeding database...');

  // Create sample products
  const products = [
    {
      id: 'gems-small',
      name: 'Small Gem Pack',
      description: '100 gems to enhance your gameplay',
      image: '/assets/IconGroup_ShopIcon_Gems_s_0.png',
      price: 0.99
    },
    {
      id: 'gems-medium',
      name: 'Medium Gem Pack',
      description: '500 gems with bonus rewards',
      image: '/assets/IconGroup_ShopIcon_Gems_s_1.png',
      price: 4.99
    },
    {
      id: 'gems-large',
      name: 'Large Gem Pack',
      description: '1200 gems - best value!',
      image: '/assets/IconGroup_ShopIcon_Gems_s_2.png',
      price: 9.99
    },
    {
      id: 'chest-basic',
      name: 'Basic Treasure Chest',
      description: 'Contains random rewards and gems',
      image: '/assets/IconGroup_ShopIcon_Chest.png',
      price: 1.99
    },
    {
      id: 'gems-mega',
      name: 'Mega Gem Pack',
      description: '2500 gems + exclusive bonus',
      image: '/assets/IconGroup_ShopIcon_Gems_s_3.png',
      price: 19.99
    },
    {
      id: 'gems-ultimate',
      name: 'Ultimate Gem Pack',
      description: '5000 gems + premium rewards',
      image: '/assets/IconGroup_ShopIcon_Gems_s_4.png',
      price: 39.99
    }
  ];

  // Insert products
  for (const product of products) {
    try {
      db.createProduct(product);
      console.log(`Created product: ${product.name}`);
    } catch (error) {
      console.log(`Product ${product.name} already exists, skipping...`);
    }
  }

  // Create a sample user for testing
  const sampleUserId = uuidv4();
  try {
    const samplePassword = '123456'
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(samplePassword, saltRounds);

    console.log('Creating sample user...');
    db.createUser({
      id: sampleUserId,
      username: 'testuser',
      passwordHash: hashedPassword,
      email: 'test@example.com'
    });

    console.log('Sample user created with ID:', sampleUserId);
    const profile = db.createUserProfile({
      userId: sampleUserId,
      gems: 50 // Starting gems
    });

    console.log('Created sample user: testuser', profile);
  } catch (error) {
    console.log('Sample user creation failed, user may already exist:', error);
    console.log('Sample user already exists, skipping...');
  }

  console.log('Database seeding completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  seedDatabase();
  // db.clearAllData()
}
