# Desplegar en Render (desde cero)

Guía para subir el backend (API) y el frontend a Render usando el `render.yaml` del repo.

## 0. Antes de empezar: cambiar la contraseña de la base de datos

El archivo `Back-end/.env` estuvo subido a GitHub con la contraseña de la base de datos de Railway,
y el repositorio es público. Ya se quitó del repo, pero sigue en el historial de commits.

1. Entra a Railway → tu proyecto → servicio **Postgres** → pestaña **Variables** (o **Settings**).
2. Regenera la contraseña / credenciales de la base de datos.
3. Copia la nueva **DATABASE_PUBLIC_URL** (la que dice `...proxy.rlwy.net:PUERTO/railway`). La vas a pegar en Render.
4. Actualiza también tu `Back-end/.env` local con la nueva URL.

## 1. Conectar GitHub con Render

1. Entra a <https://dashboard.render.com>.
2. Arriba a la derecha: **New +** → **Blueprint**.
3. Si te lo pide, conecta tu cuenta de GitHub y da acceso al repo `sistema-ganadero-puerta-pesada`.

## 2. Crear los servicios con el Blueprint

1. Elige el repo `sistema-ganadero-puerta-pesada` y la rama `main`.
2. Render lee `render.yaml` y muestra dos servicios:
   - `rancho-puerta-pesada-api` (backend, plan Free)
   - `rancho-puerta-pesada-front` (frontend estático, gratis)
3. Te pedirá las variables marcadas como secretas:
   - `DATABASE_URL` → pega la URL de Postgres del paso 0.
   - `CORS_ORIGIN` → déjala vacía por ahora.
   - `VITE_API_URL` → déjala vacía por ahora.
4. Clic en **Apply**. Espera a que el backend diga **Live** (2–5 min).

## 3. Conectar el front con el back

1. Abre el servicio `rancho-puerta-pesada-api` y copia su URL (ej. `https://rancho-puerta-pesada-api.onrender.com`).
2. Pruébala en el navegador agregando `/health`: debe responder `{"status":"ok"}`.
3. Abre el servicio `rancho-puerta-pesada-front` → **Environment** → `VITE_API_URL` = la URL del paso 1 (sin `/` al final).
4. Guarda y elige **Save, rebuild, and deploy** (el front necesita reconstruirse para tomar la URL).
5. (Opcional, recomendado) En el servicio del API → **Environment** → `CORS_ORIGIN` = la URL del front
   (ej. `https://rancho-puerta-pesada-front.onrender.com`). Así solo tu front puede usar la API.

## 4. Probar

Abre la URL del front, inicia sesión y revisa Ganado, Empleados y Configuración.

## Cosas a saber

- **El plan Free duerme el backend** tras 15 min sin uso. La primera petición después tarda ~50 s en despertar.
  Para que no pase, sube el API al plan Starter (≈ 7 USD/mes) desde **Settings → Instance Type**.
- Cada `git push` a `main` redespliega solo.
- Logs del backend: servicio API → pestaña **Logs**.
- Cambios al esquema de la BD: se aplican desde tu máquina con `npx prisma db push` (no corre en el deploy).
- Al hacer `git pull` de este cambio, Git borra la carpeta `Back-end/node_modules` porque ya no se versiona:
  corre `npm install` dentro de `Back-end` y listo.
