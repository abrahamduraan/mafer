"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getRole, saveAuth, clearAuth, type Role } from "@/lib/auth";

// =====================================================================
// Contexto de autenticación compartido por todo el sitio.
// Permite que el botón de soplar las velas (Cake) sepa si Mafer
// inició sesión, y abrir el modal de login desde cualquier lado.
//  - Mafer y Abraham (admin) ven todo el contenido privado.
//  - Solo Abraham (admin) puede eliminar mensajes.
// =====================================================================

interface AuthContextValue {
  /** Rol activo, o null si nadie inició sesión */
  role: Role | null;
  /** true si Mafer o el admin ven todo (contenido privado incluido) */
  isMafer: boolean;
  /** true solo para el admin (puede eliminar mensajes) */
  isAdmin: boolean;
  /** true mientras el modal de login está visible */
  isLoginOpen: boolean;
  /** Valida el rol recibido y lo persiste */
  login: (role: Role) => void;
  /** Cierra la sesión */
  logout: () => void;
  /** Abre / cierra el modal de login */
  openLogin: () => void;
  closeLogin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Al montar (solo cliente), recuperamos el rol guardado en localStorage.
  // Se hace en un efecto para evitar mismatch de hidratación SSR/cliente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única desde localStorage al montar
    setRole(getRole());
  }, []);

  const login = (r: Role) => {
    saveAuth(r);
    setRole(r);
    setIsLoginOpen(false);
  };

  const logout = () => {
    clearAuth();
    setRole(null);
  };

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  // Tanto Mafer como el admin ven todo el contenido privado.
  const isMafer = role === "mafer" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        role,
        isMafer,
        isAdmin,
        isLoginOpen,
        login,
        logout,
        openLogin,
        closeLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
