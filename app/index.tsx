import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Modal, useWindowDimensions } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { addTransaction, findProductByName, getDailyTransactions, getProducts, addProduct, updateProduct, deleteProduct } from '../src/api/database';
import { Transaction, TransactionType, Product } from '../src/types';
import VoiceInput from '../src/components/VoiceInput';
import { parseVoiceCommand } from '../src/utils/commandParser';
import { format } from 'date-fns';
import { useFocusEffect } from 'expo-router';

// Dashboard Components
import InventorySection from '../src/components/Dashboard/InventorySection';
import POSSection from '../src/components/Dashboard/POSSection';
import HistorySection from '../src/components/Dashboard/HistorySection';
import CashSection from '../src/components/Dashboard/CashSection';

export default function DashboardScreen() {
    const db = useSQLiteContext();
    const { width } = useWindowDimensions();
    const isWide = width > 1000;

    // --- Inventory State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [invName, setInvName] = useState('');
    const [invBuyPrice, setInvBuyPrice] = useState('');
    const [invSellPrice, setInvSellPrice] = useState('');
    const [invStock, setInvStock] = useState('');

    // --- POS State ---
    const [posProductName, setPosProductName] = useState('');
    const [posQuantity, setPosQuantity] = useState('1');
    const [posType, setPosType] = useState<TransactionType>('sell');

    // --- History State ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysisPeriod, setAnalysisPeriod] = useState('Hoy');

    // --- Data Loading ---
    const loadData = useCallback(async () => {
        setLoading(true);
        const prodData = await getProducts(db);
        const today = format(new Date(), 'yyyy-MM-dd');
        const transData = await getDailyTransactions(db, today);
        setProducts(prodData);
        setTransactions(transData);
        setLoading(false);
    }, [db]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // --- Inventory Actions ---
    const handleSaveProduct = async () => {
        if (!invName || !invBuyPrice || !invSellPrice || !invStock) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        const productData = {
            name: invName,
            buyPrice: parseFloat(invBuyPrice),
            sellPrice: parseFloat(invSellPrice),
            stock: parseInt(invStock),
        };

        if (editingProduct) {
            await updateProduct(db, { ...productData, id: editingProduct.id });
        } else {
            await addProduct(db, productData);
        }

        setInventoryModalVisible(false);
        resetInventoryForm();
        loadData();
    };

    const resetInventoryForm = () => {
        setInvName('');
        setInvBuyPrice('');
        setInvSellPrice('');
        setInvStock('');
        setEditingProduct(null);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setInvName(product.name);
        setInvBuyPrice(product.buyPrice.toString());
        setInvSellPrice(product.sellPrice.toString());
        setInvStock(product.stock.toString());
        setInventoryModalVisible(true);
    };

    const handleDeleteProduct = (id: number) => {
        Alert.alert('Eliminar', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive', onPress: async () => {
                    await deleteProduct(db, id);
                    loadData();
                }
            },
        ]);
    };

    // --- POS Actions ---
    const handlePOSSubmit = async () => {
        if (!posProductName || !posQuantity) {
            Alert.alert('Error', 'Producto y cantidad obligatorios');
            return;
        }

        const product = await findProductByName(db, posProductName);
        if (!product) {
            Alert.alert('No encontrado', `No se encontró: ${posProductName}`);
            return;
        }

        const qty = parseInt(posQuantity);
        if (posType === 'sell' && product.stock < qty) {
            Alert.alert('Stock insuficiente', `Solo hay ${product.stock} de ${product.name}`);
            return;
        }

        const totalPrice = (posType === 'sell' ? product.sellPrice : product.buyPrice) * qty;

        await addTransaction(db, {
            productId: product.id,
            type: posType,
            quantity: qty,
            date: new Date().toISOString(),
            totalPrice
        });

        setPosProductName('');
        setPosQuantity('1');
        loadData();
        Alert.alert('Éxito', 'Transacción registrada');
    };

    const handleVoiceCommand = async (text: string) => {
        const parsed = parseVoiceCommand(text);
        if (!parsed) {
            Alert.alert('Comando no reconocido', 'Prueba "Vender 2 remeras"');
            return;
        }

        const product = await findProductByName(db, parsed.productName);
        if (!product) {
            Alert.alert('No encontrado', `Producto ${parsed.productName} no registrado`);
            return;
        }

        if (parsed.type === 'sell' && product.stock < parsed.quantity) {
            Alert.alert('Stock insuficiente', `Solo hay ${product.stock} de ${product.name}`);
            return;
        }

        await addTransaction(db, {
            productId: product.id,
            type: parsed.type,
            quantity: parsed.quantity,
            date: new Date().toISOString(),
            totalPrice: (parsed.type === 'sell' ? product.sellPrice : product.buyPrice) * parsed.quantity
        });

        loadData();
        Alert.alert('Voz Procesada', `${parsed.type === 'sell' ? 'Venta' : 'Compra'} de ${parsed.quantity} ${product.name}`);
    };

    // --- Rendering Helpers ---
    const totals = transactions.reduce((acc, t) => {
        if (t.type === 'sell') acc.sales += t.totalPrice;
        else acc.purchases += t.totalPrice;
        return acc;
    }, { sales: 0, purchases: 0 });

    return (
        <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
            <ScrollView contentContainerStyle={{ padding: 15 }}>
                <View style={isWide ? styles.row : styles.col}>
                    <InventorySection 
                        isWide={isWide}
                        products={products}
                        onAddProduct={() => { resetInventoryForm(); setInventoryModalVisible(true); }}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                    />
                    <POSSection
                        isWide={isWide}
                        posType={posType}
                        setPosType={setPosType}
                        posProductName={posProductName}
                        setPosProductName={setPosProductName}
                        posQuantity={posQuantity}
                        setPosQuantity={setPosQuantity}
                        onSubmit={handlePOSSubmit}
                    />
                    <HistorySection
                        isWide={isWide}
                        transactions={transactions}
                        totals={totals}
                    />
                    <CashSection
                        isWide={isWide}
                        analysisPeriod={analysisPeriod}
                    />
                </View>
            </ScrollView>

            <Modal visible={inventoryModalVisible} animationType="slide">
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>{editingProduct ? 'Editar' : 'Nuevo'}</Text>
                    <TextInput style={styles.input} placeholder="Nombre" value={invName} onChangeText={setInvName} />
                    <TextInput style={styles.input} placeholder="Compra $" value={invBuyPrice} onChangeText={setInvBuyPrice} keyboardType="numeric" />
                    <TextInput style={styles.input} placeholder="Venta $" value={invSellPrice} onChangeText={setInvSellPrice} keyboardType="numeric" />
                    <TextInput style={styles.input} placeholder="Stock" value={invStock} onChangeText={setInvStock} keyboardType="numeric" />
                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setInventoryModalVisible(false)}>
                            <Text style={styles.btnText}>Cerrar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProduct}>
                            <Text style={styles.btnText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <VoiceInput onCommandParsed={handleVoiceCommand} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 15 },
    col: { flexDirection: 'column', gap: 15 },
    modal: { flex: 1, padding: 40, justifyContent: 'center', backgroundColor: 'white' },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
    input: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 8, fontSize: 13, marginBottom: 10 },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancelBtn: { flex: 1, marginRight: 10, padding: 12, backgroundColor: '#94a3b8', borderRadius: 8, alignItems: 'center' },
    saveBtn: { flex: 1, padding: 12, backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: '700' },
});
