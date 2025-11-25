// src/navigation/AppNavigator.tsx - SOLO ESTILOS
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
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#A3A3A3',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E5E5',
                },
                headerTintColor: '#2563EB',
                headerTitle: 'Guías',
                headerTitleStyle: {
                  fontWeight: '500',
                  fontSize: 18,
                  color: '#0A0A0A',
                },
              }}
            />

            <Stack.Screen
              name="SeleccionarGuia"
              component={SeleccionarGuiaScreen}
              options={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E5E5',
                },
                headerTintColor: '#2563EB',
                headerTitle: 'Buscar guía',
                headerTitleStyle: {
                  fontWeight: '500',
                  fontSize: 18,
                  color: '#0A0A0A',
                },
              }}
            />

            <Stack.Screen
              name="DetalleGuia"
              component={DetalleGuiaScreen}
              options={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#FFFFFF',
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E5E5',
                },
                headerTintColor: '#2563EB',
                headerTitle: 'Detalle de guía',
                headerTitleStyle: {
                  fontWeight: '500',
                  fontSize: 18,
                  color: '#0A0A0A',
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
