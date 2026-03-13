import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LayoutDashboard, Package, History, Settings, X, LogOut } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isMobile }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'Inventario', icon: Package, path: '/inventory' }, // Future route
    { title: 'Historial', icon: History, path: '/history' },     // Future route
    { title: 'Ajustes', icon: Settings, path: '/settings' },     // Future route
  ];

  const navigateTo = (path: string) => {
    // router.push(path as any);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <View style={[styles.container, isMobile ? styles.mobileSidebar : styles.desktopSidebar]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Package color="white" size={20} />
          </View>
          <Text style={styles.logoText}>AppDeVoz</Text>
        </View>
        {isMobile && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#64748b" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.menuLabel}>Menú Principal</Text>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigateTo(item.path)}
            >
              <item.icon 
                color={isActive ? '#2563eb' : '#64748b'} 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                {item.title}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut color="#ef4444" size={20} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>v1.0.2</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  desktopSidebar: {
    width: 260,
  },
  mobileSidebar: {
    width: '100%',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 4,
  },
  menuContainer: {
    flex: 1,
    padding: 16,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 8,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  menuItemTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: 20,
    backgroundColor: '#2563eb',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionText: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});

export default Sidebar;
