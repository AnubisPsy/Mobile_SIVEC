import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import FacturasScreen from '../screens/FacturasScreen';
import DetalleGuiaScreen from '../screens/DetalleGuiaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import LoadingScreen from '../screens/LoadingScreen';

// Definir tipos de navegación
type RootStackParamList = {
  MainTabs: undefined;
  DetalleGuia: {
    guia: any;
    onActualizar: () => void;
  };
  Login: undefined;
};

type TabParamList = {
  Facturas: undefined;
  Perfil: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function AuthenticatedTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#2563eb',
      }}
    >
      <Tab.Screen
        name="Facturas"
        component={FacturasScreen}
        options={{ title: 'Mis Facturas' }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{ title: 'Mi Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={AuthenticatedTabs} />
            <Stack.Screen
              name="DetalleGuia"
              component={DetalleGuiaScreen}
              options={{
                headerShown: true,
                title: 'Detalle de Guía',
                headerStyle: { backgroundColor: '#2563eb' },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
