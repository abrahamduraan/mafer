"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Send,
  Lock,
  Globe,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Flourish } from "./SVGIcons";
import { supabase, type Message } from "@/lib/supabase";

// =====================================================================
// MESSAGE WALL — mensajes para Mafer persistidos en Supabase.
// Lectura en tiempo real (suscripción INSERT), subida de fotos al
// bucket "message-photos" y privacidad público / solo Mafer.
// =====================================================================

type Privacy = "public" | "private";

const MAX_CHARS = 500;
const MAX_BYTES = 5 * 1024 * 1024;
const COMPRESS_THRESHOLD = 1024 * 1024;
const MAX_WIDTH = 1200;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Variantes de papel: crema, rose-100, champagne
const PAPERS = [
  { bg: "linear-gradient(180deg,#FFF7EE,#FBEFE2)", border: "#EAD9C2" },
  { bg: "linear-gradient(180deg,#FFF0F4,#FDE2E8)", border: "#F3C3D0" },
  { bg: "linear-gradient(180deg,#FBF1DF,#F5E6D3)", border: "#E4CFA8" },
];

// --- Relative time in English ("2 hours ago") ---
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (!Number.isFinite(then)) return "";
  const sec = Math.max(0, Math.floor(diff / 1000));
  const units: [number, string, string][] = [
    [60, "second", "seconds"],
    [60, "minute", "minutes"],
    [24, "hour", "hours"],
    [30, "day", "days"],
    [12, "month", "months"],
    [Infinity, "year", "years"],
  ];
  let value = sec;
  let i = 0;
  if (value < 60) return "a few seconds ago";
  for (; i < units.length; i++) {
    const [size, sing, plur] = units[i];
    if (value < size) {
      const v = Math.floor(value);
      return `${v} ${v === 1 ? sing : plur} ago`;
    }
    value = value / size;
  }
  return "a moment ago";
}

// --- Comprime una imagen con canvas a MAX_WIDTH de ancho ---
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      "image/jpeg",
      0.85,
    );
  });
}

