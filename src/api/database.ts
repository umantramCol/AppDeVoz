import * as SQLite from 'expo-sqlite';
import { Product, Transaction, TransactionType } from '../types';

const dbName = 'inventory_pos.db';

export const initDatabase = async (db: SQLite.SQLiteDatabase) => {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            buyPrice REAL NOT NULL,
            sellPrice REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            productId INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'buy' or 'sell'
            quantity INTEGER NOT NULL,
            date TEXT NOT NULL,
            totalPrice REAL NOT NULL,
            FOREIGN KEY (productId) REFERENCES products (id)
        );
    `);
};

export const getProducts = async (db: SQLite.SQLiteDatabase): Promise<Product[]> => {
    return await db.getAllAsync<Product>('SELECT * FROM products ORDER BY name ASC');
};

export const addProduct = async (db: SQLite.SQLiteDatabase, product: Omit<Product, 'id'>) => {
    const result = await db.runAsync(
        'INSERT INTO products (name, buyPrice, sellPrice, stock) VALUES (?, ?, ?, ?)',
        [product.name, product.buyPrice, product.sellPrice, product.stock]
    );
    return result.lastInsertRowId;
};

export const updateProduct = async (db: SQLite.SQLiteDatabase, product: Product) => {
    await db.runAsync(
        'UPDATE products SET name = ?, buyPrice = ?, sellPrice = ?, stock = ? WHERE id = ?',
        [product.name, product.buyPrice, product.sellPrice, product.stock, product.id]
    );
};

export const deleteProduct = async (db: SQLite.SQLiteDatabase, id: number) => {
    await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
};

export const addTransaction = async (db: SQLite.SQLiteDatabase, transaction: Omit<Transaction, 'id'>) => {
    return await db.withTransactionAsync(async () => {
        // 1. Insert transaction
        const result = await db.runAsync(
            'INSERT INTO transactions (productId, type, quantity, date, totalPrice) VALUES (?, ?, ?, ?, ?)',
            [transaction.productId, transaction.type, transaction.quantity, transaction.date, transaction.totalPrice]
        );

        // 2. Update stock
        const stockChange = transaction.type === 'sell' ? -transaction.quantity : transaction.quantity;
        await db.runAsync(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [stockChange, transaction.productId]
        );
    });
};

export const getDailyTransactions = async (db: SQLite.SQLiteDatabase, date: string): Promise<Transaction[]> => {
    // date should be 'YYYY-MM-DD'
    return await db.getAllAsync<Transaction>(`
        SELECT t.*, p.name as productName 
        FROM transactions t
        JOIN products p ON t.productId = p.id
        WHERE date(t.date, 'localtime') = ?
        ORDER BY t.date DESC
    `, [date]);
};

export const findProductByName = async (db: SQLite.SQLiteDatabase, name: string): Promise<Product | null> => {
    // Basic normalization: lowercase and trim
    const cleanName = name.toLowerCase().trim();

    // Try exact match or LIKE first
    let product = await db.getFirstAsync<Product>('SELECT * FROM products WHERE lower(name) LIKE ? LIMIT 1', [`%${cleanName}%`]);

    // If not found, try stripping 'es' or 's' for plural variations
    if (!product && (cleanName.endsWith('es') || cleanName.endsWith('s'))) {
        const singular = cleanName.endsWith('es') ? cleanName.slice(0, -2) : cleanName.slice(0, -1);
        product = await db.getFirstAsync<Product>('SELECT * FROM products WHERE lower(name) LIKE ? LIMIT 1', [`%${singular}%`]);
    }

    return product;
};

