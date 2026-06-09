import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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
