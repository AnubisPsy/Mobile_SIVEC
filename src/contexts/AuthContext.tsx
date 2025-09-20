import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null;
  login: (correo: string, password: string) => Promise<boolean>;
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
  const [loading, setLoading] = useState(false);

  const login = async (correo: string, password: string): Promise<boolean> => {
    // Implementación básica por ahora
    setIsAuthenticated(true);
    return true;
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
