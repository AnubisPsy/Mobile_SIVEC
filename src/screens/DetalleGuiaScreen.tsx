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
        return { color: '#6B6B6B', label: 'PENDIENTE' };
      case 'guia_entregada':
        return { color: '#059669', label: 'ENTREGADA' };
      case 'guia_no_entregada':
        return { color: '#DC2626', label: 'NO ENTREGADA' };
      default:
        return { color: '#A3A3A3', label: 'DESCONOCIDO' };
    }
  };

  const estadoInfo = getEstadoColor(guia.estados.codigo);
  const puedeActualizar = guia.estados.codigo === 'guia_asignada';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Estado actual */}
        <View style={styles.estadoContainer}>
          <Text style={styles.estadoLabel}>ESTADO</Text>
          <Text style={[styles.estadoValor, { color: estadoInfo.color }]}>
            {estadoInfo.label}
          </Text>
        </View>

        {/* Información principal */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GUÍA</Text>
            <Text style={styles.infoValue}>{guia.numero_guia}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>FACTURA</Text>
            <Text style={styles.infoValue}>{guia.numero_factura}</Text>
          </View>

          {guia.fecha_emision && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>EMISIÓN</Text>
              <Text style={styles.infoValue}>
                {new Date(guia.fecha_emision).toLocaleDateString('es-HN')}
              </Text>
            </View>
          )}

          {guia.fecha_entrega && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ENTREGA</Text>
              <Text style={styles.infoValue}>
                {new Date(guia.fecha_entrega).toLocaleDateString('es-HN')}
              </Text>
            </View>
          )}
        </View>

        {/* Dirección */}
        {guia.direccion && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DIRECCIÓN DE ENTREGA</Text>
            <Text style={styles.sectionText}>{guia.direccion}</Text>
          </View>
        )}

        {/* Producto */}
        {guia.detalle_producto && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DETALLE DEL PRODUCTO</Text>
            <Text style={styles.sectionText}>{guia.detalle_producto}</Text>
          </View>
        )}

        {/* Mensaje si ya está procesada */}
        {!puedeActualizar && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {guia.estados.codigo === 'guia_entregada'
                ? 'Esta guía ya fue marcada como entregada'
                : 'Esta guía ya fue marcada como no entregada'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botones de acción */}
      {puedeActualizar && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => actualizarEstado('no_entregada')}
            disabled={actualizando}
            activeOpacity={0.7}
          >
            {actualizando ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Text style={[styles.buttonText, { color: '#DC2626' }]}>
                No entregada
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => actualizarEstado('entregada')}
            disabled={actualizando}
            activeOpacity={0.7}
          >
            {actualizando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonTextPrimary}>Entregada</Text>
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
    backgroundColor: '#FAFAFA',
  },
  content: {
    paddingBottom: 32,
  },
  estadoContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
  },
  estadoLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  estadoValor: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A3A3A3',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 15,
    color: '#0A0A0A',
    lineHeight: 22,
  },
  messageContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 4,
  },
  messageText: {
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: '#059669',
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default DetalleGuiaScreen;
