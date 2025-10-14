import Database from 'better-sqlite3';
import path from 'path';
import type { BoltTransactionWebhook } from '@boltpay/bolt-js';
import type { User, UserProfile, Product, Amount } from './types/shared';

export interface DatabaseUser extends User{
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseUserProfile extends Omit<UserProfile, 'username' | 'email'> {
  id: string;
  userId: string;
  gems: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseProduct extends Product {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseTransaction {
  id: number;
  userId: string;
  boltPaymentLinkId: string;
  status: BoltTransactionWebhook['data']['status'];
  totalAmount: Amount;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseUpsertTransaction {
  userId: string;
  boltPaymentLinkId: string;
  status: BoltTransactionWebhook['data']['status'];
  totalAmount?: Amount;
}

export interface TransactionProduct {
  id: number;
  transactionId: number;
  productId: number;
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        tier TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL DEFAULT 'gem_package',
        gemAmount INTEGER,
        savings TEXT,
        popular BOOLEAN DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        paymentLinkId TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        totalAmount REAL,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Transaction products junction table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transaction_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_transactions_paymentLinkId ON transactions(paymentLinkId);
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

  getUserByEmail(email: string): DatabaseUser | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as DatabaseUser | undefined;
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
  createProduct(product: Omit<DatabaseProduct, 'id' | 'createdAt' | 'updatedAt'>): DatabaseProduct {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO products (name, tier, description, image, sku, price, category, gemAmount, savings, popular, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      product.name, 
      product.tier, 
      product.description, 
      product.image, 
      product.sku, 
      product.price, 
      product.category, 
      product.gemAmount || null, 
      product.savings || null, 
      product.popular ? 1 : 0, // Convert boolean to integer
      now, 
      now
    );
    return { ...product, id: result.lastInsertRowid as number, createdAt: now, updatedAt: now };
  }

  getProductBySku(sku: string): DatabaseProduct | undefined {
    const stmt = this.db.prepare('SELECT * FROM products WHERE sku = ?');
    return stmt.get(sku) as DatabaseProduct | undefined;
  }

  getAllProducts(): DatabaseProduct[] {
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
    return stmt.all() as DatabaseProduct[];
  }

  updateProduct(id: number, updates: Partial<Omit<DatabaseProduct, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
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

  deleteProduct(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Transaction operations
  upsertTransaction(transaction: DatabaseUpsertTransaction): DatabaseTransaction {
    const now = new Date().toISOString();
    
    // Check if transaction already exists
    const existing = this.getTransactionByPaymentLinkId(transaction.boltPaymentLinkId);

    if (existing) {
      // Update existing transaction
      const stmt = this.db.prepare(`
        UPDATE transactions 
        SET userId = ?, status = ?, totalAmount = ?, updatedAt = ?
        WHERE paymentLinkId = ?
      `);
      stmt.run(
        transaction.userId,
        transaction.status,
        transaction.totalAmount?.value ?? existing.totalAmount.value,
        now,
        transaction.boltPaymentLinkId
      );
      return { 
        ...transaction, 
        id: existing.id, 
        createdAt: existing.createdAt, 
        updatedAt: now,
        totalAmount: transaction.totalAmount || existing.totalAmount 
      };
    } else {
      // Create new transaction
      const stmt = this.db.prepare(`
        INSERT INTO transactions (userId, paymentLinkId, status, totalAmount, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        transaction.userId,
        transaction.boltPaymentLinkId,
        transaction.status,
        transaction.totalAmount?.value ?? null,
        now,
        now
      );
      return {
        ...transaction,
        totalAmount: transaction.totalAmount!,
        id: result.lastInsertRowid as number,
        createdAt: now,
        updatedAt: now
      };
    }
  }

  getTransactionById(id: number): DatabaseTransaction | undefined {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return undefined;
    
    // Convert the numeric totalAmount back to Amount object
    return {
      ...row,
      totalAmount: { value: row.totalAmount, currency: 'USD' },
    } as DatabaseTransaction;
  }

  getTransactionByPaymentLinkId(paymentLinkId: string): DatabaseTransaction | undefined {
    const stmt = this.db.prepare('SELECT * FROM transactions WHERE paymentLinkId = ?');
    const row = stmt.get(paymentLinkId) as any;
    if (!row) return undefined;
    
    // Convert the numeric totalAmount back to Amount object if it exists
    return {
      ...row,
      totalAmount: row.totalAmount ? { value: row.totalAmount, currency: 'USD' } : undefined,
    } as DatabaseTransaction;
  }

  updateTransactionByPaymentLinkId(paymentLinkId: string, updates: Partial<Omit<DatabaseTransaction, 'id' | 'paymentLinkId' | 'createdAt' | 'updatedAt'>>): boolean {
    const fields = Object.keys(updates);
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      const value = (updates as any)[field];
      // Handle Amount object for totalAmount field
      if (field === 'totalAmount' && typeof value === 'object' && value.value !== undefined) {
        return value.value;
      }
      return value;
    });
    
    const stmt = this.db.prepare(`
      UPDATE transactions 
      SET ${setClause}, updatedAt = datetime('now')
      WHERE paymentLinkId = ?
    `);
    const result = stmt.run(...values, paymentLinkId);
    return result.changes > 0;
  }

  // Transaction products operations
  addProductToTransaction(transactionId: number, productId: number, quantity: number, price: number): TransactionProduct {
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

  getTransactionProducts(transactionId: number): TransactionProduct[] {
    const stmt = this.db.prepare('SELECT * FROM transaction_products WHERE transactionId = ?');
    return stmt.all(transactionId) as TransactionProduct[];
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