export default function MessageWall() {
  const { isMafer, isAdmin } = useAuth();
  const canSeePrivate = isMafer;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Lectura inicial (estado manual, sin realtime) ---
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: fetchErr } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchErr) console.error("Error cargando mensajes:", fetchErr);
      if (active) {
        setMessages((data as Message[]) ?? []);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // Limpia object URL del preview al cambiar / desmontar
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  // Bloquea el scroll del body mientras el lightbox de foto está abierto.
  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setError("Invalid format. Use JPG, PNG, WEBP or GIF.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("The image exceeds 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedNombre = nombre.trim();
    const trimmedMensaje = mensaje.trim();
    if (!trimmedNombre || !trimmedMensaje) {
      setError("Write your name and a message.");
      return;
    }

    setSending(true);
    try {
      let foto_url: string | null = null;

      if (file) {
        let body: Blob = file;
        let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        if (file.size > COMPRESS_THRESHOLD) {
          body = await compress(file);
          ext = "jpg";
        }
        const path = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("message-photos")
          .upload(path, body, { contentType: body.type || "image/jpeg" });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage
          .from("message-photos")
          .getPublicUrl(path);
        foto_url = pub.publicUrl;
      }

      const { data, error: insErr } = await supabase
        .from("messages")
        .insert([
          {
            nombre: trimmedNombre,
            mensaje: trimmedMensaje,
            foto_url,
            privacy,
          },
        ])
        .select()
        .single();
      if (insErr) {
        console.error("Error creando mensaje:", insErr);
        throw insErr;
      }

      // Prepend manual al estado (sin realtime)
      if (data) {
        setMessages((prev) => [data as Message, ...prev]);
      }

      setNombre("");
      setMensaje("");
      setPrivacy("public");
      clearFile();
      showToast("Your message arrived");
    } catch (err) {
      console.error("Error en submit:", err);
      setError("Your message couldn't be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // --- Eliminar mensaje (solo admin, estado manual sin realtime) ---
  const handleDelete = async (msg: Message) => {
    if (!isAdmin) return;

    // 1. Eliminar foto del storage si existe
    if (msg.foto_url) {
      const path = msg.foto_url.split("/message-photos/")[1];
      if (path) {
        const { error: storageErr } = await supabase.storage
          .from("message-photos")
          .remove([path]);
        if (storageErr) console.error("Error eliminando foto:", storageErr);
      }
    }

    // 2. Eliminar el row de la tabla
    const { error: delErr } = await supabase
      .from("messages")
      .delete()
      .eq("id", msg.id);

    if (delErr) {
      console.error("Error eliminando:", delErr);
      showToast("Couldn't delete the message", "error");
      return;
    }

    // 3. Actualizar estado local manualmente (sin realtime)
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    showToast("Message deleted");
  };

  return (
    <section className="relative w-full px-5 py-16 sm:py-24">
      {/* Toast: entra deslizando desde la derecha con acento lateral */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 48 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed right-4 top-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border bg-white/90 py-3 pl-4 pr-5 font-body text-sm text-rose-700 shadow-lg backdrop-blur ${
              toast.type === "error" ? "border-rose-300" : "border-rose-200"
            }`}
            style={{ borderLeft: "3px solid #e8829f" }}
          >
            {toast.type === "error" ? (
              <AlertCircle size={16} strokeWidth={2} className="text-rose-500" />
            ) : (
              <Check size={16} strokeWidth={2} className="text-rose-500" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-12 flex flex-col items-center">
        <h2 className="font-display text-4xl italic text-rose-900 tracking-editorial sm:text-5xl">
          Leave a message for Mafer
        </h2>
        <Flourish width={140} className="mt-4 text-gold-soft/70" />
      </div>

      {/* --- Formulario --- */}
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto mb-16 max-w-md rounded-2xl border border-rose-200 bg-white/70 p-7 backdrop-blur-sm"
        style={{ boxShadow: "0 18px 40px -16px rgba(192,72,112,0.25)" }}
      >
        {/* Nombre — línea inferior que se expande al enfocar */}
        <div className="group relative mb-6">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="peer w-full border-0 border-b border-rose-200 bg-transparent px-1 py-2 font-body text-rose-900 outline-none"
            placeholder="Your name"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-rose-400 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100" />
        </div>

        {/* Mensaje + contador */}
        <div className="group relative">
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value.slice(0, MAX_CHARS))}
            rows={3}
            maxLength={MAX_CHARS}
            className="peer w-full resize-none border-0 border-b border-rose-200 bg-transparent px-1 py-2 font-body text-rose-900 outline-none"
            placeholder="Write your message"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-rose-400 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:scale-x-100" />
        </div>
        <p className="mb-5 mt-1 text-right font-body text-xs font-light text-rose-300">
          {mensaje.length}/{MAX_CHARS}
        </p>

        {/* Dropzone foto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onPickFile}
          className="hidden"
        />
        {preview ? (
          <div className="mb-5 flex items-center gap-3">
            <div className="group relative h-[100px] w-[100px] overflow-hidden rounded-xl border border-rose-200 sm:h-[120px] sm:w-[120px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-5 flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rose-300 bg-rose-50/40 px-4 py-6 font-body text-sm font-light text-rose-400 transition hover:bg-rose-50"
          >
            <ImagePlus size={22} strokeWidth={1.5} />
            Add a photo (optional)
          </button>
        )}

        {/* Privacidad — pills */}
        <div className="mb-6 flex gap-3">
          {(
            [
              { value: "public", label: "Everyone can see it", Icon: Globe },
              { value: "private", label: "Only Mafer", Icon: Lock },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPrivacy(opt.value)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2 font-body text-sm font-light transition-colors duration-300 ${
                privacy === opt.value
                  ? "border-rose-400 bg-rose-100 text-rose-600"
                  : "border-rose-200 bg-transparent text-rose-400 hover:bg-rose-50"
              }`}
            >
              <opt.Icon size={15} strokeWidth={1.5} />
              {opt.label}
            </button>
          ))}
        </div>

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

        <motion.button
          type="submit"
          disabled={sending}
          whileHover={{ scale: sending ? 1 : 1.03 }}
          whileTap={{ scale: sending ? 1 : 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-400 bg-rose-100 px-6 py-3 font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-200 disabled:opacity-70"
        >
          {sending ? (
            <>
              <Loader2 size={17} strokeWidth={1.5} className="animate-spin" />
              Sending with love...
            </>
          ) : (
            <>
              <Send size={17} strokeWidth={1.5} />
              Send message
            </>
          )}
        </motion.button>
      </form>

      {/* --- Muro de mini-cartas --- */}
      {loading ? (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="relative h-40 w-full max-w-xs overflow-hidden rounded-md border border-rose-100 bg-rose-50/50"
            >
              <div className="shimmer absolute inset-0" />
            </div>
          ))}
        </div>
      ) : messages.length === 0 ? (
        <p className="text-center font-body italic font-light text-rose-400/80">
          No messages yet. Be the first to write.
        </p>
      ) : (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
          {messages.map((msg, i) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              index={i}
              canRead={msg.privacy === "public" || canSeePrivate}
              isPrivateForMafer={msg.privacy === "private" && canSeePrivate}
              onZoom={setLightbox}
              canDelete={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Lightbox de foto */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 p-4 backdrop-blur-md sm:p-6"
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm transition-transform hover:scale-110"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
            <motion.img
              src={lightbox}
              alt="Message photo"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

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

// --- Wrapper con animación de entrada por scroll ---
function MessageItem({
  msg,
  index,
  canRead,
  isPrivateForMafer,
  onZoom,
  canDelete,
  onDelete,
}: {
  msg: Message;
  index: number;
  canRead: boolean;
  isPrivateForMafer: boolean;
  onZoom: (url: string) => void;
  canDelete: boolean;
  onDelete: (msg: Message) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: Math.min(index * 0.05, 0.4),
        duration: 0.6,
        ease: "easeOut",
      }}
    >
      <MessageCard
        msg={msg}
        canRead={canRead}
        isPrivateForMafer={isPrivateForMafer}
        onZoom={onZoom}
        canDelete={canDelete}
        onDelete={onDelete}
      />
    </motion.div>
  );
}

// --- Mini-carta: sobre cerrado que se abre y revela la nota ---
function MessageCard({
  msg,
  canRead,
  isPrivateForMafer,
  onZoom,
  canDelete,
  onDelete,
}: {
  msg: Message;
  canRead: boolean;
  isPrivateForMafer: boolean;
  onZoom: (url: string) => void;
  canDelete: boolean;
  onDelete: (msg: Message) => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // Papel y rotación deterministas a partir del id
  const seed = hash(msg.id);
  const paper = PAPERS[seed % PAPERS.length] ?? PAPERS[0];
  const initial = msg.nombre?.charAt(0)?.toUpperCase() ?? "?";
  const rotate = (seed % 5) - 2;

  // Mensaje privado bloqueado para no-Mafer: sobre cerrado con sello.
  if (!canRead) {
    return (
      <div
        className="relative mx-auto w-full max-w-xs select-none"
        style={{ rotate: `${rotate}deg` }}
      >
        <ClosedEnvelope initial={initial} paper={PAPERS[2]} locked />
        <p className="mt-3 flex items-center justify-center gap-1.5 font-body text-xs font-light tracking-wide text-rose-400">
          <ChainPadlock size={15} />
          Private message for Mafer
        </p>
      </div>
    );
  }

  return (
    <div
      className="group relative mx-auto w-full max-w-xs [perspective:1200px]"
      style={{ rotate: `${rotate}deg` }}
    >
      {canDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(true);
          }}
          aria-label="Delete message"
          className="absolute -right-2 -top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-rose-500 opacity-80 shadow backdrop-blur-sm transition hover:bg-white hover:text-rose-600 hover:opacity-100"
        >
          <Trash2 size={16} strokeWidth={1.6} />
        </button>
      )}

      {/* Confirmación inline de borrado */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(false);
            }}
            className="absolute inset-0 z-30 flex items-center justify-center rounded-md bg-rose-950/30 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[220px] rounded-xl border border-rose-200 bg-white/95 p-4 text-center shadow-xl backdrop-blur"
            >
              <p className="mb-4 font-body text-sm text-rose-800">
                Delete this message?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirming(false);
                  }}
                  className="flex-1 rounded-full border border-rose-200 bg-transparent px-3 py-2.5 font-body text-sm font-light text-rose-500 transition hover:bg-rose-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirming(false);
                    onDelete(msg);
                  }}
                  className="flex-1 rounded-full border border-rose-600 bg-rose-600 px-3 py-2.5 font-body text-sm font-light text-white transition hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="block w-full cursor-pointer text-left"
      >
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div
            key="closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ClosedEnvelope initial={initial} paper={paper} />
            <p className="mt-3 text-center font-body text-sm font-light tracking-wide text-rose-400">
              From {msg.nombre}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, rotateX: -25, y: -8 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-md p-5"
            style={{ background: paper.bg, border: `1px solid ${paper.border}` }}
          >
            {/* borde decorativo interno */}
            <div
              className="pointer-events-none absolute inset-2 rounded-sm"
              style={{ border: "1px dashed rgba(212,175,127,0.6)" }}
            />
            {/* sello con inicial */}
            <span
              className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full font-display text-lg italic text-white"
              style={{
                background:
                  "radial-gradient(circle at 38% 34%, #E8829F, #C04870)",
              }}
            >
              {initial}
            </span>
            <div className="relative flex items-center gap-2">
              <p className="font-display text-base italic text-rose-900">
                {msg.nombre}
              </p>
              {isPrivateForMafer && (
                <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-body text-[10px] font-light uppercase tracking-wide text-rose-500">
                  <Lock size={10} strokeWidth={1.6} />
                  private
                </span>
              )}
            </div>
            <p className="relative mt-2 whitespace-pre-wrap break-words font-display text-[15px] text-[#5f4636] sm:text-base">
              {msg.mensaje}
            </p>
            {msg.foto_url && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoom(msg.foto_url!);
                }}
                className="relative mt-3 block w-full overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={msg.foto_url}
                  alt={`Photo from ${msg.nombre}`}
                  loading="lazy"
                  className="max-h-40 w-full object-cover sm:max-h-[200px]"
                />
              </button>
            )}
            <p className="relative mt-3 font-body text-xs font-light text-rose-300">
              {relativeTime(msg.created_at)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </button>
    </div>
  );
}

