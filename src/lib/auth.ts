// =====================================================================
// Autenticación simple y hardcodeada.
//  - Mafer: vive su celebración e interactúa con todo (no borra nada).
//  - Abraham (admin): ve todo y puede eliminar cualquier mensaje.
// NO es seguridad real — es un sitio de cumpleaños 💖
// =====================================================================

export type Role = "mafer" | "admin";

export const MAFER_USER = {
  username: "mafer",
  password: "felizCumpleañosParaMi",
} as const;

export const ADMIN_USER = {
  username: "abraham",
  password: "admin321",
} as const;

const STORAGE_KEY = "mafer-auth-role";

/** Devuelve el rol si las credenciales coinciden, o null si no. */
export function checkAuth(username: string, password: string): Role | null {
  const user = username.trim().toLowerCase();
  if (user === MAFER_USER.username && password === MAFER_USER.password) {
    return "mafer";
  }
  if (user === ADMIN_USER.username && password === ADMIN_USER.password) {
    return "admin";
  }
  return null;
}

/** Guarda en localStorage el rol con el que se inició sesión. */
export function saveAuth(role: Role): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, role);
  } catch {
    /* localStorage podría no estar disponible */
  }
}

/** Lee de localStorage el rol guardado (o null). */
export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "mafer" || v === "admin" ? v : null;
  } catch {
    return null;
  }
}

/** Cierra la sesión (por si se quisiera reiniciar). */
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
