import { guiasApi } from '../services/api';
import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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

type RootStackParamList = {
  DetalleGuia: {
    guia: Guia;
    onActualizar: () => void;
  };
};

type DetalleGuiaScreenRouteProp = RouteProp<RootStackParamList, 'DetalleGuia'>;
type DetalleGuiaScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DetalleGuia'
>;

interface Props {
  route: DetalleGuiaScreenRouteProp;
  navigation: DetalleGuiaScreenNavigationProp;
}

const DetalleGuiaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { guia, onActualizar } = route.params;
  const [actualizando, setActualizando] = useState(false);

  const actualizarEstado = async (
    nuevoEstado: 'entregada' | 'no_entregada',
  ) => {
    const estadoId = nuevoEstado === 'entregada' ? 4 : 5;
    const mensaje =
      nuevoEstado === 'entregada'
        ? '¿Confirmas que esta guía fue entregada?'
        : '¿Confirmas que NO se pudo entregar esta guía?';

    Alert.alert('Confirmar', mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setActualizando(true);
          try {
            // Importar guiasApi en la parte superior
            const { guiasApi } = require('../services/api');

            const response = await guiasApi.actualizarEstadoGuia(
              guia.guia_id,
              estadoId,
            );

            if (response.data.success) {
              Alert.alert(
                '✅ Actualizado',
                `Guía marcada como ${
                  nuevoEstado === 'entregada' ? 'entregada' : 'no entregada'
                }`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onActualizar();
                      navigation.goBack();
                    },
                  },
                ],
              );
            } else {
              Alert.alert(
                'Error',
                response.data.message || 'No se pudo actualizar',
              );
            }
          } catch (error: any) {
            console.error('Error actualizando estado:', error);
            Alert.alert(
              'Error',
              error.response?.data?.message ||
                'No se pudo actualizar el estado',
            );
          } finally {
            setActualizando(false);
          }
        },
      },
    ]);
  };

  const getEstadoColor = (estadoCodigo: string) => {
    switch (estadoCodigo) {
      case 'guia_asignada':
        return { bg: '#dbeafe', text: '#1e40af', icon: '📋' };
      case 'guia_entregada':
        return { bg: '#dcfce7', text: '#166534', icon: '✅' };
      case 'guia_no_entregada':
        return { bg: '#fee2e2', text: '#991b1b', icon: '❌' };
      default:
        return { bg: '#f1f5f9', text: '#475569', icon: '📄' };
    }
  };

  const estadoInfo = getEstadoColor(guia.estados.codigo);
  const puedeActualizar = guia.estados.codigo === 'guia_asignada';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header con estado */}
        <View style={[styles.estadoCard, { backgroundColor: estadoInfo.bg }]}>
          <Text style={styles.estadoIcon}>{estadoInfo.icon}</Text>
          <Text style={[styles.estadoTexto, { color: estadoInfo.text }]}>
            {guia.estados.nombre}
          </Text>
        </View>

        {/* Información de la guía */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de la Guía</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Número de Guía:</Text>
            <Text style={styles.valor}>{guia.numero_guia}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Factura:</Text>
            <Text style={styles.valor}>{guia.numero_factura}</Text>
          </View>

          {guia.fecha_emision && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha de Emisión:</Text>
              <Text style={styles.valor}>
                {new Date(guia.fecha_emision).toLocaleDateString('es-HN')}
              </Text>
            </View>
          )}

          {guia.fecha_entrega && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha de Entrega:</Text>
              <Text style={styles.valor}>
                {new Date(guia.fecha_entrega).toLocaleDateString('es-HN')}
              </Text>
            </View>
          )}
        </View>

        {/* Dirección */}
        {guia.direccion && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📍</Text>
              <Text style={styles.cardTitle}>Dirección de Entrega</Text>
            </View>
            <Text style={styles.direccionTexto}>{guia.direccion}</Text>
          </View>
        )}

        {/* Producto */}
        {guia.detalle_producto && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📦</Text>
              <Text style={styles.cardTitle}>Detalle del Producto</Text>
            </View>
            <Text style={styles.productoTexto}>{guia.detalle_producto}</Text>
          </View>
        )}

        {/* Mensaje si ya está procesada */}
        {!puedeActualizar && (
          <View style={styles.infoMessage}>
            <Text style={styles.infoMessageText}>
              {guia.estados.codigo === 'guia_entregada'
                ? '✅ Esta guía ya fue marcada como entregada'
                : '❌ Esta guía ya fue marcada como no entregada'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botones de acción */}
      {puedeActualizar && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonNoEntregada]}
            onPress={() => actualizarEstado('no_entregada')}
            disabled={actualizando}
          >
            {actualizando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>❌</Text>
                <Text style={styles.buttonText}>No Entregada</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonEntregada]}
            onPress={() => actualizarEstado('entregada')}
            disabled={actualizando}
          >
            {actualizando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>✅</Text>
                <Text style={styles.buttonText}>Entregada</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  estadoCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  estadoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  estadoTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  valor: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  direccionTexto: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
  },
  productoTexto: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
  },
  infoMessage: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoMessageText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonEntregada: {
    backgroundColor: '#16a34a',
  },
  buttonNoEntregada: {
    backgroundColor: '#dc2626',
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetalleGuiaScreen;
