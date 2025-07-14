import Database from 'better-sqlite3';
import path from 'path';
import { User, UserProfile, Product, TransactionReceipt } from './types/shared';

export interface DatabaseUser extends User{
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseUserProfile extends Omit<UserProfile, 'username'> {
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseProduct extends Product {
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseTransaction {
  id: string;
  userId: string;
  boltReference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  totalAmount: number;
  acknowledged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionProduct {
  id: number;
  transactionId: string;
  productId: string;
  quantity: number;
  price: number;
}

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const defaultPath = path.join(__dirname, '..', 'gamestore.db');
    this.db = new Database(dbPath || defaultPath);
    this.initTables();
  }

  private initTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        email TEXT UNIQUE NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // User profiles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT UNIQUE NOT NULL,
        gems INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        price REAL NOT NULL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        boltReference TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        totalAmount REAL NOT NULL,
        acknowledged BOOLEAN NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Transaction products junction table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transaction_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId TEXT NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (transactionId) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_profiles_userId ON user_profiles(userId);
      CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId);
      CREATE INDEX IF NOT EXISTS idx_transactions_boltReference ON transactions(boltReference);
      CREATE INDEX IF NOT EXISTS idx_transaction_products_transactionId ON transaction_products(transactionId);
      CREATE INDEX IF NOT EXISTS idx_transaction_products_productId ON transaction_products(productId);
    `);
  }

  // User operations
  createUser(user: Omit<DatabaseUser, 'createdAt' | 'updatedAt'>): DatabaseUser {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, passwordHash, email, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(user.id, user.username, user.passwordHash, user.email, now, now);
    return { ...user, createdAt: now, updatedAt: now };
  }

  getUserById(id: string): DatabaseUser | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as DatabaseUser | undefined;
  }

  getUserByUsername(username: string): DatabaseUser | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as DatabaseUser | undefined;
  }

  updateUser(id: string, updates: Partial<Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
    const fields = Object.keys(updates);
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    
    const stmt = this.db.prepare(`
      UPDATE users 
      SET ${setClause}, updatedAt = datetime('now')
      WHERE id = ?
    `);
    const result = stmt.run(...values, id);
    return result.changes > 0;
  }

  // User profile operations
  createUserProfile(profile: Omit<DatabaseUserProfile, 'id' | 'createdAt' | 'updatedAt'>): DatabaseUserProfile {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO user_profiles (userId, gems, createdAt, updatedAt)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(profile.userId, profile.gems, now, now);
    return { 
      id: result.lastInsertRowid.toString(),
      ...profile, 
      createdAt: now, 
      updatedAt: now 
    };
  }

  getUserProfileByUserId(userId: string): DatabaseUserProfile | undefined {
    const stmt = this.db.prepare('SELECT * FROM user_profiles WHERE userId = ?');
    return stmt.get(userId) as DatabaseUserProfile | undefined;
  }

  updateUserProfile(userId: string, updates: Partial<Omit<DatabaseUserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): boolean {
    const fields = Object.keys(updates);
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    
    const stmt = this.db.prepare(`
      UPDATE user_profiles 
      SET ${setClause}, updatedAt = datetime('now')
      WHERE userId = ?
    `);
    const result = stmt.run(...values, userId);
    return result.changes > 0;
  }

  addGemsToUser(userId: string, gems: number): boolean {
    const stmt = this.db.prepare(`
      UPDATE user_profiles 
      SET gems = gems + ?, updatedAt = datetime('now')
      WHERE userId = ?
    `);
    const result = stmt.run(gems, userId);
    return result.changes > 0;
  }

  // Product operations
  createProduct(product: Omit<DatabaseProduct, 'createdAt' | 'updatedAt'>): DatabaseProduct {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO products (id, name, description, image, price, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(product.id, product.name, product.description, product.image, product.price, now, now);
    return { ...product, createdAt: now, updatedAt: now };
  }

  getProductById(id: string): DatabaseProduct | undefined {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id) as DatabaseProduct | undefined;
  }

  getAllProducts(): DatabaseProduct[] {
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
    return stmt.all() as DatabaseProduct[];
  }

  updateProduct(id: string, updates: Partial<Omit<DatabaseProduct, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
    const fields = Object.keys(updates);
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    
    const stmt = this.db.prepare(`
      UPDATE products 
      SET ${setClause}, updatedAt = datetime('now')
      WHERE id = ?
    `);
    const result = stmt.run(...values, id);
    return result.changes > 0;
  }

  deleteProduct(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Transaction operations
  createTransaction(transaction: Omit<DatabaseTransaction, 'createdAt' | 'updatedAt'>): DatabaseTransaction {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO transactions (id, userId, boltReference, status, totalAmount, acknowledged, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      transaction.id,
      transaction.userId,
      transaction.boltReference,
      transaction.status,
      transaction.totalAmount,
      transaction.acknowledged,
      now,
      now
    );
    return { ...transaction, createdAt: now, updatedAt: now };
  }

  getTransactionById(id: string): DatabaseTransaction | undefined {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE id = ?');
    return stmt.get(id) as DatabaseTransaction | undefined;
  }

  getTransactionByBoltReference(boltReference: string): DatabaseTransaction | undefined {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE boltReference = ?');
    return stmt.get(boltReference) as DatabaseTransaction | undefined;
  }

  getTransactionsByUserId(userId: string): DatabaseTransaction[] {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC');
    return stmt.all(userId) as DatabaseTransaction[];
  }

  updateTransaction(id: string, updates: Partial<Omit<DatabaseTransaction, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
    const fields = Object.keys(updates);
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    
    const stmt = this.db.prepare(`
      UPDATE transactions 
      SET ${setClause}, updatedAt = datetime('now')
      WHERE id = ?
    `);
    const result = stmt.run(...values, id);
    return result.changes > 0;
  }

  // Transaction products operations
  addProductToTransaction(transactionId: string, productId: string, quantity: number, price: number): TransactionProduct {
    const stmt = this.db.prepare(`
      INSERT INTO transaction_products (transactionId, productId, quantity, price)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(transactionId, productId, quantity, price);
    return {
      id: result.lastInsertRowid as number,
      transactionId,
      productId,
      quantity,
      price
    };
  }

