// src/screens/HistorialScreen.tsx
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
      >
        <View style={styles.facturaHeader}>
          <View style={styles.facturaHeaderLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>
                {porcentajeExito === 100
                  ? '✅'
                  : porcentajeExito === 0
                  ? '❌'
                  : '⚠️'}
              </Text>
            </View>
            <View>
              <Text style={styles.facturaNumero}>{item.numero_factura}</Text>
              <Text style={styles.vehiculo}>🚛 {item.numero_vehiculo}</Text>
            </View>
          </View>

          <View style={styles.estadisticas}>
            <Text style={styles.estadisticaLabel}>Éxito</Text>
            <Text
              style={[
                styles.estadisticaValor,
                { color: porcentajeExito >= 50 ? '#22c55e' : '#ef4444' },
              ]}
            >
              {porcentajeExito}%
            </Text>
          </View>
        </View>

        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Total</Text>
            <Text style={styles.resumenValor}>{item.total_guias}</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabel, { color: '#22c55e' }]}>
              Entregadas
            </Text>
            <Text style={[styles.resumenValor, { color: '#22c55e' }]}>
              {item.guias_entregadas}
            </Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabel, { color: '#ef4444' }]}>
              No entregadas
            </Text>
            <Text style={[styles.resumenValor, { color: '#ef4444' }]}>
              {item.total_guias - item.guias_entregadas}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.fecha}>
            📅 {new Date(item.fecha_asignacion).toLocaleDateString('es-HN')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Entregas</Text>
        <Text style={styles.headerSubtitle}>
          {facturasFiltradas.length} factura(s) completada(s)
        </Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'todas' && styles.filtroActivo]}
          onPress={() => setFiltro('todas')}
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
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'entregadas' && styles.filtroActivoText,
            ]}
          >
            ✅ Entregadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtro === 'no_entregadas' && styles.filtroActivo,
          ]}
          onPress={() => setFiltro('no_entregadas')}
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'no_entregadas' && styles.filtroActivoText,
            ]}
          >
            ❌ No entregadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {facturasFiltradas.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No hay facturas completadas</Text>
            <Text style={styles.emptySubtext}>
              Las facturas aparecerán aquí cuando completes todas sus entregas
            </Text>
          </View>
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
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  filtros: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#1e293b',
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  filtroActivo: {
    backgroundColor: '#2563eb',
  },
  filtroBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  filtroActivoText: {
    color: '#fff',
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
  estadisticas: {
    alignItems: 'center',
  },
  estadisticaLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  estadisticaValor: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resumen: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
  },
  resumenItem: {
    alignItems: 'center',
  },
  resumenLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  resumenValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  fecha: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    lineHeight: 20,
  },
});

export default HistorialScreen;
