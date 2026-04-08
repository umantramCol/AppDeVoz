import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { ShoppingCart, PackagePlus, ArrowRight } from 'lucide-react-native';
import Accordion from '../Accordion';
import { TransactionType } from '../../types';

interface POSSectionProps {
    isWide: boolean;
    posType: TransactionType;
    setPosType: (type: TransactionType) => void;
    posProductName: string;
    setPosProductName: (name: string) => void;
    posQuantity: string;
    setPosQuantity: (qty: string) => void;
    onSubmit: () => void;
}

export default function POSSection({
    isWide,
    posType,
    setPosType,
    posProductName,
    setPosProductName,
    posQuantity,
    setPosQuantity,
    onSubmit
}: POSSectionProps) {
    return (
        <View style={styles.section}>
            <Accordion 
                title="Punto de Venta" 
                icon={<ShoppingCart color="#2563eb" size={20} />}
                initialExpanded={isWide}
            >
                <View style={styles.cardInternal}>
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
                    <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
                        <Text style={styles.submitBtnText}>Registrar</Text>
                        <ArrowRight color="white" size={16} />
                    </TouchableOpacity>
                </View>
            </Accordion>
        </View>
    );
}

const styles = StyleSheet.create({
    section: { flex: 1 },
    cardInternal: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    typeSelector: { flexDirection: 'row', gap: 5, marginBottom: 10 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, borderRadius: 6, backgroundColor: '#f1f5f9', gap: 5 },
    sellActive: { backgroundColor: '#10b981' },
    buyActive: { backgroundColor: '#f59e0b' },
    typeBtnText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
    textWhite: { color: 'white' },
    input: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 8, fontSize: 13, marginBottom: 10 },
    submitBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
});
