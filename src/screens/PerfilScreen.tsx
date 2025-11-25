import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet as RNStyleSheet2,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const PerfilScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesión', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <View style={stylesPerfil.container}>
      <View style={stylesPerfil.header}>
        <View style={stylesPerfil.avatar}>
          <Text style={stylesPerfil.avatarText}>
            {user?.nombre_usuario?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={stylesPerfil.headerTitle}>{user?.nombre_usuario}</Text>
        <Text style={stylesPerfil.headerSubtitle}>{user?.correo}</Text>
      </View>

      <View style={stylesPerfil.section}>
        <Text style={stylesPerfil.sectionLabel}>INFORMACIÓN PERSONAL</Text>

        <View style={stylesPerfil.infoRow}>
          <Text style={stylesPerfil.infoLabel}>NOMBRE</Text>
          <Text style={stylesPerfil.infoValue}>{user?.nombre_usuario}</Text>
        </View>

        <View style={stylesPerfil.infoRow}>
          <Text style={stylesPerfil.infoLabel}>CORREO</Text>
          <Text style={stylesPerfil.infoValue}>{user?.correo}</Text>
        </View>

        <View style={[stylesPerfil.infoRow, stylesPerfil.infoRowLast]}>
          <Text style={stylesPerfil.infoLabel}>ROL</Text>
          <Text style={stylesPerfil.infoValue}>
            {user?.rol?.nombre_rol || user?.rol?.nombre_rol || 'Piloto'}
          </Text>
        </View>
      </View>

      <View style={stylesPerfil.logoutContainer}>
        <TouchableOpacity
          style={stylesPerfil.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={stylesPerfil.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={stylesPerfil.footer}>
        <Text style={stylesPerfil.footerText}>SIVEC v1.0.0</Text>
      </View>
    </View>
  );
};

const stylesPerfil = RNStyleSheet2.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 28,
    color: '#0A0A0A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A3A3A3',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A3A3A3',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0A0A0A',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  logoutContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutText: {
    fontSize: 15,
    color: '#DC2626',
    fontWeight: '500',
  },
  footer: {
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#A3A3A3',
  },
});

export default PerfilScreen;
