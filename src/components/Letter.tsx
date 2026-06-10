"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Edit,
  Save,
  X,
  Pencil,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Flourish } from "./SVGIcons";
import { supabase } from "@/lib/supabase";

// =====================================================================
// LETTER — sobre que se abre con animación premium y carta íntima en
// papel crema texturizado, con sello de cera y firma que se dibuja.
// El contenido vive en Supabase (tabla letter_content, id = 1) y solo
// el admin (Abraham) puede editarlo en línea.
// =====================================================================

const LETTER_ID = 1;

const DEFAULT_LETTER = `Beautiful Mafer,

Twenty-seven years today. How lovely to get to celebrate that.

You have a way of making people feel comfortable without trying. You listen well, you're intense when it matters and gentle when it counts, and you laugh louder than anyone else in the room.

There's something about the way you move through the world that's hard to describe. You sing with your whole chest, you mean what you say, and you bring this strange kind of warmth wherever you go. The kind that makes ordinary afternoons feel like something worth remembering.

May this next chapter be generous with you. May good things find you without you having to chase them. May the right people show up at the right time and the wrong ones leave quickly and quietly. May the work you do feel meaningful, may the rest you take feel earned, and may every small thing you've been hoping for slowly start to arrive.

May you keep choosing yourself. May you keep singing with that same joy, laughing way too loud, and loving people without fear. May the universe hear you clearly when you blow out the candles tonight.

Happy birthday, Mafer.`;

