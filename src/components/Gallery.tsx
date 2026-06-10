"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  X,
  Edit,
  Save,
  Trash2,
  Plus,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Flourish } from "./SVGIcons";
import { useAuth } from "./AuthProvider";
import { supabase, type GalleryPhoto } from "@/lib/supabase";

// =====================================================================
// GALLERY — fotos estilo polaroid editorial leídas desde Supabase.
// Reveal staggered, washi tape decorativa, lightbox. El admin (Abraham)
// puede reemplazar, editar caption, eliminar y agregar fotos.
// =====================================================================

const MAX_BYTES = 5 * 1024 * 1024;
const COMPRESS_THRESHOLD = 1024 * 1024;
const MAX_WIDTH = 1200;

// Rotación deterministas por índice (look polaroid)
const ROTATIONS = [-4, 3, -2, 4, -3, 2];

// Cintas washi: 3 estilos distintos (rayas, lunares, liso dorado) que se
// alternan; algunas fotos quedan sin cinta para que no se vea repetitivo.
type TapeStyle = { color: string; variant: 0 | 1 | 2 } | null;
const TAPES: TapeStyle[] = [
  { color: "#FBC7D4", variant: 0 },
  null,
  { color: "#F5E6D3", variant: 1 },
  { color: "#D4AF7F", variant: 2 },
  { color: "#FBC7D4", variant: 1 },
  null,
];

// Placeholders mostrados cuando aún no hay fotos reales.
const PLACEHOLDER_CAPTIONS = [
  "Always shining",
  "The prettiest in the room",
  "Pure magic",
  "A smile that lights up the room",
  "Birthday queen",
  "Unforgettable, as always",
];

const PLACEHOLDERS: GalleryPhoto[] = PLACEHOLDER_CAPTIONS.map((caption, i) => ({
  id: `placeholder-${i}`,
  foto_url: `https://picsum.photos/300/300?random=${i + 1}`,
  caption,
  position: i,
  created_at: "",
}));

type Toast = { message: string; type: "success" | "error" } | null;

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
    canvas.toBlob((blob) => resolve(blob ?? file), "image/jpeg", 0.85);
  });
}

async function uploadGalleryPhoto(file: File): Promise<string | null> {
  let body: Blob = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  if (file.size > COMPRESS_THRESHOLD) {
    body = await compress(file);
    ext = "jpg";
  }
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("gallery-photos")
    .upload(filename, body, { contentType: body.type || "image/jpeg" });
  if (error) return null;
  const { data } = supabase.storage.from("gallery-photos").getPublicUrl(filename);
  return data.publicUrl;
}

