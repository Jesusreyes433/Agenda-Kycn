# Agenda Kycn

Agenda compartida para el equipo de consultores: cada persona se identifica
con su nombre y registra sus propios compromisos. Todos ven en una sola
pantalla qué día y a qué hora está ocupado cada integrante del equipo.

Es una **web app instalable (PWA)**: se abre en el navegador de iPhone o
Android y se puede agregar a la pantalla de inicio para que funcione como una
app normal, sin pasar por App Store ni Google Play.

## Cómo funciona

- Al entrar por primera vez, cada persona escribe su nombre. Ese nombre la
  identifica en todas las visitas siguientes (queda guardado en su teléfono).
- Cada quien solo puede crear, editar y borrar **sus propios** compromisos.
  Los compromisos de los demás se ven (título y horario), pero no se pueden
  modificar.
- Las notas de un compromiso son privadas: solo las ve quien lo creó.
- Los cambios se reflejan en vivo para todo el equipo (Supabase Realtime).

## Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com/) (Postgres + Realtime) como base de datos
- Pensado para desplegarse en [Vercel](https://vercel.com/)

## 1. Configurar Supabase

1. Crea una cuenta y un proyecto nuevo en [supabase.com](https://supabase.com/).
2. Entra a **SQL Editor** dentro de tu proyecto y ejecuta todo el contenido
   del archivo [`supabase/schema.sql`](supabase/schema.sql). Esto crea las
   tablas `team_members` y `appointments`, las políticas de seguridad y
   activa Realtime.
3. Ve a **Project Settings > API** y copia:
   - `Project URL`
   - `anon public` key

> **Nota de seguridad:** esta app identifica a las personas solo por nombre,
> sin contraseña, pensada para un equipo interno de confianza. Cualquiera con
> el link de la app puede leer y escribir datos usando la llave pública
> `anon`. Es el mismo nivel de protección que un documento compartido por
> link. Si en algún momento necesitan más seguridad (login con contraseña,
> permisos por usuario), se puede migrar a Supabase Auth y ajustar las
> políticas RLS en `supabase/schema.sql`.

## 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa con los datos de tu proyecto
de Supabase:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
```

## 3. Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 4. Publicar en Vercel

1. Sube este proyecto a un repositorio de GitHub (o GitLab/Bitbucket).
2. En [vercel.com](https://vercel.com/), elige **Add New > Project** e
   importa el repositorio.
3. En **Environment Variables**, agrega `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` con los mismos valores de tu `.env.local`.
4. Despliega. Vercel te da una URL pública (ej. `agenda-kycn.vercel.app`).

## 5. Instalar la app en el teléfono

- **iPhone (Safari):** abrir la URL → botón compartir → "Agregar a la
  pantalla de inicio".
- **Android (Chrome):** abrir la URL → menú (⋮) → "Instalar app" o "Agregar a
  la pantalla de inicio".

## Personalizar el ícono

`scripts/gen-icon.cjs` genera íconos de marcador de posición (cuadrado azul
marino) en `public/icons/` y `public/apple-touch-icon.png`. Cuando tengan un
logo definitivo, basta con reemplazar esos archivos PNG (192×192, 512×512 y
180×180) manteniendo los mismos nombres.
