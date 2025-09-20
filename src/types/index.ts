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
  estados: {
    estado_id: number;
    codigo: string;
    nombre: string;
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
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}
