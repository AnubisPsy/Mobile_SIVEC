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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
        // ✅ FILTRAR: Ocultar facturas donde TODAS las guías estén finalizadas
        const facturasActivas = response.data.data.filter((factura: any) => {
          // Si no tiene guías vinculadas, mostrarla (para que pueda vincular)
          if (
            !factura.guias_vinculadas ||
            factura.guias_vinculadas.length === 0
          ) {
            return true;
          }

          // ✅ CORRECCIÓN: Verificar si tiene al menos una guía pendiente
          const tieneGuiasPendientes = factura.guias_vinculadas.some(
            (guia: any) => guia.estado_id === 3,
          );

          // Mostrar solo si tiene guías pendientes
          return tieneGuiasPendientes;
        });

        setFacturas(facturasActivas);
        console.log(
          `✅ ${facturasActivas.length} facturas activas (${
            response.data.data.length - facturasActivas.length
          } completadas ocultas)`,
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
    }, []),
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
          <Text style={styles.facturaNumero}>{item.numero_factura}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.total_guias}</Text>
          </View>
        </View>

        <Text style={styles.vehiculo}>{item.numero_vehiculo}</Text>

        {/* Notas del jefe */}
        {item.notas_jefe && (
          <View style={styles.notasContainer}>
            <Text style={styles.notasTexto}>{item.notas_jefe}</Text>
          </View>
        )}

        {/* Fecha */}
        <Text style={styles.fecha}>
          {new Date(item.fecha_asignacion).toLocaleDateString('es-HN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </Text>

        {/* Botón buscar guías si no tiene */}
        {!tieneGuias && (
          <TouchableOpacity
            style={styles.buscarButton}
            onPress={e => {
              e.stopPropagation();
              buscarYVincularGuias(item);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.buscarButtonText}>
              Buscar guías disponibles
            </Text>
          </TouchableOpacity>
        )}
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
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header personalizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Facturas</Text>
        <Text style={styles.headerSubtitle}>{user?.nombre_usuario}</Text>
      </View>

      {/* ✨ NUEVO: Botón de buscar facturas en el centro */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buscarFacturasButton}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon name="refresh" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.buscarFacturasButtonText}>
            {refreshing ? 'Buscando...' : 'Buscar facturas asignadas'}
          </Text>
        </TouchableOpacity>
      </View>

      {facturas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No tienes facturas asignadas</Text>
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
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  buscarFacturasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  buscarFacturasButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  lista: {
    padding: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  vehiculo: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  notasContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  notasTexto: {
    fontSize: 13,
    color: '#0A0A0A',
    lineHeight: 18,
  },
  fecha: {
    fontSize: 12,
    color: '#A3A3A3',
  },
  buscarButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
  },
  buscarButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2563EB',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'center',
  },
});

export default FacturasScreen;
