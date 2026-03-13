import { Slot } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase } from '../src/api/database';
import { Suspense, useState } from 'react';
import { ActivityIndicator, View, useWindowDimensions, StyleSheet, Modal } from 'react-native';
import Sidebar from '../src/components/Sidebar';
import Header from '../src/components/Header';

export default function AppLayout() {
    const { width } = useWindowDimensions();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const isDesktop = width > 1024;

    return (
        <Suspense fallback={<View style={styles.loading}><ActivityIndicator size="large" color="#2563eb" /></View>}>
            <SQLiteProvider databaseName="inventory_pos.db" onInit={async (db) => { await initDatabase(db); }}>
                <View style={styles.container}>
                    {/* Desktop Sidebar */}
                    {isDesktop && <Sidebar />}

                    <View style={styles.mainContent}>
                        {/* Mobile Header */}
                        {!isDesktop && (
                            <Header 
                                onOpenMenu={() => setIsMenuOpen(true)} 
                                title="AppDeVoz" 
                            />
                        )}

                        <View style={styles.slotContainer}>
                            <Slot />
                        </View>
                    </View>

                    {/* Mobile Sidebar Modal */}
                    {!isDesktop && (
                        <Modal
                            visible={isMenuOpen}
                            animationType="fade"
                            transparent={true}
                            onRequestClose={() => setIsMenuOpen(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.mobileSidebarContainer}>
                                    <Sidebar isMobile onClose={() => setIsMenuOpen(false)} />
                                </View>
                                <View style={styles.modalGap} onTouchStart={() => setIsMenuOpen(false)} />
                            </View>
                        </Modal>
                    )}
                </View>
            </SQLiteProvider>
        </Suspense>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    slotContainer: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    modalOverlay: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    mobileSidebarContainer: {
        width: '80%',
        maxWidth: 300,
        backgroundColor: '#ffffff',
    },
    modalGap: {
        flex: 1,
    },
});
