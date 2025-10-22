// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // ✅ Agregar import
import { authApi } from '../services/api';
import { Usuario } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null;
  login: (loginInput: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar token al iniciar la app
  useEffect(() => {
    verificarTokenAlmacenado();
  }, []);

  const verificarTokenAlmacenado = async () => {
    try {
      const token = await AsyncStorage.getItem('sivec_token');
      const userData = await AsyncStorage.getItem('sivec_user');

      if (token && userData) {
        const usuario = JSON.parse(userData);

        // ✅ Verificar rol al cargar sesión guardada
        if (usuario.rol_id !== 1) {
          // No es piloto, limpiar sesión
          await AsyncStorage.multiRemove(['sivec_token', 'sivec_user']);
          setLoading(false);
          return;
        }

        // Verificar que el token siga siendo válido
        const response = await authApi.verificarToken();

        if (response.data.success) {
          setUser(usuario);
          setIsAuthenticated(true);
          console.log('✅ Token válido, usuario autenticado');
        } else {
          await logout();
        }
      }
    } catch (error) {
      console.log('❌ Error verificando token:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    loginInput: string,
    password: string,
  ): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('🔐 Intentando login:', loginInput);

      const response = await authApi.login({ loginInput, password });

      if (response.data.success) {
        const { token, usuario } = response.data.data;

        // ✅ VALIDACIÓN: Solo permitir pilotos (rol_id = 1)
        if (usuario.rol_id !== 1) {
          Alert.alert(
            '⚠️ Acceso denegado',
            'Esta aplicación es exclusiva para pilotos.\n\nLos jefes y administradores deben usar el panel web.',
            [{ text: 'Entendido' }],
          );
          return false;
        }

        // Guardar token y datos del usuario
        await AsyncStorage.setItem('sivec_token', token);
        await AsyncStorage.setItem('sivec_user', JSON.stringify(usuario));

        setUser(usuario);
        setIsAuthenticated(true);

        console.log('✅ Login exitoso:', usuario.nombre_usuario);
        return true;
      } else {
        console.log('❌ Login fallido:', response.data.message);
        return false;
      }
    } catch (error: any) {
      console.log(
        '❌ Error en login:',
        error.response?.data?.message || error.message,
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('sivec_token');
      if (token) {
        try {
          await authApi.logout();
        } catch (error) {
          console.log('⚠️ Error en logout del servidor, continuando...');
        }
      }

      await AsyncStorage.multiRemove(['sivec_token', 'sivec_user']);

      setUser(null);
      setIsAuthenticated(false);

      console.log('👋 Logout completado');
    } catch (error) {
      console.log('❌ Error en logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
