// src/screens/ListaGuiasScreen.tsx - SOLO ESTILOS
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
        return { color: '#6B6B6B', text: 'PENDIENTE' };
      case 4:
        return { color: '#059669', text: 'ENTREGADA' };
      case 5:
        return { color: '#DC2626', text: 'NO ENTREGADA' };
      default:
        return { color: '#A3A3A3', text: 'DESCONOCIDO' };
    }
  };

  const renderGuia = ({ item }: { item: any }) => {
    const badge = getEstadoBadge(item.estado_id);

    return (
      <TouchableOpacity
        style={styles.guiaCard}
        onPress={() => verDetalleGuia(item)}
        activeOpacity={0.7}
      >
        <View style={styles.guiaHeader}>
          <Text style={styles.numeroGuia}>{item.numero_guia}</Text>
          <View style={[styles.badge, { borderColor: badge.color }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.text}
            </Text>
          </View>
        </View>

        <View style={styles.guiaInfo}>
          <Text style={styles.label}>PRODUCTO</Text>
          <Text style={styles.valor} numberOfLines={2}>
            {item.detalle_producto}
          </Text>
        </View>

        <View style={styles.guiaInfo}>
          <Text style={styles.label}>DIRECCIÓN</Text>
          <Text style={styles.valor} numberOfLines={2}>
            {item.direccion}
          </Text>
        </View>

        {item.fecha_entrega && (
          <Text style={styles.fecha}>
            {new Date(item.fecha_entrega).toLocaleDateString('es-HN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guías</Text>
        <Text style={styles.subtitle}>{factura.numero_factura}</Text>
        <Text style={styles.count}>
          {factura.guias_pendientes} pendientes · {factura.guias_entregadas}{' '}
          entregadas
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
    backgroundColor: '#FAFAFA',
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
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  fecha: {
    fontSize: 12,
    color: '#A3A3A3',
  },
});

export default ListaGuiasScreen;