  getTransactionProducts(transactionId: string): TransactionProduct[] {
    const stmt = this.db.prepare('SELECT * FROM transaction_products WHERE transactionId = ?');
    return stmt.all(transactionId) as TransactionProduct[];
  }

  // Helper method to get full transaction with products
  getFullTransactionById(id: string): TransactionReceipt | undefined {
    const transaction = this.getTransactionById(id);
    if (!transaction) return undefined;

    const transactionProducts = this.getTransactionProducts(id);
    const products: Product[] = [];

    for (const tp of transactionProducts) {
      const product = this.getProductById(tp.productId);
      if (product) {
        products.push({
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: tp.price // Use the price at time of purchase
        });
      }
    }

    return {
      id: transaction.id,
      boltReference: transaction.boltReference,
      acknowledged: transaction.acknowledged,
      products
    };
  }

  // Helper method to get full transaction by bolt reference
  getFullTransactionByBoltReference(boltReference: string): TransactionReceipt | undefined {
    const transaction = this.getTransactionByBoltReference(boltReference);
    if (!transaction) return undefined;

    return this.getFullTransactionById(transaction.id);
  }

  // Utility methods
  close(): void {
    this.db.close();
  }

  // For testing - clear all data
  clearAllData(): void {
    this.db.exec('DELETE FROM transaction_products');
    this.db.exec('DELETE FROM transactions');
    this.db.exec('DELETE FROM user_profiles');
    this.db.exec('DELETE FROM users');
    this.db.exec('DELETE FROM products');
  }
}

// Export a singleton instance
export const db = new DatabaseService();
