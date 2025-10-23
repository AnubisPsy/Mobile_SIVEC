import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Props {
  route: any;
  navigation: any;
}

const ListaGuiasScreen: React.FC<Props> = ({ route, navigation }) => {
  const { factura } = route.params;

  const verDetalleGuia = (guia: any) => {
    navigation.navigate('DetalleGuia', {
      guia,
      onActualizar: () => {
        navigation.goBack();
      },
    });
  };

  const getEstadoBadge = (estado_id: number) => {
    switch (estado_id) {
      case 3:
        return { bg: '#3b82f6', text: '📋 Pendiente' };
      case 4:
        return { bg: '#22c55e', text: '✅ Entregada' };
      case 5:
        return { bg: '#ef4444', text: '❌ No Entregada' };
      default:
        return { bg: '#64748b', text: 'Desconocido' };
    }
  };

  const renderGuia = ({ item }: { item: any }) => {
    const badge = getEstadoBadge(item.estado_id);

    return (
      <TouchableOpacity
        style={styles.guiaCard}
        onPress={() => verDetalleGuia(item)}
      >
        <View style={styles.guiaHeader}>
          <Text style={styles.numeroGuia}>📄 {item.numero_guia}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
        </View>

        <View style={styles.guiaInfo}>
          <Text style={styles.label}>📦 Producto:</Text>
          <Text style={styles.valor}>{item.detalle_producto}</Text>
        </View>

        <View style={styles.guiaInfo}>
          <Text style={styles.label}>📍 Dirección:</Text>
          <Text style={styles.valor}>{item.direccion}</Text>
        </View>

        {item.fecha_entrega && (
          <View style={styles.guiaInfo}>
            <Text style={styles.label}>📅 Entregada:</Text>
            <Text style={styles.valor}>
              {new Date(item.fecha_entrega).toLocaleDateString('es-HN')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guías Vinculadas</Text>
        <Text style={styles.subtitle}>Factura: {factura.numero_factura}</Text>
        <Text style={styles.count}>
          {factura.guias_pendientes} pendiente(s) | {factura.guias_entregadas}{' '}
          entregada(s)
        </Text>
      </View>

      <FlatList
        data={factura.guias_vinculadas}
        renderItem={renderGuia}
        keyExtractor={item => item.guia_id.toString()}
        contentContainerStyle={styles.lista}
      />
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
});

export default ListaGuiasScreen;
