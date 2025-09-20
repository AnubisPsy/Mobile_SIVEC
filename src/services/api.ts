import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:3000'; // Para emulador Android

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('sivec_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['sivec_token', 'sivec_user']);
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (credentials: { correo: string; password: string }) =>
    api.post('/auth/login', credentials),

  verificarToken: () => api.post('/auth/verificar'),

  logout: () => api.post('/auth/logout'),
};

export const facturasApi = {
  obtenerFacturasPiloto: (piloto: string) =>
    api.get(`/api/facturas/piloto/${piloto}`),

  obtenerGuiasDisponibles: (numero_factura: string, piloto: string) =>
    api.get(
      `/api/facturas/${numero_factura}/guias-disponibles?piloto=${piloto}`,
    ),

  crearViaje: (datos: any) => api.post('/api/viajes', datos),
};

export default api;
