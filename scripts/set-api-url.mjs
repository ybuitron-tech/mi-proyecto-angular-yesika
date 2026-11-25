import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Genera environment.prod.ts a partir de BACKEND_API_URL en el build de Vercel.
 * Si la variable no existe (build local), conserva el archivo actual.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'src', 'environments', 'environment.prod.ts');

const raw = process.env.BACKEND_API_URL?.trim().replace(/\/+$/, '');

if (!raw) {
  const actual = await readFile(target, 'utf8');
  if (actual.includes('TU-BACKEND')) {
    console.warn(
      '[set-api-url] BACKEND_API_URL no definido: se conserva el placeholder de environment.prod.ts',
    );
  }
  process.exit(0);
}

if (!/^https?:\/\//.test(raw)) {
  console.error('[set-api-url] BACKEND_API_URL debe ser una URL http(s) completa');
  process.exit(1);
}

const apiUrl = /\/api\/v1$/.test(raw) ? raw : `${raw}/api/v1`;
const contenido = `export const environment = {\n  production: true,\n  apiUrl: '${apiUrl}'\n};\n`;

await writeFile(target, contenido, 'utf8');
console.log(`[set-api-url] API de producción configurada: ${apiUrl}`);
