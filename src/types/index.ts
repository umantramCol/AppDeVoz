export interface Product {
    id: number;
    name: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
}

export type TransactionType = 'buy' | 'sell';

export interface Transaction {
    id: number;
    productId: number;
    productName?: string; // For display purposes
    type: TransactionType;
    quantity: number;
    date: string; // ISO 8601
    totalPrice: number;
}

export interface DailySummary {
    date: string;
    totalSales: number;
    totalPurchases: number;
    netBalance: number;
    transactionCount: number;
}
