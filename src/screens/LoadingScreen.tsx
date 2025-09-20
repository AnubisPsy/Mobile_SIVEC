import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.text}>Cargando SIVEC...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
});

export default LoadingScreen;
