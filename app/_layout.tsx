import { Tabs } from 'expo-router';
import { Package, LayoutDashboard } from 'lucide-react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { initDatabase } from '../src/api/database';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
    return (
        <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>}>
            <SQLiteProvider databaseName="inventory_pos.db" onInit={async (db) => { await initDatabase(); }}>
                <Tabs screenOptions={{
                    tabBarActiveTintColor: '#2563eb',
                    tabBarPosition: 'top',
                    headerShown: false,
                    tabBarStyle: { height: 60, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }
                }}>
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Dashboard',
                            tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} />,
                        }}
                    />
                </Tabs>
            </SQLiteProvider>
        </Suspense>
    );
}