export default function Letter() {
  const { isAdmin } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [opened, setOpened] = useState(false);
  const [content, setContent] = useState<string>(DEFAULT_LETTER);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Carga inicial desde Supabase (crea la row default si no existe) ---
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: fetchErr } = await supabase
        .from("letter_content")
        .select("*")
        .eq("id", LETTER_ID)
        .single();

      if (fetchErr || !data) {
        // Sin row todavía: sembramos el texto por defecto.
        await supabase
          .from("letter_content")
          .insert([{ id: LETTER_ID, content: DEFAULT_LETTER }]);
        if (active) {
          setContent(DEFAULT_LETTER);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setContent(data.content ?? DEFAULT_LETTER);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Anima la apertura del sobre una vez que entra en viewport y ya cargó.
  useEffect(() => {
    if (!inView || loading) return;
    const t = setTimeout(() => setOpened(true), 600);
    return () => clearTimeout(t);
  }, [inView, loading]);

  // Auto-grow del textarea según el contenido editado.
  useEffect(() => {
    if (!isEditing) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draftContent, isEditing]);

  function handleEdit() {
    setDraftContent(content);
    setIsEditing(true);
    setError(null);
  }

  function handleCancel() {
    setDraftContent(content);
    setIsEditing(false);
    setError(null);
  }

  async function handleSave() {
    const trimmed = draftContent.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);

    const { error: saveErr } = await supabase
      .from("letter_content")
      .upsert({
        id: LETTER_ID,
        content: trimmed,
        updated_at: new Date().toISOString(),
      });

    if (saveErr) {
      setError("No se pudo guardar la carta");
      setSaving(false);
      return;
    }

    setContent(trimmed);
    setIsEditing(false);
    setSaving(false);
    showToast("Carta actualizada");
  }

  // Texto seguro a renderizar: defensa contra null/undefined.
  const safeContent = content || DEFAULT_LETTER;
  const paragraphs = safeContent.split("\n\n");

  return (
    <section ref={ref} className="relative w-full px-5 py-16 sm:py-24">
      {/* Toast de éxito (mismo estilo que el MessageWall) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 48 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 top-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-rose-200 bg-white/90 py-3 pl-4 pr-5 font-body text-sm text-rose-700 shadow-lg backdrop-blur"
            style={{ borderLeft: "3px solid #e8829f" }}
          >
            <Check size={16} strokeWidth={2} className="text-rose-500" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-14 flex flex-col items-center">
        <h2 className="font-display text-4xl italic text-rose-900 tracking-editorial sm:text-5xl">
          A letter for you
        </h2>
        <Flourish width={140} className="mt-4 text-gold-soft/70" />
      </div>

      <div className="relative mx-auto max-w-xl" style={{ perspective: "1400px" }}>
        {/* --- Carta --- */}
        <motion.div
          className="relative z-10 mx-auto w-full overflow-hidden rounded-md p-8 sm:p-11"
          style={{
            background: "linear-gradient(180deg, #FFF7EE, #FBEFE2)",
            border: "1px solid #EAD9C2",
            boxShadow: "0 24px 50px -18px rgba(107,30,58,0.3)",
          }}
          initial={{ y: 70, opacity: 0, scale: 0.96 }}
          animate={
            opened
              ? { y: 0, opacity: 1, scale: 1 }
              : { y: 70, opacity: 0, scale: 0.96 }
          }
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          {/* Manchas sutiles de tiempo */}
          <PaperStains />

          {/* Botón flotante de edición (solo admin, modo lectura) */}
          {isAdmin && !isEditing && !loading && (
            <button
              type="button"
              onClick={handleEdit}
              aria-label="Editar carta"
              className="absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-white/70 text-rose-500 opacity-60 shadow-sm backdrop-blur-sm transition hover:bg-white hover:opacity-100 sm:h-9 sm:w-9"
            >
              <Edit size={17} strokeWidth={1.6} />
            </button>
          )}

          {/* Badge "Editando" (solo admin, modo edición) */}
          {isEditing && (
            <span className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 font-body text-[11px] font-light uppercase tracking-wide text-rose-500">
              <Pencil size={12} strokeWidth={1.6} />
              Editando
            </span>
          )}

          <div className="relative z-10 font-display text-[#5f4636]">
            {loading ? (
              <LetterSkeleton />
            ) : isEditing ? (
              // --- MODO EDICIÓN ---
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="pt-6"
              >
                {/* Error inline */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 flex items-center gap-2 font-body text-sm font-light text-rose-600"
                    >
                      <AlertCircle size={15} strokeWidth={1.5} />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <textarea
                  ref={textareaRef}
                  value={draftContent}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setDraftContent(e.target.value)
                  }
                  placeholder="Escribe tu carta para Mafer..."
                  className="w-full resize-none rounded-md border border-rose-200/80 bg-white/40 p-4 font-display text-base italic leading-[1.85] text-rose-900 outline-none transition focus:border-rose-300 focus:bg-white/60 sm:text-xl"
                  style={{ minHeight: 500 }}
                />

                {/* Contador de caracteres */}
                <p className="mt-1 text-right font-body text-xs font-light text-rose-400">
                  {draftContent.length} caracteres
                </p>

                {/* Botones Guardar / Cancelar */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !draftContent.trim()}
                    whileHover={{ scale: saving ? 1 : 1.03 }}
                    whileTap={{ scale: saving ? 1 : 0.97 }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-400 bg-rose-100 px-6 py-3 font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-200 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          strokeWidth={1.5}
                          className="animate-spin"
                        />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={17} strokeWidth={1.5} />
                        Guardar cambios
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.03 }}
                    whileTap={{ scale: saving ? 1 : 0.97 }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-transparent px-6 py-3 font-body text-base font-light tracking-wide text-rose-500 transition-colors duration-300 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <X size={17} strokeWidth={1.5} />
                    Cancelar
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              // --- MODO LECTURA ---
              <motion.div
                key="reading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {paragraphs.map((p, i) => {
                  const isFirst = i === 0;
                  const lines = p.split("\n");
                  return (
                    <motion.p
                      key={i}
                      className={`mb-4 leading-[1.85] ${
                        isFirst ? "text-2xl italic" : "text-base sm:text-xl"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={opened ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 1 + i * 0.25, duration: 0.7 }}
                    >
                      {lines.map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < lines.length - 1 && <br />}
                        </span>
                      ))}
                    </motion.p>
                  );
                })}

                {/* Firma con flourish que se dibuja */}
                <motion.div
                  className="mt-2 flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={opened ? { opacity: 1 } : {}}
                  transition={{ delay: 1 + paragraphs.length * 0.25 }}
                >
                  <svg width="170" height="60" viewBox="0 0 170 60" fill="none">
                    <motion.path
                      d="M8 40 C20 10 34 10 40 34 C44 50 52 18 64 30 C74 40 84 8 100 30 C112 46 128 16 150 26 C158 30 162 36 162 40"
                      stroke="#C04870"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={opened ? { pathLength: 1 } : {}}
                      transition={{
                        delay: 1.2 + paragraphs.length * 0.25,
                        duration: 1.8,
                        ease: "easeInOut",
                      }}
                    />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Sello de cera (oculto en modo edición para no estorbar) */}
          {!isEditing && !loading && (
            <motion.div
              className="absolute -bottom-2 right-8 z-20"
              style={{ filter: "drop-shadow(0 7px 11px rgba(107,30,58,0.38))" }}
              initial={{ scale: 0, rotate: -20 }}
              animate={opened ? { scale: 1, rotate: 0 } : {}}
              transition={{
                delay: 1.6 + paragraphs.length * 0.25,
                type: "spring",
                stiffness: 200,
                damping: 14,
              }}
            >
              <WaxSeal />
            </motion.div>
          )}
        </motion.div>

        {/* --- Sobre: bolsillo frontal + solapa que se abre --- */}
        {/* bolsillo frontal (banda inferior) */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 h-16 rounded-b-md"
          style={{
            background: "linear-gradient(180deg, #F6D9DF, #EFC3CC)",
            clipPath: "polygon(0 100%, 0 30%, 50% 100%, 100% 30%, 100% 100%)",
            boxShadow: "0 12px 24px -10px rgba(107,30,58,0.35)",
          }}
        />
        {/* solapa superior que se abre */}
        <motion.div
          className="absolute inset-x-0 top-0 z-30 origin-top"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateX: 0 }}
          animate={opened ? { rotateX: 180, opacity: 0 } : { rotateX: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <div
            className="relative mx-auto h-20 w-full"
            style={{
              background: "linear-gradient(180deg, #F6D9DF, #E7B2BD)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            }}
          >
            {/* sombra interna que se revela al abrir el flap (look 3D) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(107,30,58,0.18), transparent 55%)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}

// --- Skeleton shimmer mientras carga la carta ---
function LetterSkeleton() {
  const lines = ["85%", "100%", "92%", "70%"];
  return (
    <div className="space-y-4 py-2">
      {lines.map((w, i) => (
        <div
          key={i}
          className="relative h-5 overflow-hidden rounded-full bg-rose-100/60"
          style={{ width: w }}
        >
          <div className="shimmer absolute inset-0" />
        </div>
      ))}
    </div>
  );
}

// --- Sello de cera con "M" grabada ---
function WaxSeal() {
  return (
    <svg width="74" height="74" viewBox="0 0 74 74">
      <defs>
        <radialGradient id="wax" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#E8829F" />
          <stop offset="70%" stopColor="#C04870" />
          <stop offset="100%" stopColor="#962f53" />
        </radialGradient>
      </defs>
      {/* borde irregular de la cera */}
      <path
        d="M37 4c7-1 12 4 18 6s11 3 12 11-3 12-2 19 0 13-6 17-13 2-19 5-11 5-18 3-9-9-14-13-10-7-10-15 5-11 5-18-2-12 3-17 12-1 19-3 7-7 12-7Z"
        fill="url(#wax)"
      />
      <circle cx="37" cy="37" r="24" fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.5" />
      <text
        x="37"
        y="50"
        textAnchor="middle"
        fontSize="34"
        fill="#7a2542"
        style={{ fontFamily: "var(--font-display), serif", fontStyle: "italic", fontWeight: 600 }}
      >
        M
      </text>
      <ellipse cx="29" cy="26" rx="6" ry="4" fill="#ffffff" opacity="0.2" />
    </svg>
  );
}

// --- Manchas sutiles de tiempo en el papel ---
function PaperStains() {
  const stains = [
    { left: "12%", top: "18%", r: 40, o: 0.04 },
    { left: "78%", top: "30%", r: 55, o: 0.035 },
    { left: "30%", top: "70%", r: 48, o: 0.04 },
    { left: "65%", top: "82%", r: 36, o: 0.03 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {stains.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.r,
            height: s.r,
            background: `radial-gradient(circle, rgba(150,90,40,${s.o}), transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}
