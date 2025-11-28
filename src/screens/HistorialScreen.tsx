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
import { viajesApi } from '../services/api';

interface Props {
  navigation: any;
}

interface Viaje {
  viaje_id: number;
  numero_vehiculo: string;
  piloto: string;
  fecha_viaje: string;
  estado_viaje: number;
  created_at: string;
  updated_at: string;
  total_facturas: number;
  total_guias: number;
  guias_entregadas: number;
  guias_no_entregadas: number;
}

const HistorialScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<'todos' | 'exitosos' | 'con_fallos'>(
    'todos',
  );

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    if (!user?.usuario_id) return;

    try {
      const response = await viajesApi.obtenerViajesPiloto(user.usuario_id);

      if (response.data.success && response.data.data) {
        const todosLosViajes = response.data.data;

        // Obtener fecha de hoy sin usar Date.toISOString()
        const ahora = new Date();
        const year = ahora.getFullYear();
        const month = String(ahora.getMonth() + 1).padStart(2, '0');
        const day = String(ahora.getDate()).padStart(2, '0');
        const hoyStr = `${year}-${month}-${day}`;

        // Filtrar: Solo viajes completados del día actual
        const viajesHoy = todosLosViajes.filter((viaje: any) => {
          if (viaje.estado_viaje !== 9) return false;
          if (!viaje.updated_at) return false;

          try {
            const fechaViaje = viaje.updated_at.split('T')[0];
            return fechaViaje === hoyStr;
          } catch (err) {
            return false;
          }
        });

        setViajes(viajesHoy);
      } else {
        setViajes([]);
      }
    } catch (error: any) {
      console.error('Error cargando historial');
      setViajes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarHistorial();
  };

  const viajesFiltrados = viajes.filter(viaje => {
    if (filtro === 'todos') return true;

    const porcentajeExito =
      viaje.total_guias > 0
        ? Math.round((viaje.guias_entregadas / viaje.total_guias) * 100)
        : 0;

    if (filtro === 'exitosos') return porcentajeExito === 100;
    if (filtro === 'con_fallos')
      return porcentajeExito < 100 && porcentajeExito > 0;

    return true;
  });

  const renderViaje = ({ item }: { item: Viaje }) => {
    const porcentajeExito =
      item.total_guias > 0
        ? Math.round((item.guias_entregadas / item.total_guias) * 100)
        : 0;

    // Extraer hora sin usar Date()
    let horaActualizacion = '--:--';
    try {
      const partes = item.updated_at.split('T');
      if (partes.length > 1) {
        const horaParte = partes[1].split(':');
        if (horaParte.length >= 2) {
          let hora = parseInt(horaParte[0]);
          const minuto = horaParte[1];

          // Ajustar UTC a Honduras (UTC-6)
          hora = hora - 6;
          if (hora < 0) hora += 24;

          // Formato 12 horas
          const periodo = hora >= 12 ? 'p. m.' : 'a. m.';
          if (hora > 12) hora -= 12;
          if (hora === 0) hora = 12;

          horaActualizacion = `${hora}:${minuto} ${periodo}`;
        }
      }
    } catch (err) {
      // Silenciar error
    }

    return (
      <View style={styles.viajeCard}>
        <View style={styles.viajeHeader}>
          <View style={styles.vehiculoContainer}>
            <Text style={styles.vehiculoIcon}>🚛</Text>
            <Text style={styles.vehiculoNumero}>{item.numero_vehiculo}</Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  porcentajeExito === 100
                    ? '#ECFDF5'
                    : porcentajeExito >= 50
                    ? '#FEF3C7'
                    : '#FEE2E2',
                borderColor:
                  porcentajeExito === 100
                    ? '#059669'
                    : porcentajeExito >= 50
                    ? '#F59E0B'
                    : '#DC2626',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    porcentajeExito === 100
                      ? '#059669'
                      : porcentajeExito >= 50
                      ? '#F59E0B'
                      : '#DC2626',
                },
              ]}
            >
              {porcentajeExito}% exitoso
            </Text>
          </View>
        </View>

        <Text style={styles.hora}>{horaActualizacion}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>FACTURAS: {item.total_facturas}</Text>
        </View>

        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabel, { color: '#059669' }]}>
              ENTREGADAS
            </Text>
            <Text style={[styles.resumenValor, { color: '#059669' }]}>
              {item.guias_entregadas}
            </Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={[styles.resumenLabel, { color: '#DC2626' }]}>
              NO ENTREGADAS
            </Text>
            <Text style={[styles.resumenValor, { color: '#DC2626' }]}>
              {item.guias_no_entregadas}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${porcentajeExito}%`,
                  backgroundColor:
                    porcentajeExito === 100
                      ? '#059669'
                      : porcentajeExito >= 50
                      ? '#F59E0B'
                      : '#DC2626',
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {item.guias_entregadas} / {item.guias_no_entregadas} de{' '}
            {item.total_guias}
          </Text>
        </View>
      </View>
    );
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSubtitle}>
          {viajesFiltrados.length}{' '}
          {viajesFiltrados.length === 1
            ? 'viaje completado'
            : 'viajes completados'}{' '}
          hoy
        </Text>
      </View>

      <View style={styles.filtros}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtro === 'todos' && styles.filtroActivo]}
          onPress={() => setFiltro('todos')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'todos' && styles.filtroActivoText,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtro === 'exitosos' && styles.filtroActivo,
          ]}
          onPress={() => setFiltro('exitosos')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'exitosos' && styles.filtroActivoText,
            ]}
          >
            100% Exitosos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtro === 'con_fallos' && styles.filtroActivo,
          ]}
          onPress={() => setFiltro('con_fallos')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filtroBtnText,
              filtro === 'con_fallos' && styles.filtroActivoText,
            ]}
          >
            Con Fallos
          </Text>
        </TouchableOpacity>
      </View>

      {viajesFiltrados.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No hay viajes completados hoy</Text>
        </View>
      ) : (
        <FlatList
          data={viajesFiltrados}
          renderItem={renderViaje}
          keyExtractor={item => item.viaje_id.toString()}
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
  filtros: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filtroActivo: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filtroBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
  },
  filtroActivoText: {
    color: '#FFFFFF',
  },
  lista: {
    paddingBottom: 24,
  },
  viajeCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  viajeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehiculoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehiculoIcon: {
    fontSize: 20,
  },
  vehiculoNumero: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hora: {
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
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
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resumenValor: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'center',
  },
});

export default HistorialScreen;
