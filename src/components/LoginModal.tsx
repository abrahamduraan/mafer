"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { checkAuth } from "@/lib/auth";
import { launchFireworks } from "@/lib/fireworks";
import { useAuth } from "./AuthProvider";

// =====================================================================
// Modal de login editorial. Se abre cuando alguien intenta soplar las
// velas o acceder a la lectura sin estar autenticada como Mafer.
// =====================================================================

export default function LoginModal() {
  const { isLoginOpen, closeLogin, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const role = checkAuth(username, password);
    if (role) {
      setError(false);
      launchFireworks(6000);
      login(role);
      setUsername("");
      setPassword("");
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <AnimatePresence>
      {isLoginOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: "rgba(107, 30, 58, 0.2)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={closeLogin}
        >
          <motion.div
            className={`relative w-full max-w-sm rounded-3xl border border-rose-200 bg-white p-9 text-center ${
              shake ? "animate-[shake_0.5s]" : ""
            }`}
            style={{ boxShadow: "0 30px 60px -20px rgba(192,72,112,0.4)" }}
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLogin}
              aria-label="Close"
              className="absolute right-4 top-4 text-rose-400 transition-transform hover:scale-110"
            >
              <X size={22} strokeWidth={1.5} />
            </button>

            <h2 className="font-display text-3xl italic text-rose-900">
              Is that you, Mafer?
            </h2>
            <p className="mb-7 mt-2 font-body text-sm font-light tracking-wide text-rose-400">
              Log in to experience your full celebration
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-center font-body text-rose-900 outline-none transition focus:border-rose-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-center font-body text-rose-900 outline-none transition focus:border-rose-400"
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="font-body text-sm font-light text-rose-600"
                  >
                    This celebration is only for Mafer
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-full border border-rose-400 bg-rose-100 px-6 py-3 font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-200"
              >
                It&apos;s me
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
