export interface Usuario {
  usuario_id: number;
  nombre_usuario: string;
  correo: string;
  rol_id: number;
  sucursal_id: number;
  rol: {
    rol_id: number;
    nombre_rol: string;
    descripcion: string;
  };
  sucursal: {
    sucursal_id: number;
    nombre_sucursal: string;
  };
}

export interface FacturaAsignada {
  factura_id: number;
  numero_factura: string;
  piloto: string;
  numero_vehiculo: string;
  fecha_asignacion: string;
  estado_id: number;
  viaje_id?: number;
  notas_jefe?: string;
  created_at: string;
  updated_at: string;
  estados: {
    estado_id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
  };
  viaje?: {
    viaje_id: number;
    numero_guia: string;
    fecha_viaje: string;
    cliente: string;
    detalle_producto?: string;
    direccion?: string;
  };
  guia_seleccionada?: GuiaDisponible;
}

export interface GuiaDisponible {
  documento: string;
  referencia: string;
  piloto: string;
  detalle_producto: string;
  direccion: string;
  estado: number;
  fecha_emision: string;
  cliente?: string;
}

export interface Vehiculo {
  vehiculo_id: number;
  agrupacion?: string;
  numero_vehiculo: string;
  placa: string;
  sucursal_id: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Piloto {
  nombre_piloto: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

// Tipos para respuestas específicas
export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface FormDataResponse {
  pilotos: Piloto[];
  vehiculos: Vehiculo[];
  sucursal_usuario: number;
}
