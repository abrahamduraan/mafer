import { createClient } from "@supabase/supabase-js";

// Validamos las credenciales en tiempo de import para fallar con un mensaje
// claro en vez de un error críptico de Supabase si faltan en el deploy.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Message {
  id: string;
  nombre: string;
  mensaje: string;
  foto_url: string | null;
  privacy: "public" | "private";
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  foto_url: string;
  caption: string | null;
  position: number;
  created_at: string;
}
