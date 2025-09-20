// src/screens/PerfilScreen.tsx - VERSIÓN CORREGIDA

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
const PerfilScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar Sesión", onPress: logout, style: "destructive" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.valor}>{user?.nombre_usuario}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Correo:</Text>
            <Text style={styles.valor}>{user?.correo}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Rol:</Text>
            <Text style={styles.valor}>
              {user?.rol?.nombre_rol || "Piloto"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Sucursal:</Text>
            <Text style={styles.valor}>ID: {user?.sucursal_id}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  label: {
    fontSize: 14,
    color: "#64748b",
    width: 80,
  },
  valor: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PerfilScreen;
