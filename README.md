# Feliz Cumpleaños Mafer 🎂

Un sitio web personal hecho con cariño como regalo de cumpleaños: galería de
fotos, muro de mensajes, lectura de tarot, mascotas, pastel interactivo y
música. Sitio privado (no indexado por buscadores).

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — animaciones
- **Supabase** — base de datos y almacenamiento de fotos
- **lucide-react** — iconos
- **canvas-confetti** — efectos festivos

## Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts

| Script          | Descripción                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Servidor de desarrollo                   |
| `npm run build` | Build de producción                      |
| `npm run start` | Sirve el build de producción             |
| `npm run lint`  | Linting con ESLint                        |

> Nota: en Next.js 16 el comando `next lint` fue removido; el linting se
> ejecuta directamente con `eslint`.

## Variables de entorno

Crea un archivo `.env.local` en la raíz con las siguientes variables
(los **valores** se obtienen del panel de Supabase, no se commitean):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.local` está en `.gitignore` — nunca subas las credenciales al repo.

## Deploy en Vercel

1. Importa el repositorio en [Vercel](https://vercel.com/new).
2. Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en **Project Settings → Environment Variables**.
3. Vercel detecta Next.js automáticamente y ejecuta `npm run build`.

### Assets opcionales

- `public/birthday.mp3` — música del botón flotante. Si no existe, el botón
  no reproduce nada (no rompe el build).
- `public/og-image.png` — imagen para previews al compartir (1200×630).
- `src/app/favicon.ico` — reemplázalo por un ícono temático (corazón rosa o
  estrella dorada) si lo deseas.