// Hash determinista simple a partir del id (para papel + rotación)
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// --- Sobre cerrado con solapa, cordón y sello de inicial ---
function ClosedEnvelope({
  initial,
  paper,
  locked,
}: {
  initial: string;
  paper: { bg: string; border: string };
  locked?: boolean;
}) {
  return (
    <div
      className="relative mx-auto h-40 w-full overflow-hidden rounded-md transition-transform duration-300 group-hover:scale-105"
      style={{
        background: paper.bg,
        border: `1px solid ${paper.border}`,
        boxShadow: "0 14px 30px -14px rgba(107,30,58,0.3)",
      }}
    >
      {/* cuerpo del sobre: líneas en V */}
      <div
        className="absolute inset-x-0 bottom-0 top-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 38%, rgba(192,72,112,0.06) 38%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 160"
        preserveAspectRatio="none"
        fill="none"
        stroke="rgba(192,72,112,0.18)"
        strokeWidth="1.2"
      >
        {/* solapa superior */}
        <path d="M0 6 L100 78 L200 6" />
        {/* pliegues inferiores */}
        <path d="M0 154 L92 86 M200 154 L108 86" />
      </svg>

      {/* cordón decorativo dorado */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gold-soft/30" />

      {/* sello con inicial */}
      <span
        className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-xl italic text-white shadow-md"
        style={{
          background: "radial-gradient(circle at 38% 34%, #E8829F, #C04870)",
        }}
      >
        {locked ? <ChainPadlock size={20} className="text-white" /> : initial}
      </span>
    </div>
  );
}

// --- Candado fino con cadena delicada (para mensajes privados) ---
function ChainPadlock({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* eslabones de cadena delicada */}
      <circle cx="5" cy="5" r="1.5" opacity="0.7" />
      <circle cx="9" cy="3.4" r="1.5" opacity="0.7" />
      <circle cx="13" cy="3.4" r="1.5" opacity="0.7" />
      <circle cx="17.5" cy="5.2" r="1.5" opacity="0.7" />
      {/* arco del candado */}
      <path d="M9 14v-2.2a3 3 0 0 1 6 0V14" />
      {/* cuerpo */}
      <rect x="7.5" y="14" width="9" height="7" rx="1.8" />
      {/* ojo de la cerradura */}
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
      <path d="M12 18v1.4" />
    </svg>
  );
}
