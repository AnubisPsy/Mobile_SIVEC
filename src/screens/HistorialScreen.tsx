// src/screens/HistorialScreen.tsx - SOLO ESTILOS
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { facturasApi } from '../services/api';

interface Props {
  navigation: any;
}

const HistorialScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<
    'todas' | 'entregadas' | 'no_entregadas'
  >('todas');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    if (!user?.usuario_id) return;

    try {
      const response = await facturasApi.obtenerFacturasConGuiasVinculadas(
        user.usuario_id,
      );

      if (response.data.success) {
        // ✅ Filtrar solo facturas COMPLETADAS (sin guías pendientes)
        const facturasCompletadas = response.data.data.filter(
          (factura: any) =>
            factura.guias_pendientes === 0 && factura.total_guias > 0,
        );

        setFacturas(facturasCompletadas);
        console.log(`📋 ${facturasCompletadas.length} facturas en historial`);
      }
    } catch (error: any) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarHistorial();
  };

  const verDetalleFactura = (factura: any) => {
    navigation.navigate('ListaGuias', { factura });
  };

  const facturasFiltradas = facturas.filter(factura => {
    if (filtro === 'todas') return true;
    if (filtro === 'entregadas')
      return factura.guias_entregadas === factura.total_guias;
    if (filtro === 'no_entregadas') return factura.guias_entregadas === 0;
    return true;
  });

  const renderFactura = ({ item }: { item: any }) => {
    const porcentajeExito =
      item.total_guias > 0
        ? Math.round((item.guias_entregadas / item.total_guias) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.facturaCard}
        onPress={() => verDetalleFactura(item)}
        activeOpacity={0.7}
      >
        <View style={styles.facturaHeader}>
          <Text style={styles.facturaNumero}>{item.numero_factura}</Text>
          <View
            style={[
              styles.badge,
              { borderColor: porcentajeExito >= 50 ? '#059669' : '#DC2626' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: porcentajeExito >= 50 ? '#059669' : '#DC2626' },
              ]}
            >
              {porcentajeExito}%
            </Text>
          </View>
        </View>

        <Text style={styles.vehiculo}>{item.numero_vehiculo}</Text>

        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>TOTAL</Text>
            <Text style={styles.resumenValor}>{item.total_guias}</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabel, { color: '#059669' }]}>
              ENTREGADAS
            </Text>
            <Text style={[styles.resumenValor, { color: '#059669' }]}>
              {item.guias_entregadas}
            </Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabel, { color: '#DC2626' }]}>
              NO ENTREGADAS
            </Text>
            <Text style={[styles.resumenValor, { color: '#DC2626' }]}>
              {item.total_guias - item.guias_entregadas}
            </Text>
          </View>
        </View>

        <Text style={styles.fecha}>
          {new Date(item.fecha_asignacion).toLocaleDateString('es-HN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSubtitle}>
          {facturasFiltradas.length}{' '}
          {facturasFiltradas.length === 1 ? 'entrega' : 'entregas'}
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'todas' && styles.filtroActivo]}
          onPress={() => setFiltro('todas')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'todas' && styles.filtroActivoText,
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtro === 'entregadas' && styles.filtroActivo,
          ]}
          onPress={() => setFiltro('entregadas')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'entregadas' && styles.filtroActivoText,
            ]}
          >
            Entregadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtro === 'no_entregadas' && styles.filtroActivo,
          ]}
          onPress={() => setFiltro('no_entregadas')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'no_entregadas' && styles.filtroActivoText,
            ]}
          >
            No entregadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {facturasFiltradas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No hay entregas en el historial</Text>
        </View>
      ) : (
        <FlatList
          data={facturasFiltradas}
          renderItem={renderFactura}
          keyExtractor={item => item.factura_id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
              colors={['#2563EB']}
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
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
  filtros: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filtroActivo: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filtroBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
  },
  filtroActivoText: {
    color: '#FFFFFF',
  },
  lista: {
    paddingBottom: 24,
  },
  facturaCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  facturaNumero: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehiculo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 12,
  },
  resumen: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 8,
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  resumenValor: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  fecha: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'center',
  },
});

export default HistorialScreen;