export default function Gallery() {
  const { isAdmin } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<GalleryPhoto | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Modal de edición: editingId = id real (editar) o "new" (crear)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingNew, setUploadingNew] = useState(false);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("position", { ascending: true });
    if (error) console.error("Error cargando galería:", error);
    setPhotos((data as GalleryPhoto[]) ?? []);
    setLoading(false);
  };

  // Carga inicial (estado manual sin realtime; fetchPhotos se vuelve
  // a llamar tras cada delete/insert/update desde onDone). El setState
  // ocurre tras un await, así que no dispara renders en cascada.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState asíncrono tras fetch
    fetchPhotos();
  }, []);

  // Bloquea el scroll del body mientras hay lightbox o modal abierto
  // (evita el scroll fantasma detrás del overlay en móvil).
  useEffect(() => {
    const open = active !== null || editingId !== null;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active, editingId]);

  const hasReal = photos.length > 0;
  const displayed = hasReal ? photos : PLACEHOLDERS;
  // El admin siempre puede agregar fotos (sin tope), incluso sobre los
  // placeholders cuando la galería aún está vacía.
  const showAddTile = isAdmin;

  const openCreate = () => {
    setUploadingNew(true);
    setEditingId("new");
  };

  const editingPhoto =
    editingId && editingId !== "new"
      ? photos.find((p) => p.id === editingId) ?? null
      : null;

  return (
    <section className="relative w-full px-5 py-16 sm:py-24">
      {/* Badge modo admin */}
      {isAdmin && (
        <div className="absolute left-4 top-5 z-10 flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 font-body text-xs font-light text-rose-900">
          <ShieldCheck size={13} strokeWidth={1.6} />
          Editing with love
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed right-5 top-5 z-[110] flex items-center gap-2 rounded-full border px-5 py-3 font-body text-sm shadow-lg backdrop-blur ${
              toast.type === "success"
                ? "border-rose-300 bg-white/90 text-rose-700"
                : "border-rose-400 bg-rose-50/95 text-rose-700"
            }`}
          >
            {toast.type === "success" ? (
              <Check size={16} strokeWidth={2} className="text-rose-500" />
            ) : (
              <AlertCircle size={16} strokeWidth={2} className="text-rose-500" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-14 flex flex-col items-center">
        <motion.h2
          className="font-display text-4xl italic text-rose-900 tracking-editorial sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Mafer&apos;s Moments
        </motion.h2>
        <Flourish width={140} className="mt-4 text-gold-soft/70" />
      </div>

      <div
        ref={containerRef}
        className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12 md:grid-cols-3"
      >
        {displayed.map((photo, i) => {
          const isPlaceholder = photo.id.startsWith("placeholder-");
          const rotate = ROTATIONS[i % ROTATIONS.length];
          const tape = TAPES[i % TAPES.length];
          return (
            <motion.div
              key={photo.id}
              className="group relative mx-auto"
              style={{ rotate: `${rotate}deg` }}
              initial={{ opacity: 0, y: 50, scale: 0.85 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                delay: i * 0.12,
                type: "spring",
                stiffness: 120,
                damping: 14,
              }}
              whileHover={{ rotate: 0, scale: 1.05, y: -6 }}
            >
              {/* Botón editar (solo admin, solo fotos reales) */}
              {isAdmin && !isPlaceholder && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadingNew(false);
                    setEditingId(photo.id);
                  }}
                  aria-label="Edit photo"
                  className="absolute -right-2 -top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-white/70 text-rose-600 opacity-60 shadow transition hover:bg-white hover:opacity-100"
                >
                  <Edit size={14} strokeWidth={1.6} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setActive(photo)}
                className="relative block cursor-pointer rounded-[3px] bg-[#fffdf9] p-3 pb-5 shadow-[0_18px_40px_-12px_rgba(107,30,58,0.28)] transition-shadow duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:shadow-[0_34px_70px_-12px_rgba(107,30,58,0.45)]"
              >
                {tape && (
                  <WashiTape color={tape.color} variant={tape.variant} flip={i % 2 === 0} />
                )}
                <div className="relative h-[68vw] max-h-64 w-[68vw] max-w-64 overflow-hidden rounded-[2px] sm:h-56 sm:w-56">
                  {photo.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.foto_url}
                      alt={photo.caption ?? "Photo of Mafer"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-[filter] duration-500 group-hover:[filter:saturate(1.12)]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-300">
                      <AlertCircle size={28} strokeWidth={1.4} />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 mix-blend-multiply [background:radial-gradient(circle_at_30%_20%,transparent_60%,rgba(107,30,58,0.06))]" />
                </div>
                <p className="font-script mt-3 text-center text-2xl text-rose-600">
                  {photo.caption}
                </p>
                {/* línea decorativa mini bajo el caption */}
                <Flourish width={54} className="mx-auto mt-1 text-gold-soft/60" />
              </button>
            </motion.div>
          );
        })}

        {/* Polaroid para agregar (solo admin, siempre disponible) */}
        {showAddTile && (
          <motion.button
            type="button"
            onClick={openCreate}
            className="group relative mx-auto flex h-[280px] w-[224px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[3px] border-2 border-dashed border-rose-300 bg-[#fffdf9]/70 p-3 text-rose-400 transition hover:border-rose-400 hover:text-rose-500"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: displayed.length * 0.12, duration: 0.5 }}
            whileHover={{ scale: 1.04 }}
          >
            <Plus size={40} strokeWidth={1.4} />
            <span className="font-body text-sm font-light tracking-wide">
              Add photo
            </span>
          </motion.button>
        )}
      </div>

      {/* --- Lightbox --- */}
      <AnimatePresence>
        {active && active.foto_url && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 backdrop-blur-2xl"
            style={{ background: "rgba(107,30,58,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm transition-transform hover:scale-110"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
            <motion.div
              className="rounded-md bg-[#fffdf9] p-3 pb-6 sm:p-4 sm:pb-7"
              style={{ boxShadow: "0 30px 60px rgba(107,30,58,0.5)" }}
              initial={{ scale: 0.7, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 30 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[62vh] max-h-[440px] w-[86vw] max-w-[420px] overflow-hidden rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.foto_url}
                  alt={active.caption ?? "Photo of Mafer"}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="font-script mt-3 text-center text-3xl text-rose-600">
                {active.caption}
              </p>
              <Flourish width={70} className="mx-auto mt-1 text-gold-soft/60" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modal de edición / creación (solo admin) --- */}
      <AnimatePresence>
        {isAdmin && editingId && (
          <EditModal
            mode={uploadingNew ? "create" : "edit"}
            photo={editingPhoto}
            existingCount={photos.length}
            maxPosition={photos.reduce((m, p) => Math.max(m, p.position), -1)}
            onClose={() => {
              setEditingId(null);
              setUploadingNew(false);
            }}
            onDone={(message) => {
              setEditingId(null);
              setUploadingNew(false);
              showToast(message, "success");
              fetchPhotos();
            }}
            onError={() => showToast("Something went wrong, try again", "error")}
          />
        )}
      </AnimatePresence>

      {loading && photos.length === 0 && (
        <p className="mt-10 text-center font-body text-sm font-light italic text-rose-300">
          One moment...
        </p>
      )}
    </section>
  );
}

// --- Modal premium para editar o crear una foto ---
function EditModal({
  mode,
  photo,
  existingCount,
  maxPosition,
  onClose,
  onDone,
  onError,
}: {
  mode: "create" | "edit";
  photo: GalleryPhoto | null;
  existingCount: number;
  maxPosition: number;
  onClose: () => void;
  onDone: (message: string) => void;
  onError: () => void;
}) {
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setLocalError("The file must be an image.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setLocalError("The image exceeds 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setLocalError(null);
    if (mode === "create" && !file) {
      setLocalError("Select a photo.");
      return;
    }
    setBusy(true);
    try {
      let foto_url = photo?.foto_url ?? null;
      if (file) {
        foto_url = await uploadGalleryPhoto(file);
        if (!foto_url) throw new Error("upload failed");
      }

      if (mode === "create") {
        const { error } = await supabase.from("gallery_photos").insert([
          {
            foto_url,
            caption: caption.trim() || null,
            position: maxPosition + 1 >= 0 ? maxPosition + 1 : existingCount,
          },
        ]);
        if (error) throw error;
        onDone("Photo added");
      } else if (photo) {
        const { error } = await supabase
          .from("gallery_photos")
          .update({ foto_url, caption: caption.trim() || null })
          .eq("id", photo.id);
        if (error) throw error;
        onDone("Photo updated");
      }
    } catch (err) {
      console.error(err);
      onError();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!photo) return;
    if (!window.confirm("Delete this photo?")) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("gallery_photos")
        .delete()
        .eq("id", photo.id);
      if (error) throw error;
      onDone("Photo deleted");
    } catch (err) {
      console.error(err);
      onError();
    } finally {
      setBusy(false);
    }
  };

  const previewSrc = preview ?? photo?.foto_url ?? null;

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "rgba(107,30,58,0.25)", backdropFilter: "blur(10px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-rose-200 bg-white p-7"
        style={{ boxShadow: "0 30px 60px -20px rgba(192,72,112,0.4)" }}
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-rose-400 transition-transform hover:scale-110"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <h3 className="mb-5 font-display text-2xl italic text-rose-900">
          {mode === "create" ? "Add photo" : "Edit photo"}
        </h3>

        {/* Preview */}
        <div className="mx-auto mb-4 h-44 w-44 overflow-hidden rounded-xl border border-rose-200 bg-rose-50">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-rose-300">
              <Plus size={32} strokeWidth={1.4} />
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPick}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mb-4 w-full rounded-xl border border-dashed border-rose-300 bg-rose-50/40 px-4 py-2.5 font-body text-sm font-light text-rose-400 transition hover:bg-rose-50"
        >
          {mode === "create" ? "Choose photo" : "Replace photo"}
        </button>

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption"
          className="mb-4 w-full rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-2.5 font-body text-rose-900 outline-none transition focus:border-rose-400"
        />

        {localError && (
          <p className="mb-3 flex items-center gap-2 font-body text-sm font-light text-rose-600">
            <AlertCircle size={15} strokeWidth={1.5} />
            {localError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-full border border-rose-400 bg-rose-100 px-6 py-3 font-body text-base font-light tracking-wide text-rose-600 transition-colors duration-300 hover:bg-rose-200 disabled:opacity-70"
        >
          {busy ? (
            <Loader2 size={17} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <Save size={17} strokeWidth={1.5} />
          )}
          Save changes
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-transparent px-6 py-2.5 font-body text-sm font-light text-rose-600 transition-colors duration-300 hover:bg-rose-50 disabled:opacity-70"
          >
            <Trash2 size={15} strokeWidth={1.5} />
            Delete photo
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

// --- Cinta washi decorativa: 3 estilos (rayas / lunares / liso dorado) ---
function WashiTape({
  color,
  flip,
  variant,
}: {
  color: string;
  flip: boolean;
  variant: 0 | 1 | 2;
}) {
  return (
    <svg
      width="78"
      height="30"
      viewBox="0 0 78 30"
      className="absolute -top-3 z-10"
      style={{
        [flip ? "right" : "left"]: "-10px",
        transform: `rotate(${flip ? 18 : -18}deg)`,
        opacity: 0.82,
      }}
    >
      <path d="M2 6 L76 2 L74 24 L4 28 Z" fill={color} />
      <path d="M2 6 L76 2 L74 24 L4 28 Z" fill="#FFFFFF" opacity="0.18" />
      {/* variante 0: rayas diagonales */}
      {variant === 0 &&
        [14, 28, 42, 56].map((x) => (
          <line key={x} x1={x} y1="3" x2={x - 6} y2="27" stroke="#FFFFFF" strokeWidth="1" opacity="0.3" />
        ))}
      {/* variante 1: lunares */}
      {variant === 1 &&
        [16, 30, 44, 58].map((x, i) => (
          <circle key={x} cx={x} cy={i % 2 ? 11 : 17} r="2.1" fill="#FFFFFF" opacity="0.35" />
        ))}
      {/* variante 2: liso con doble línea central dorada/clara */}
      {variant === 2 && (
        <>
          <line x1="6" y1="11" x2="72" y2="8" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" />
          <line x1="6" y1="19" x2="72" y2="16" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.4" />
        </>
      )}
    </svg>
  );
}
