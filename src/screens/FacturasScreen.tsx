import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { facturasApi } from "../services/api";
import { FacturaAsignada } from "../types";

interface Props {
  navigation: any;
}

const FacturasScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<FacturaAsignada[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarFacturas = async () => {
    if (!user?.nombre_usuario) return;

    try {
      const response = await facturasApi.obtenerFacturasPiloto(
        user.nombre_usuario
      );

      if (response.data.success) {
        setFacturas(response.data.data);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las facturas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarFacturas();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarFacturas();
  };

  const navegarAGuias = (factura: FacturaAsignada) => {
    navigation.navigate("Guias", {
      factura,
      onGuiaSeleccionada: (guia: any) => {
        // Actualizar la factura con la guía seleccionada
        setFacturas((prev) =>
          prev.map((f) =>
            f.factura_id === factura.factura_id
              ? { ...f, guia_seleccionada: guia }
              : f
          )
        );
      },
    });
  };

  const puedeCrearViaje = () => {
    return facturas.length > 0 && facturas.every((f) => f.guia_seleccionada);
  };

  const crearViaje = async () => {
    try {
      const datosViaje = {
        facturas: facturas.map((f) => ({
          numero_factura: f.numero_factura,
          numero_guia: f.guia_seleccionada?.referencia,
        })),
        piloto: user?.nombre_usuario,
      };

      await facturasApi.crearViaje(datosViaje);

      Alert.alert("Éxito", "Viaje creado exitosamente", [
        { text: "OK", onPress: () => cargarFacturas() },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el viaje");
    }
  };

  const renderFactura = ({ item }: { item: FacturaAsignada }) => (
    <View style={styles.facturaCard}>
      <View style={styles.facturaHeader}>
        <Text style={styles.facturaNumero}>{item.numero_factura}</Text>
        <View
          style={[
            styles.estadoBadge,
            item.guia_seleccionada
              ? styles.estadoCompleto
              : styles.estadoPendiente,
          ]}
        >
          <Text style={styles.estadoTexto}>
            {item.guia_seleccionada ? "Guía Asignada" : "Sin Guía"}
          </Text>
        </View>
      </View>

      <View style={styles.facturaDetalle}>
        <Text style={styles.detalleLabel}>Vehículo:</Text>
        <Text style={styles.detalleValor}>{item.numero_vehiculo}</Text>
      </View>

      <View style={styles.facturaDetalle}>
        <Text style={styles.detalleLabel}>Fecha Asignación:</Text>
        <Text style={styles.detalleValor}>
          {new Date(item.fecha_asignacion).toLocaleDateString()}
        </Text>
      </View>

      {item.guia_seleccionada ? (
        <View style={styles.guiaInfo}>
          <Text style={styles.guiaLabel}>Guía Seleccionada:</Text>
          <Text style={styles.guiaNumero}>
            {item.guia_seleccionada.referencia}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.seleccionarButton}
          onPress={() => navegarAGuias(item)}
        >
          <Text style={styles.seleccionarText}>Seleccionar Guía</Text>
        </TouchableOpacity>
      )}

      {item.notas_jefe && (
        <View style={styles.notasContainer}>
          <Text style={styles.notasLabel}>Notas del Jefe:</Text>
          <Text style={styles.notasTexto}>{item.notas_jefe}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando facturas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis Facturas Asignadas</Text>
        <Text style={styles.subtitulo}>Piloto: {user?.nombre_usuario}</Text>
      </View>

      {facturas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No tienes facturas asignadas</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={facturas}
            renderItem={renderFactura}
            keyExtractor={(item) => item.factura_id.toString()}
            contentContainerStyle={styles.lista}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />

          {puedeCrearViaje() && (
            <View style={styles.footerButton}>
              <TouchableOpacity
                style={styles.crearViajeButton}
                onPress={crearViaje}
              >
                <Text style={styles.crearViajeText}>Crear Viaje</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subtitulo: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  lista: {
    padding: 16,
  },
  facturaCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  facturaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  facturaNumero: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  estadoCompleto: {
    backgroundColor: "#dcfce7",
  },
  estadoPendiente: {
    backgroundColor: "#fef3c7",
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1e293b",
  },
  facturaDetalle: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detalleLabel: {
    fontSize: 14,
    color: "#64748b",
    width: 120,
  },
  detalleValor: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
  },
  guiaInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
  guiaLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  guiaNumero: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  seleccionarButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
  },
  seleccionarText: {
    color: "#fff",
    fontWeight: "600",
  },
  notasContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
  },
  notasLabel: {
    fontSize: 12,
    color: "#92400e",
    marginBottom: 4,
  },
  notasTexto: {
    fontSize: 14,
    color: "#1e293b",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
  },
  footerButton: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  crearViajeButton: {
    backgroundColor: "#059669",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  crearViajeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FacturasScreen;
