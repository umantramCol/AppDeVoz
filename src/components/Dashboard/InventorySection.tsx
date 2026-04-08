import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react-native';
import Accordion from '../Accordion';
import { Product } from '../../types';

interface InventorySectionProps {
    isWide: boolean;
    products: Product[];
    onAddProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: number) => void;
}

export default function InventorySection({
    isWide,
    products,
    onAddProduct,
    onEditProduct,
    onDeleteProduct
}: InventorySectionProps) {
    return (
        <View style={styles.section}>
            <Accordion 
                title="Inventario" 
                icon={<Package color="#2563eb" size={20} />}
                initialExpanded={isWide}
            >
                <View style={styles.sectionHeaderInside}>
                    <Text style={styles.sectionSubtitle}>Gestionar Productos</Text>
                    <TouchableOpacity style={styles.miniFab} onPress={onAddProduct}>
                        <Plus color="white" size={18} />
                    </TouchableOpacity>
                </View>
                <View style={styles.cardInternal}>
                    {products.map((item) => (
                        <View key={item.id} style={styles.productRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <Text style={styles.productInfo}>Stk: {item.stock} | ${item.sellPrice}</Text>
                            </View>
                            <TouchableOpacity onPress={() => onEditProduct(item)} style={{ marginRight: 10 }}>
                                <Edit2 color="#64748b" size={16} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDeleteProduct(item.id)}>
                                <Trash2 color="#ef4444" size={16} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {products.length === 0 && <Text style={styles.empty}>Sin productos</Text>}
                </View>
            </Accordion>
        </View>
    );
}

const styles = StyleSheet.create({
    section: { flex: 1 },
    sectionHeaderInside: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
    sectionSubtitle: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    cardInternal: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    miniFab: { backgroundColor: '#2563eb', padding: 6, borderRadius: 8, elevation: 2 },
    productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    productName: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
    productInfo: { fontSize: 11, color: '#64748b' },
    empty: { textAlign: 'center', color: '#94a3b8', fontSize: 11, padding: 10 },
});
