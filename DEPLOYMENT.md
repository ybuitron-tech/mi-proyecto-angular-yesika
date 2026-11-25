# Despliegue del frontend (Angular)

## 1. Conectar con el backend
Edita `src/environments/environment.prod.ts` y pon la URL pública del backend:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://TU-BACKEND.onrender.com/api/v1'
};
```

Para desarrollo se usa `src/environments/environment.ts` con `http://localhost:3000/api/v1`.
`angular.json` ya tiene el `fileReplacement` automático para producción.

## 2. Compilar
```bash
npm install
npm run build
```

El resultado queda en `dist/mi-proyecto-angular/browser`.

## 3. Subir el build
Sube el contenido de `dist/mi-proyecto-angular/browser` a tu hosting (Netlify, Vercel, Render, etc.).

Si usas Netlify/Vercel:
- Build command: `npm run build`
- Publish directory: `dist/mi-proyecto-angular/browser`

## 4. Verificación rápida
1. Backend encendido y accesible.
2. Registrar un estudiante desde `/registro`.
3. Entrar con ese estudiante o con un docente.
4. En `/estudiantes` y `/docentes`, crear/editar/eliminar: los datos deben persistir tras recargar (F5).

## 5. Estado de la integración
- ✅ Conectados al backend: login (JWT), registro, estudiantes, docentes, escalas,
  evaluaciones, preguntas, examen y resultados.
- ✅ El token JWT se envía automáticamente en todas las peticiones y las rutas internas
  están protegidas por un guard.
- 🔄 El detalle del examen se conserva en `localStorage` como historial, pero la nota
  se persiste en la base de datos mediante `PATCH /api/v1/estudiantes/:id/resultado`.
- ⚠️ Antes de desplegar, reemplaza el placeholder de `apiUrl` en
  `src/environments/environment.prod.ts` por la URL pública real del backend.
