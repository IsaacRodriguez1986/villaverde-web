import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { validateInvitations, validateProductionSource } from '../src/lib/invitation-publication.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const manifest = JSON.parse(await readFile(resolve(root, 'config/invitations-publication.json'), 'utf8'));
  const { default: config } = await import(pathToFileURL(resolve(root, 'next.config.ts')).href);
  const result = await validateInvitations({ root, manifest, config, built: process.argv.includes('--built') });
  result.errors.push(...await validateProductionSource({
    env: process.env,
    source: manifest.productionSource,
    getMainRevision: async ({ repository, branch }) => {
      const { stdout } = await promisify(execFile)('git', ['ls-remote', '--exit-code', repository, 'refs/heads/' + branch], {
        timeout: 20000, maxBuffer: 8192, windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      });
      return stdout.trim().split(/\s+/)[0];
    },
  }));
  if (result.errors.length) {
    console.error('[invitaciones] Publicación bloqueada:');
    result.errors.forEach(error => console.error(' - ' + error));
    process.exitCode = 1;
  } else {
    console.log(`[invitaciones] ${result.invitations} invitaciones y ${result.files} archivos protegidos: ${process.argv.includes('--built') ? 'rutas compiladas verificadas' : 'fuentes verificadas'}.`);
  }
} catch (error) {
  console.error('[invitaciones] Publicación bloqueada: ' + error.message);
  process.exitCode = 1;
}
