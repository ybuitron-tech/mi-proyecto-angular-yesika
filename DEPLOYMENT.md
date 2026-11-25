# Despliegue del frontend (Angular en Vercel)

Arquitectura acordada: **Angular en Vercel**, **API NestJS en Render**, **PostgreSQL en Supabase**.

## 1. Variables de entorno en Vercel

En el proyecto de Vercel, añade una variable de entorno:

| Variable | Valor | Entornos |
| --- | --- | --- |
| `BACKEND_API_URL` | URL pública de la API de Render, sin `/api/v1` | Production, Preview, Development |

Ejemplo: `https://aplicaciones-web-ii-api.onrender.com`

Durante el build, `scripts/set-api-url.mjs` escribe
`src/environments/environment.prod.ts` con:

```ts
export const environment = {
  production: true,
  apiUrl: '<BACKEND_API_URL>/api/v1'
};
```

No hace falta editar ese archivo a mano. La configuración de Vercel está en `vercel.json`:
- Build command: `npm run build`
- Output directory: `dist/mi-proyecto-angular/browser`
- Rewrite de SPA: todas las rutas caen en `index.html` (necesario para Angular router).

Si la variable no está definida en un build local, se conserva el placeholder y se muestra
una advertencia; el build no falla.

## 2. Desplegar

Opción A — dashboard de Vercel:
1. Importar `https://github.com/ybuitron-tech/mi-proyecto-angular-yesika.git`.
2. Seleccionar la rama `deploy-vercel`.
3. Configurar `BACKEND_API_URL` y desplegar.

Opción B — CLI (requiere sesión previa):

```bash
npx vercel@latest link
npx vercel@latest env add BACKEND_API_URL
npx vercel@latest --prod
```

## 3. Verificación rápida

1. Backend encendido y accesible en la URL configurada.
2. Registrar un estudiante desde `/registro` (el backend valida duplicados con
   `GET /api/v1/estudiantes/existe/:identificacion`).
3. Entrar con ese estudiante o con un docente (`12345` / `123456` del seed).
4. En `/estudiantes` y `/docentes`, crear/editar/eliminar: los datos deben persistir tras F5.
5. En `/examen`, responder una evaluación y confirmar que la nota queda guardada en la API.

## 4. Estado de la integración

- ✅ Login (JWT), registro, estudiantes, docentes, escalas, evaluaciones, preguntas,
  examen y resultados conectados a la API.
- ✅ El token JWT se envía automáticamente en todas las peticiones y las rutas internas
  están protegidas por `authGuard`.
- ✅ Accesibilidad Lighthouse 1.0 en las rutas principales.
- ✅ Notas con decimales y escalas de hasta 1000 soportadas por el backend.
- ⚠️ Todas las rutas del backend requieren JWT salvo login, registro y health check.
