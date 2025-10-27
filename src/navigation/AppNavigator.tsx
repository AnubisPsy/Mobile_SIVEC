// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import FacturasScreen from '../screens/FacturasScreen';
import SeleccionarGuiaScreen from '../screens/SeleccionarGuiaScreen';
import DetalleGuiaScreen from '../screens/DetalleGuiaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ListaGuiasScreen from '../screens/ListaGuiasScreen';
import HistorialScreen from '../screens/HistorialScreen';

type RootStackParamList = {
  MainTabs: undefined;
  SeleccionarGuia: {
    factura: any;
  };
  ListaGuias: {
    // ← AGREGAR
    factura: any;
  };
  DetalleGuia: {
    guia: any;
    onActualizar: () => void;
  };
  Login: undefined;
};

type TabParamList = {
  Facturas: undefined;
  Perfil: undefined;
  Historial: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function AuthenticatedTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Facturas"
        component={FacturasScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Historial"
        component={HistorialScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" size={size} color={color} />
          ),
        }}
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
              name="ListaGuias"
              component={ListaGuiasScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1e293b' },
                headerTintColor: '#fff',
                headerTitle: 'Guías Vinculadas',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 18,
                },
              }}
            />

            <Stack.Screen
              name="SeleccionarGuia"
              component={SeleccionarGuiaScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1e293b' },
                headerTintColor: '#fff',
                headerTitle: 'Seleccionar Guía',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 18,
                },
              }}
            />

            <Stack.Screen
              name="DetalleGuia"
              component={DetalleGuiaScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1e293b' },
                headerTintColor: '#fff',
                headerTitle: 'Detalle de Guía',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 18,
                },
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
