import { TransactionType } from '../types';

export interface ParsedCommand {
    type: TransactionType;
    quantity: number;
    productName: string;
}

export const parseVoiceCommand = (text: string): ParsedCommand | null => {
    const input = text.toLowerCase().trim();

    // Pattern: [Action] [Quantity] [Units/unidades]? [of/de]? [Product]
    // Examples: 
    // "Vender 2 Coca Colas"
    // "Comprar 10 unidades de Harina"
    // "Vende 5 panes"

    const sellKeywords = ['vender', 'vende', 'venta', 'vendí', 'vendí ', 'descontar'];
    const buyKeywords = ['comprar', 'compra', 'compré', 'agregue', 'agregar', 'sumar'];

    // Written numbers mapping
    const numberMap: Record<string, number> = {
        'un': 1, 'uno': 1, 'una': 1,
        'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
        'veinte': 20, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'cien': 100
    };

    let type: TransactionType | null = null;

    // Check for sale
    if (sellKeywords.some(k => input.includes(k))) {
        type = 'sell';
    }
    // Check for buy
    else if (buyKeywords.some(k => input.includes(k))) {
        type = 'buy';
    }

    if (!type) {
        // Fallback for direct "Action Product" without specific verb sometimes
        // But let's stick to verbs for now to avoid false positives
        return null;
    }

    // 1. Try to find digit quantity
    const quantityMatch = input.match(/\d+/);
    let quantity = quantityMatch ? parseInt(quantityMatch[0]) : 0;

    // 2. If no digits, try to find written numbers
    if (quantity === 0) {
        const words = input.split(/\s+/);
        for (const word of words) {
            if (numberMap[word]) {
                quantity = numberMap[word];
                break;
            }
        }
    }

    // Default to 1 if no quantity found
    if (quantity === 0) quantity = 1;

    // Extract product name
    let productName = input;

    // Remove verbs
    [...sellKeywords, ...buyKeywords].forEach(k => {
        const regex = new RegExp(`\\b${k}\\b`, 'g');
        productName = productName.replace(regex, '');
    });

    // Remove quantity (digits or written)
    productName = productName.replace(/\d+/, '');
    Object.keys(numberMap).forEach(numWord => {
        const regex = new RegExp(`\\b${numWord}\\b`, 'g');
        productName = productName.replace(regex, '');
    });

    // Remove filler words
    const fillerWords = ['unidades', 'unidad', 'de', 'del', 'artículo', 'artículos', 'el', 'la', 'los', 'las'];
    fillerWords.forEach(w => {
        const regex = new RegExp(`\\b${w}\\b`, 'g');
        productName = productName.replace(regex, '');
    });

    productName = productName.replace(/\s+/g, ' ').trim();

    if (!productName) return null;

    return {
        type,
        quantity,
        productName
    };
};
