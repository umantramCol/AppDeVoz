import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Banknote, BarChart3, ChevronDown } from 'lucide-react-native';
import Accordion from '../Accordion';

interface CashSectionProps {
    isWide: boolean;
    analysisPeriod: string;
}

export default function CashSection({
    isWide,
    analysisPeriod
}: CashSectionProps) {
    return (
        <View style={styles.section}>
            <Accordion 
                title="Cierre de Caja y Análisis" 
                icon={<Banknote color="#2563eb" size={20} />}
                initialExpanded={isWide}
            >
                <View style={styles.cardInternal}>
                    <TouchableOpacity 
                        style={[styles.submitBtn, { backgroundColor: '#1e293b', marginBottom: 15 }]} 
                        onPress={() => Alert.alert('Cierre de Caja', 'Realizando proceso de cierre de caja...')}
                    >
                        <Banknote color="white" size={18} />
                        <Text style={styles.submitBtnText}>Cierre de Caja</Text>
                    </TouchableOpacity>

                    <Text style={styles.labelSmall}>Análisis</Text>
                    <TouchableOpacity 
                        style={styles.comboPlaceholder}
                        onPress={() => Alert.alert('Análisis', 'Seleccione el periodo de análisis')}
                    >
                        <BarChart3 color="#64748b" size={18} />
                        <Text style={styles.comboText}>{analysisPeriod}</Text>
                        <ChevronDown color="#94a3b8" size={16} />
                    </TouchableOpacity>
                </View>
            </Accordion>
        </View>
    );
}

const styles = StyleSheet.create({
    section: { flex: 1 },
    cardInternal: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    submitBtn: { backgroundColor: '#2563eb', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    labelSmall: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
    comboPlaceholder: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'white', 
        borderWidth: 1, 
        borderColor: '#e2e8f0', 
        borderRadius: 8, 
        padding: 10,
        gap: 10
    },
    comboText: { flex: 1, fontSize: 13, color: '#334155' }
});
