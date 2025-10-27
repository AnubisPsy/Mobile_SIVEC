// src/screens/FacturasScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { facturasApi } from '../services/api';

interface Factura {
  factura_id: number;
  numero_factura: string;
  numero_vehiculo: string;
  fecha_asignacion: string;
  notas_jefe?: string;
  guias_disponibles: any[];
  total_guias: number;
}

interface Props {
  navigation: any;
}

const FacturasScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarFacturas = async () => {
    if (!user?.usuario_id) return;

    try {
      const response = await facturasApi.obtenerFacturasConGuiasVinculadas(
        user.usuario_id,
      );

      if (response.data.success) {
        // ✅ Filtrar solo facturas con guías pendientes
        const facturasActivas = response.data.data.filter(
          (factura: any) => factura.guias_pendientes > 0,
        );

        setFacturas(facturasActivas);
        console.log(
          `✅ ${facturasActivas.length} facturas activas (con guías pendientes)`,
        );
      }
    } catch (error: any) {
      console.error('Error cargando facturas:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudieron cargar las facturas',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Pantalla enfocada, recargando facturas...');
      cargarFacturas();
    }, [user]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarFacturas();
  };

  // ✨ NUEVA: Navegar a guías vinculadas (para ver/entregar)
  const verGuiasVinculadas = (factura: any) => {
    if (factura.total_guias === 0) {
      Alert.alert('Sin guías', 'Esta factura aún no tiene guías vinculadas');
      return;
    }

    navigation.navigate('ListaGuias', { factura });
  };

  const renderFactura = ({ item }: { item: Factura }) => {
    const tieneGuias = item.total_guias > 0;

    return (
      <TouchableOpacity
        style={styles.facturaCard}
        onPress={() => {
          if (tieneGuias) {
            verGuiasVinculadas(item);
          }
        }}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.facturaHeader}>
          <View style={styles.facturaHeaderLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📄</Text>
            </View>
            <View>
              <Text style={styles.facturaNumero}>{item.numero_factura}</Text>
              <Text style={styles.vehiculo}>🚛 {item.numero_vehiculo}</Text>
            </View>
          </View>

          <View
            style={[
              styles.badge,
              tieneGuias ? styles.badgeSuccess : styles.badgeWarning,
            ]}
          >
            <Text style={styles.badgeText}>
              {tieneGuias
                ? `${item.total_guias} guía${item.total_guias > 1 ? 's' : ''}`
                : 'Sin guías'}
            </Text>
          </View>
        </View>

        {/* Fecha */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Fecha de asignación:</Text>
          <Text style={styles.infoValue}>
            {new Date(item.fecha_asignacion).toLocaleDateString('es-HN')}
          </Text>
        </View>

        {/* Notas del jefe */}
        {item.notas_jefe && (
          <View style={styles.notasContainer}>
            <Text style={styles.notasLabel}>📝 Nota del jefe:</Text>
            <Text style={styles.notasTexto}>{item.notas_jefe}</Text>
          </View>
        )}

        {/* Footer - SOLO UNO */}
        <View style={styles.footer}>
          {tieneGuias ? (
            <>
              <Text style={styles.footerIcon}>✅</Text>
              <Text style={styles.footerText}>
                Toca para ver guías vinculadas →
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.buscarGuiasButton}
                onPress={e => {
                  e.stopPropagation(); // Evitar que se active el onPress del card
                  buscarYVincularGuias(item);
                }}
              >
                <Text style={styles.buscarGuiasIcon}>🔍</Text>
                <Text style={styles.buscarGuiasText}>
                  Buscar guías disponibles
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Buscar guías disponibles en SQL Server
  const buscarYVincularGuias = async (factura: Factura) => {
    try {
      console.log(
        '🔍 Buscando guías disponibles para:',
        factura.numero_factura,
      );

      // ✅ Usar el endpoint correcto
      const { guiasApi } = require('../services/api');

      // Este endpoint ya existe en el backend
      const response = await facturasApi.obtenerGuiasDisponibles(
        factura.numero_factura,
        user?.nombre_usuario || '', // Pasar el nombre del piloto
      );

      if (response.data.success) {
        const guiasDisponibles = response.data.data;

        if (!guiasDisponibles || guiasDisponibles.length === 0) {
          Alert.alert(
            'Sin guías disponibles',
            'No se encontraron guías en el sistema para esta factura.',
          );
          return;
        }

        // Navegar a pantalla de selección
        navigation.navigate('SeleccionarGuia', {
          factura: {
            ...factura,
            guias_disponibles: guiasDisponibles,
          },
        });
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'No se encontraron guías',
        );
      }
    } catch (error: any) {
      console.error('Error buscando guías:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudieron buscar las guías',
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Cargando facturas...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header personalizado */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Mis Facturas</Text>
            <Text style={styles.headerSubtitle}>👨‍✈️ {user?.nombre_usuario}</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{facturas.length}</Text>
            <Text style={styles.countLabel}>facturas</Text>
          </View>
        </View>
      </View>

      {facturas.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
            </View>
            <Text style={styles.emptyText}>No tienes facturas asignadas</Text>
            <Text style={styles.emptySubtext}>
              Cuando tu jefe te asigne facturas, aparecerán aquí
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={facturas}
          renderItem={renderFactura}
          keyExtractor={item => item.factura_id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  countBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  countNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  countLabel: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 2,
  },
  lista: {
    padding: 16,
  },
  facturaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  facturaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  facturaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  vehiculo: {
    fontSize: 14,
    color: '#94a3b8',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#22c55e',
  },
  badgeWarning: {
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  notasContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  notasLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  notasTexto: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  footerTextWarning: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 32,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#cbd5e1',
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 32,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  buscarGuiasButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buscarGuiasIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  buscarGuiasText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
});

export default FacturasScreen;
