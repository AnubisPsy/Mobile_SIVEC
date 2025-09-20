import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { facturasApi } from '../services/api';
import { GuiaDisponible, FacturaAsignada } from '../types';

// Tipos de navegación
type RootStackParamList = {
  Guias: {
    factura: FacturaAsignada;
    onGuiaSeleccionada?: (guia: GuiaDisponible) => void;
  };
};

type GuiasScreenRouteProp = RouteProp<RootStackParamList, 'Guias'>;
type GuiasScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Guias'
>;

interface Props {
  route: GuiasScreenRouteProp;
  navigation: GuiasScreenNavigationProp;
}

const GuiasScreen: React.FC<Props> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { factura, onGuiaSeleccionada } = route.params;

  const [guias, setGuias] = useState<GuiaDisponible[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionando, setSeleccionando] = useState(false);

  useEffect(() => {
    cargarGuiasDisponibles();
  }, []);

  const cargarGuiasDisponibles = async () => {
    if (!user?.nombre_usuario) return;

    try {
      setLoading(true);
      const response = await facturasApi.obtenerGuiasDisponibles(
        factura.numero_factura,
        user.nombre_usuario,
      );

      if (response.data.success) {
        setGuias(response.data.data);
      } else {
        Alert.alert('Error', 'No se encontraron guías disponibles');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las guías disponibles');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarGuia = async (guia: GuiaDisponible) => {
    Alert.alert(
      'Confirmar Selección',
      `¿Confirmas que quieres usar la guía ${guia.referencia}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSeleccionando(true);
            try {
              if (onGuiaSeleccionada) {
                onGuiaSeleccionada(guia);
              }
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo seleccionar la guía');
            } finally {
              setSeleccionando(false);
            }
          },
        },
      ],
    );
  };

  const getEstadoColor = (estado: number) => {
    switch (estado) {
      case 5:
        return '#059669';
      case 6:
        return '#d97706';
      default:
        return '#64748b';
    }
  };

  const getEstadoTexto = (estado: number) => {
    switch (estado) {
      case 5:
        return 'Despachado';
      case 6:
        return 'Despachado Parcial';
      default:
        return `Estado ${estado}`;
    }
  };

  const renderGuia = ({ item }: { item: GuiaDisponible }) => (
    <TouchableOpacity
      style={styles.guiaCard}
      onPress={() => seleccionarGuia(item)}
      disabled={seleccionando}
    >
      <View style={styles.guiaHeader}>
        <Text style={styles.guiaNumero}>{item.referencia}</Text>
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(item.estado) + '20' },
          ]}
        >
          <Text
            style={[styles.estadoTexto, { color: getEstadoColor(item.estado) }]}
          >
            {getEstadoTexto(item.estado)}
          </Text>
        </View>
      </View>

      <View style={styles.guiaDetalle}>
        <Text style={styles.detalleLabel}>Fecha de emisión:</Text>
        <Text style={styles.detalleValor}>
          {new Date(item.fecha_emision).toLocaleDateString()}
        </Text>
      </View>

      {item.detalle_producto && (
        <View style={styles.guiaDetalle}>
          <Text style={styles.detalleLabel}>Producto:</Text>
          <Text style={styles.detalleValor} numberOfLines={2}>
            {item.detalle_producto}
          </Text>
        </View>
      )}

      {item.direccion && (
        <View style={styles.guiaDetalle}>
          <Text style={styles.detalleLabel}>Dirección:</Text>
          <Text style={styles.detalleValor} numberOfLines={2}>
            {item.direccion}
          </Text>
        </View>
      )}

      <View style={styles.seleccionarContainer}>
        <Text style={styles.seleccionarTexto}>Toca para seleccionar</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Buscando guías disponibles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Seleccionar Guía</Text>
        <Text style={styles.subtitulo}>Factura: {factura.numero_factura}</Text>
        <Text style={styles.descripcion}>
          Selecciona la guía correcta para esta factura
        </Text>
      </View>

      {guias.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No hay guías disponibles</Text>
          <Text style={styles.emptySubtitle}>
            No se encontraron guías con estado 5 o 6 para esta factura
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={cargarGuiasDisponibles}
          >
            <Text style={styles.retryText}>Buscar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Se encontraron {guias.length} guía(s) disponible(s)
            </Text>
          </View>

          <FlatList
            data={guias}
            renderItem={renderGuia}
            keyExtractor={item => item.referencia}
            contentContainerStyle={styles.lista}
          />
        </>
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
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitulo: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  descripcion: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#dbeafe',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
  },
  lista: {
    padding: 16,
  },
  guiaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  guiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  guiaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  guiaDetalle: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 120,
  },
  detalleValor: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  seleccionarContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  seleccionarTexto: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default GuiasScreen;
