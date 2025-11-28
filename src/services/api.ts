import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiResponse,
  LoginResponse,
  FormDataResponse,
  FacturaAsignada,
  GuiaDisponible,
} from '../types';

const API_URL = 'http://10.0.2.2:3000'; // Para emulador Android

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('sivec_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.multiRemove(['sivec_token', 'sivec_user']);
      console.log('❌ Token inválido, limpiando storage');
    }
    return Promise.reject(error);
  },
);

// ==========================================
// SERVICIOS DE AUTENTICACIÓN
// ==========================================

export const authApi = {
  login: (credentials: { loginInput: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', credentials),

  verificarToken: () =>
    api.post<ApiResponse<{ usuario: any; token_valido: boolean }>>(
      '/auth/verificar',
    ),

  logout: () => api.post<ApiResponse<any>>('/auth/logout'),

  cambiarPassword: (data: {
    password_actual: string;
    password_nuevo: string;
  }) => api.post<ApiResponse<any>>('/auth/cambiar-password', data),
};

// ==========================================
// SERVICIOS DE PILOTOS
// ==========================================

export const pilotosApi = {
  obtenerTodos: () => api.get<ApiResponse<any[]>>('/api/pilotos'),

  buscar: (termino: string) =>
    api.get<ApiResponse<any[]>>(`/api/pilotos/buscar?q=${termino}`),

  validar: (nombre_piloto: string) =>
    api.post<ApiResponse<{ nombre_piloto: string; existe: boolean }>>(
      '/api/pilotos/validar',
      {
        nombre_piloto,
      },
    ),
};

// ==========================================
// SERVICIOS DE VEHÍCULOS
// ==========================================

export const vehiculosApi = {
  obtenerPorSucursal: (sucursal_id: number) =>
    api.get<ApiResponse<any[]>>(`/api/vehiculos/sucursal/${sucursal_id}`),

  obtenerTodos: (filtros?: { agrupacion?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.agrupacion) params.append('agrupacion', filtros.agrupacion);

    return api.get<ApiResponse<any[]>>(`/api/vehiculos?${params.toString()}`);
  },
};

// ==========================================
// SERVICIOS DE USUARIOS
// ==========================================

export const usuariosApi = {
  obtenerTodos: (filtros?: { rol_id?: number }) => {
    const params = new URLSearchParams();
    if (filtros?.rol_id) params.append('rol_id', filtros.rol_id.toString());

    return api.get<ApiResponse<any[]>>(`/api/usuarios?${params.toString()}`);
  },

  obtenerPilotos: () =>
    api.get<ApiResponse<any[]>>('/api/usuarios/roles/pilotos'),

  obtenerJefes: () =>
    api.get<ApiResponse<any[]>>('/api/usuarios/roles/jefes-yarda'),
};

// ==========================================
// SERVICIOS DE FACTURAS
// ==========================================

export const facturasApi = {
  // Obtener facturas asignadas a un piloto específico
  obtenerFacturasPiloto: (piloto: string) =>
    api.get<ApiResponse<FacturaAsignada[]>>(
      `/api/facturas?piloto=${piloto}&estado_id=1`,
    ),

  obtenerFacturasConGuiasDisponibles: (piloto_id: number) =>
    api.get<ApiResponse<any[]>>(
      `/api/facturas/piloto/${piloto_id}/con-guias-disponibles`,
    ),

  // ✨ NUEVO: Guías ya vinculadas
  obtenerFacturasConGuiasVinculadas: (piloto_id: number) =>
    api.get<ApiResponse<any[]>>(
      `/api/facturas/piloto/${piloto_id}/con-guias-vinculadas`,
    ),

  // Obtener guías disponibles para una factura específica
  obtenerGuiasDisponibles: (numero_factura: string, piloto: string) =>
    api.get<ApiResponse<GuiaDisponible[]>>(
      `/api/facturas/${numero_factura}/guias-disponibles?piloto=${piloto}`,
    ),

  // ✨ NUEVO: Obtener facturas con sus guías
  obtenerFacturasConGuias: (piloto_id: number) =>
    api.get<ApiResponse<any[]>>(`/api/facturas/piloto/${piloto_id}/con-guias`),

  // ✨ NUEVO: Buscar guía para una factura
  buscarGuiasDisponiblesParaFactura: (numero_factura: string, piloto: string) =>
    api.get<ApiResponse<any[]>>(
      `/api/facturas/${numero_factura}/guias-disponibles?piloto=${piloto}`,
    ),

  // Crear viaje con las facturas seleccionadas
  crearViaje: (datos: {
    facturas: Array<{
      numero_factura: string;
      numero_guia: string;
    }>;
    piloto: string;
  }) => api.post<ApiResponse<any>>('/api/viajes', datos),

  // Obtener datos para formularios (pilotos y vehículos)
  obtenerDatosFormulario: () =>
    api.get<ApiResponse<FormDataResponse>>('/api/facturas/form-data'),

  // Asignar factura (para jefes)
  asignarFactura: (data: {
    numero_factura: string;
    piloto: string;
    numero_vehiculo: string;
    fecha_asignacion?: string;
    notas_jefe?: string;
  }) => api.post<ApiResponse<FacturaAsignada>>('/api/facturas', data),

  // Obtener estadísticas
  obtenerEstadisticas: (filtros?: {
    fecha_desde?: string;
    fecha_hasta?: string;
  }) => {
    const params = new URLSearchParams();
    if (filtros?.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

    return api.get<ApiResponse<any>>(
      `/api/facturas/reportes/estadisticas?${params.toString()}`,
    );
  },
};

// ==========================================
// ✨ NUEVO: SERVICIOS DE GUÍAS
// ==========================================

export const guiasApi = {
  // ✨ NUEVO: Crear guía (vincular a factura)
  crearGuia: (data: {
    numero_guia: string;
    numero_factura: string;
    detalle_producto?: string;
    direccion?: string;
    fecha_emision?: string;
  }) => api.post<ApiResponse<any>>('/api/guias', data),

  // Actualizar estado de guía
  actualizarEstadoGuia: (guia_id: number, estado_id: number) =>
    api.patch<ApiResponse<any>>(`/api/guias/${guia_id}/estado`, { estado_id }),
};

export const viajesApi = {
  obtenerTodos: (params?: any) =>
    api.get<ApiResponse<any[]>>('/api/viajes', { params }),

  // ✨ NUEVO
  obtenerHistorial: (params?: {
    fecha_desde?: string;
    fecha_hasta?: string;
    piloto?: string;
    numero_vehiculo?: string;
  }) => api.get<ApiResponse<any[]>>('/api/viajes/historial', { params }),

  obtenerViajesPiloto: (piloto_id: number) =>
    api.get(`/api/viajes/piloto/${piloto_id}`),
};

// ==========================================
// FUNCIÓN PARA HEALTH CHECK
// ==========================================

export const healthCheck = () => api.get('/health');

export default api;
