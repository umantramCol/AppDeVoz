import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, FlatList, ActivityIndicator, useWindowDimensions, Modal } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { addTransaction, findProductByName, getDailyTransactions, getProducts, addProduct, updateProduct, deleteProduct } from '../src/api/database';
import { Transaction, TransactionType, Product } from '../src/types';
import VoiceInput from '../src/components/VoiceInput';
import { parseVoiceCommand } from '../src/utils/commandParser';
import { ShoppingCart, PackagePlus, ArrowRight, TrendingUp, TrendingDown, Wallet, Clock, Package, Plus, Trash2, Edit2, LayoutDashboard } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFocusEffect } from 'expo-router';

export default function DashboardScreen() {
    const db = useSQLiteContext();
    const { width } = useWindowDimensions();
    const isWide = width > 1000;
    const isTablet = width > 700 && width <= 1000;

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

    const InventorySection = (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Inventario</Text>
                <TouchableOpacity style={styles.miniFab} onPress={() => { resetInventoryForm(); setInventoryModalVisible(true); }}>
                    <Plus color="white" size={18} />
                </TouchableOpacity>
            </View>
            <View style={styles.card}>
                {products.map((item) => (
                    <View key={item.id} style={styles.productRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productInfo}>Stk: {item.stock} | ${item.sellPrice}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleEditProduct(item)} style={{ marginRight: 10 }}>
                            <Edit2 color="#64748b" size={16} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
                            <Trash2 color="#ef4444" size={16} />
                        </TouchableOpacity>
                    </View>
                ))}
                {products.length === 0 && <Text style={styles.empty}>Sin productos</Text>}
            </View>
        </View>
    );

    const POSSection = (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Punto de Venta</Text>
            <View style={styles.card}>
                <View style={styles.typeSelector}>
                    <TouchableOpacity style={[styles.typeBtn, posType === 'sell' && styles.sellActive]} onPress={() => setPosType('sell')}>
                        <ShoppingCart color={posType === 'sell' ? 'white' : '#64748b'} size={16} />
                        <Text style={[styles.typeBtnText, posType === 'sell' && styles.textWhite]}>Venta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.typeBtn, posType === 'buy' && styles.buyActive]} onPress={() => setPosType('buy')}>
                        <PackagePlus color={posType === 'buy' ? 'white' : '#64748b'} size={16} />
                        <Text style={[styles.typeBtnText, posType === 'buy' && styles.textWhite]}>Compra</Text>
                    </TouchableOpacity>
                </View>
                <TextInput style={styles.input} placeholder="¿Qué buscas?" value={posProductName} onChangeText={setPosProductName} />
                <TextInput style={styles.input} placeholder="Cantidad" value={posQuantity} onChangeText={setPosQuantity} keyboardType="numeric" />
                <TouchableOpacity style={styles.submitBtn} onPress={handlePOSSubmit}>
                    <Text style={styles.submitBtnText}>Registrar</Text>
                    <ArrowRight color="white" size={16} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const HistorySection = (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hoy</Text>
            <View style={styles.summaryCard}>
                <View style={styles.statsRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.statLabel}>Ventas</Text>
                        <Text style={[styles.statValue, styles.salesText]}>+${totals.sales.toFixed(2)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.statLabel}>Compras</Text>
                        <Text style={[styles.statValue, styles.purchasesText]}>-${totals.purchases.toFixed(2)}</Text>
                    </View>
                </View>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Neto:</Text>
                    <Text style={styles.balanceValue}>${(totals.sales - totals.purchases).toFixed(2)}</Text>
                </View>
            </View>
            <View style={styles.card}>
                {transactions.map((item) => (
                    <View key={item.id} style={styles.transRow}>
                        <View style={[styles.dot, { backgroundColor: item.type === 'sell' ? '#10b981' : '#f59e0b' }]} />
                        <Text style={styles.historyName}>{item.productName}</Text>
                        <Text style={[styles.historyPrice, { color: item.type === 'sell' ? '#10b981' : '#f59e0b' }]}>
                            {item.type === 'sell' ? '+' : '-'}${item.totalPrice.toFixed(2)}
                        </Text>
                    </View>
                ))}
                {transactions.length === 0 && <Text style={styles.empty}>Sin historial</Text>}
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
            <ScrollView contentContainerStyle={{ padding: 15 }}>
                <View style={isWide ? styles.row : styles.col}>
                    {InventorySection}
                    {POSSection}
                    {HistorySection}
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
    section: { flex: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', textTransform: 'uppercase' },
    card: { backgroundColor: 'white', borderRadius: 10, padding: 12, elevation: 1 },
    productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    productName: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
    productInfo: { fontSize: 11, color: '#64748b' },
    miniFab: { backgroundColor: '#2563eb', padding: 5, borderRadius: 5 },
    typeSelector: { flexDirection: 'row', gap: 5, marginBottom: 10 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 6, backgroundColor: '#f1f5f9', gap: 5 },
    sellActive: { backgroundColor: '#10b981' },
    buyActive: { backgroundColor: '#f59e0b' },
    typeBtnText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
    textWhite: { color: 'white' },
    input: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 8, fontSize: 13, marginBottom: 10 },
    submitBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    summaryCard: { backgroundColor: 'white', borderRadius: 10, padding: 12, marginBottom: 10, elevation: 1 },
    statsRow: { flexDirection: 'row', marginBottom: 10 },
    statLabel: { fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' },
    statValue: { fontSize: 14, fontWeight: '800' },
    salesText: { color: '#10b981' },
    purchasesText: { color: '#f59e0b' },
    balanceRow: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
    balanceLabel: { fontSize: 12, fontWeight: '600' },
    balanceValue: { fontSize: 12, fontWeight: '800' },
    transRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    historyName: { flex: 1, fontSize: 12, color: '#334155' },
    historyPrice: { fontSize: 12, fontWeight: '700' },
    empty: { textAlign: 'center', color: '#94a3b8', fontSize: 11, padding: 10 },
    modal: { flex: 1, padding: 40, justifyContent: 'center', backgroundColor: 'white' },
    modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    cancelBtn: { flex: 1, marginRight: 10, padding: 12, backgroundColor: '#94a3b8', borderRadius: 8, alignItems: 'center' },
    saveBtn: { flex: 1, padding: 12, backgroundColor: '#2563eb', borderRadius: 8, alignItems: 'center' },
    btnText: { color: 'white', fontWeight: '700' }
});
