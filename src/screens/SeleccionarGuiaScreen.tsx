// src/screens/SeleccionarGuiaScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface Props {
  route: any;
  navigation: any;
}

const SeleccionarGuiaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { factura } = route.params;
  const [seleccionando, setSeleccionando] = useState(false);

  const seleccionarGuia = async (guia: any) => {
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
              // Importar guiasApi
              const { guiasApi } = require('../services/api');

              // Crear la guía en Supabase (vincularla)
              const response = await guiasApi.crearGuia({
                numero_guia: guia.numero_guia,
                numero_factura: factura.numero_factura,
                detalle_producto: guia.detalle_producto || 'Sin descripción',
                direccion: guia.direccion_entrega || 'Sin dirección',
                cliente: 'Cliente',
                fecha_emision: guia.fecha_emision || new Date().toISOString(),
              });

              if (response.data.success) {
                Alert.alert('✅ Éxito', 'Guía vinculada correctamente', [
                  {
                    text: 'Ver detalle',
                    onPress: () => {
                      navigation.navigate('DetalleGuia', {
                        guia: response.data.data,
                        onActualizar: () => {
                          // Recargar la lista cuando vuelva
                          navigation.goBack();
                        },
                      });
                    },
                  },
                ]);
              }
            } catch (error: any) {
              console.error('Error vinculando guía:', error);
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
    <TouchableOpacity
      style={styles.guiaCard}
      onPress={() => seleccionarGuia(item)}
      disabled={seleccionando}
    >
      <View style={styles.guiaHeader}>
        <Text style={styles.numeroGuia}>📄 {item.numero_guia}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Disponible</Text>
        </View>
      </View>

      <View style={styles.guiaInfo}>
        <Text style={styles.label}>📦 Producto:</Text>
        <Text style={styles.valor}>{item.descripcion}</Text>
      </View>

      <View style={styles.guiaInfo}>
        <Text style={styles.label}>📍 Dirección:</Text>
        <Text style={styles.valor}>{item.direccion_entrega}</Text>
      </View>

      <View style={styles.guiaInfo}>
        <Text style={styles.label}>📊 Cantidad:</Text>
        <Text style={styles.valor}>{item.cantidad}</Text>
      </View>

      <TouchableOpacity style={styles.selectButton}>
        <Text style={styles.selectButtonText}>Seleccionar esta guía →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guías Disponibles</Text>
        <Text style={styles.subtitle}>Factura: {factura.numero_factura}</Text>
        <Text style={styles.count}>
          {factura.guias_disponibles.length} guía(s) disponible(s)
        </Text>
      </View>

      {factura.guias_disponibles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No hay guías disponibles</Text>
          <Text style={styles.emptySubtext}>
            Las guías aparecerán cuando el sistema las genere
          </Text>
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
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  count: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  lista: {
    padding: 16,
  },
  guiaCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
  },
  guiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  numeroGuia: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  guiaInfo: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  valor: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default SeleccionarGuiaScreen;
