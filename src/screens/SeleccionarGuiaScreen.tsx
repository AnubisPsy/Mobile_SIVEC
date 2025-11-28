// src/screens/SeleccionarGuiaScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

interface Props {
  route: any;
  navigation: any;
}

const SeleccionarGuiaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { factura } = route.params;
  const [seleccionando, setSeleccionando] = useState(false);
  const [loading] = useState(false); // Por si en el futuro necesitas cargar datos

  const seleccionarGuia = async (guia: any) => {
    console.log('🎯 seleccionarGuia llamado con:', guia);

    Alert.alert(
      'Confirmar selección',
      `¿Vincular la guía ${guia.numero_guia} a esta factura?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSeleccionando(true);
            try {
              console.log('📤 Enviando solicitud para vincular guía...');

              // Importar guiasApi
              const { guiasApi } = require('../services/api');

              // Crear la guía en Supabase (vincularla)
              const response = await guiasApi.crearGuia({
                numero_guia: guia.numero_guia,
                numero_factura: factura.numero_factura,
                detalle_producto: guia.detalle_producto || 'Sin descripción',
                direccion: guia.direccion_entrega || 'Sin dirección',
                fecha_emision: guia.fecha_emision || new Date().toISOString(),
              });

              console.log('✅ Respuesta:', response.data);

              if (response.data.success) {
                Alert.alert('✅ Éxito', 'Guía vinculada correctamente', [
                  {
                    text: 'Ver detalle',
                    onPress: () => {
                      navigation.navigate('DetalleGuia', {
                        guia: response.data.data,
                        estado_viaje: factura.estado_viaje, // ✅ Pasar estado del viaje
                        onActualizar: () => {
                          navigation.goBack();
                        },
                      });
                    },
                  },
                  {
                    text: 'Volver al inicio',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                      });
                    },
                    style: 'cancel',
                  },
                ]);
              }
            } catch (error: any) {
              console.error('❌ Error vinculando guía:', error);
              Alert.alert(
                'Error',
                error.response?.data?.error || 'No se pudo vincular la guía',
              );
            } finally {
              setSeleccionando(false);
            }
          },
        },
      ],
    );
  };

  const renderGuia = ({ item }: { item: any }) => (
    <View style={styles.guiaCard}>
      <View style={styles.guiaHeader}>
        <Text style={styles.numeroGuia}>{item.numero_guia}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DISPONIBLE</Text>
        </View>
      </View>

      <View style={styles.guiaInfo}>
        <Text style={styles.label}>PRODUCTO</Text>
        <Text style={styles.valor}>{item.descripcion}</Text>
      </View>

      <View style={styles.guiaInfo}>
        <Text style={styles.label}>DIRECCIÓN</Text>
        <Text style={styles.valor}>{item.direccion_entrega}</Text>
      </View>

      <View style={styles.guiaInfo}>
        <Text style={styles.label}>CANTIDAD</Text>
        <Text style={styles.valor}>{item.cantidad}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.selectButton,
          seleccionando && styles.selectButtonDisabled,
        ]}
        onPress={() => {
          console.log('🔘 Botón presionado');
          seleccionarGuia(item);
        }}
        disabled={seleccionando}
        activeOpacity={0.7}
      >
        {seleccionando ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.selectButtonText}>Seleccionar</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Pantalla de carga (por si en el futuro cargas datos aquí)
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Buscando guías...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar guía</Text>
        <Text style={styles.subtitle}>{factura.numero_factura}</Text>
        <Text style={styles.count}>
          {factura.guias_disponibles.length || 0} disponible(s)
        </Text>
      </View>

      {factura.guias_disponibles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay guías disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={factura.guias_disponibles}
          renderItem={renderGuia}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.lista}
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
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B6B6B',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    lineHeight: 28,
    color: '#0A0A0A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 8,
  },
  count: {
    fontSize: 13,
    color: '#6B6B6B',
  },
  lista: {
    paddingBottom: 24,
  },
  guiaCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  guiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numeroGuia: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0A0A0A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#059669',
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#059669',
  },
  guiaInfo: {
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A3A3A3',
    marginBottom: 4,
  },
  valor: {
    fontSize: 15,
    color: '#0A0A0A',
  },
  selectButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  selectButtonDisabled: {
    opacity: 0.6,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'center',
  },
});

export default SeleccionarGuiaScreen;
