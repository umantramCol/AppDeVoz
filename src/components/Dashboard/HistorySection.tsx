import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import Accordion from '../Accordion';
import { Transaction } from '../../types';

interface HistorySectionProps {
    isWide: boolean;
    transactions: Transaction[];
    totals: { sales: number; purchases: number };
}

export default function HistorySection({
    isWide,
    transactions,
    totals
}: HistorySectionProps) {
    return (
        <View style={styles.section}>
            <Accordion 
                title="Historial de Hoy" 
                icon={<Clock color="#2563eb" size={20} />}
                initialExpanded={isWide}
            >
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
                <View style={styles.cardInternal}>
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
            </Accordion>
        </View>
    );
}

const styles = StyleSheet.create({
    section: { flex: 1 },
    cardInternal: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#f1f5f9' },
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
});
