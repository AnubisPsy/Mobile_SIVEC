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

interface Guia {
  guia_id: number;
  numero_guia: string;
  numero_factura: string;
  detalle_producto?: string;
  direccion?: string;
  estado_id: number;
  fecha_emision?: string;
  fecha_entrega?: string;
  estados: {
    codigo: string;
    nombre: string;
  };
}

interface FacturaConGuia {
  factura_id: number;
  numero_factura: string;
  piloto: string;
  numero_vehiculo: string;
  fecha_asignacion: string;
  estado_id: number;
  notas_jefe?: string;
  guia?: Guia;
}

interface Props {
  navigation: any;
}

const FacturasScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<FacturaConGuia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buscandoGuia, setBuscandoGuia] = useState<number | null>(null);

  const cargarFacturas = async () => {
    if (!user?.nombre_usuario) return;

    try {
      const response = await facturasApi.obtenerFacturasConGuias(
        user.nombre_usuario,
      );

      if (response.data.success) {
        setFacturas(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las facturas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarFacturas();
    }, [user]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarFacturas();
  };

  const buscarGuia = async (factura: FacturaConGuia) => {
    setBuscandoGuia(factura.factura_id);

    try {
      const response = await facturasApi.buscarGuiaParaFactura(
        factura.numero_factura,
      );

      if (response.data.success) {
        Alert.alert(
          'Guía Encontrada',
          `Se encontró la guía ${response.data.data.numero_guia}`,
          [{ text: 'OK', onPress: () => cargarFacturas() }],
        );
      } else {
        Alert.alert(
          'No Encontrada',
          'No se encontró una guía para esta factura. Intenta más tarde o contacta al controlador.',
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo buscar la guía',
      );
    } finally {
      setBuscandoGuia(null);
    }
  };

  const verDetalleGuia = (factura: FacturaConGuia) => {
    if (!factura.guia) return;

    navigation.navigate('DetalleGuia', {
      guia: factura.guia,
      onActualizar: cargarFacturas,
    });
  };

  const getEstadoColor = (estadoCodigo: string) => {
    switch (estadoCodigo) {
      case 'guia_asignada':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'guia_entregada':
        return { bg: '#dcfce7', text: '#166534' };
      case 'guia_no_entregada':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const renderFactura = ({ item }: { item: FacturaConGuia }) => {
    const tieneGuia = !!item.guia;
    const estaBuscando = buscandoGuia === item.factura_id;
    const estadoColor = tieneGuia
      ? getEstadoColor(item.guia!.estados.codigo)
      : { bg: '#fef3c7', text: '#92400e' };

    return (
      <TouchableOpacity
        style={styles.facturaCard}
        onPress={() => tieneGuia && verDetalleGuia(item)}
        disabled={!tieneGuia}
        activeOpacity={tieneGuia ? 0.7 : 1}
      >
        {/* Header */}
        <View style={styles.facturaHeader}>
          <View>
            <Text style={styles.facturaNumero}>{item.numero_factura}</Text>
            <Text style={styles.vehiculo}>
              Vehículo: {item.numero_vehiculo}
            </Text>
          </View>
          <View
            style={[styles.estadoBadge, { backgroundColor: estadoColor.bg }]}
          >
            <Text style={[styles.estadoTexto, { color: estadoColor.text }]}>
              {tieneGuia ? item.guia!.estados.nombre : 'Sin Guía'}
            </Text>
          </View>
        </View>

        {/* Notas del jefe */}
        {item.notas_jefe && (
          <View style={styles.notasContainer}>
            <Text style={styles.notasLabel}>📝 Nota del jefe:</Text>
            <Text style={styles.notasTexto}>{item.notas_jefe}</Text>
          </View>
        )}

        {/* Si tiene guía, mostrar info */}
        {tieneGuia ? (
          <View style={styles.guiaInfo}>
            <View style={styles.guiaRow}>
              <Text style={styles.guiaLabel}>Guía:</Text>
              <Text style={styles.guiaValor}>{item.guia!.numero_guia}</Text>
            </View>

            {item.guia!.direccion && (
              <View style={styles.guiaRow}>
                <Text style={styles.guiaLabel}>📍 Dirección:</Text>
                <Text style={styles.guiaValor} numberOfLines={2}>
                  {item.guia!.direccion}
                </Text>
              </View>
            )}

            {item.guia!.detalle_producto && (
              <View style={styles.guiaRow}>
                <Text style={styles.guiaLabel}>📦 Producto:</Text>
                <Text style={styles.guiaValor} numberOfLines={2}>
                  {item.guia!.detalle_producto}
                </Text>
              </View>
            )}

            <View style={styles.verDetalleContainer}>
              <Text style={styles.verDetalleTexto}>
                Toca para ver detalle completo →
              </Text>
            </View>
          </View>
        ) : (
          // Si NO tiene guía, mostrar botón buscar
          <TouchableOpacity
            style={[
              styles.buscarButton,
              estaBuscando && styles.buscarButtonDisabled,
            ]}
            onPress={() => buscarGuia(item)}
            disabled={estaBuscando}
          >
            {estaBuscando ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buscarButtonText}>Buscando...</Text>
              </>
            ) : (
              <>
                <Text style={styles.buscarButtonIcon}>🔍</Text>
                <Text style={styles.buscarButtonText}>Buscar Guía</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando facturas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis Facturas</Text>
        <Text style={styles.subtitulo}>Piloto: {user?.nombre_usuario}</Text>
      </View>

      {facturas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No tienes facturas asignadas</Text>
          <Text style={styles.emptySubtext}>
            Cuando te asignen facturas, aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={facturas}
          renderItem={renderFactura}
          keyExtractor={item => item.factura_id.toString()}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  lista: {
    padding: 16,
  },
  facturaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  facturaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  vehiculo: {
    fontSize: 14,
    color: '#64748b',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  notasContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
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
  },
  guiaInfo: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  guiaRow: {
    marginBottom: 8,
  },
  guiaLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  guiaValor: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  verDetalleContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  verDetalleTexto: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  buscarButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buscarButtonDisabled: {
    opacity: 0.6,
  },
  buscarButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  buscarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default FacturasScreen;
