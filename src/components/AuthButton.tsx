"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "./AuthProvider";

// =====================================================================
// AUTH BUTTON — control flotante discreto (esquina inferior izquierda)
// para iniciar y cerrar sesión sin romper la estética del sitio.
//  • Sin sesión: pétalo con llave → abre el modal de login existente.
//  • Con sesión: muestra quién está dentro y permite cerrar sesión
//    mediante un pequeño popover elegante.
// =====================================================================

export default function AuthButton() {
  const { role, isAdmin, openLogin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  // --- Sin sesión: botón sutil que abre el modal de login ---
  if (!role) {
    return (
      <div className="group pb-safe fixed left-4 z-50">
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full border border-rose-200 bg-white/85 px-3 py-1 font-body text-xs font-light tracking-wide text-rose-600 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          Log in
        </span>
        <button
          onClick={openLogin}
          aria-label="Log in"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-400 bg-white/70 text-rose-600 backdrop-blur-md transition-transform duration-300 hover:scale-105"
        >
          <LogIn size={20} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  // --- Con sesión: identidad + cerrar sesión ---
  const name = isAdmin ? "Abraham" : "Mafer";
  const Icon = isAdmin ? ShieldCheck : Sparkles;

  return (
    <div className="pb-safe fixed left-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="absolute bottom-16 left-0 w-52 rounded-2xl border border-rose-200 bg-white/90 p-3 backdrop-blur-md"
            style={{ boxShadow: "0 18px 40px -16px rgba(192,72,112,0.3)" }}
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <Icon size={15} strokeWidth={1.6} className="text-rose-500" />
              <span className="font-body text-sm font-light text-rose-900">
                Signed in as {name}
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 font-body text-sm font-light text-rose-600 transition-colors duration-300 hover:bg-rose-100"
            >
              <LogOut size={15} strokeWidth={1.6} />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="group relative">
        <span className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full border border-rose-200 bg-white/85 px-3 py-1 font-body text-xs font-light tracking-wide text-rose-600 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          {name}
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Account"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-400 bg-white/70 text-rose-600 backdrop-blur-md transition-transform duration-300 hover:scale-105"
        >
          <Icon size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
