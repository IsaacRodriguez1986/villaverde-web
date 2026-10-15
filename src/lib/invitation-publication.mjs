import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { createRequire } from 'node:module';

// Use the same route-pattern engine shipped with the installed Next version.
const { pathToRegexp } = createRequire(import.meta.url)('next/dist/compiled/path-to-regexp');

const ROBOTS = ['noindex', 'nofollow', 'noarchive', 'nosnippet', 'noimageindex'];
const RESOURCE = /\.(?:html|css|m?js|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|mp[34]|webm|ogg|wav|ics|pdf)(?:[?#].*)?$/i;
const SITE = new Set(['www.salondefiestasvillaverde.com', 'salondefiestasvillaverde.com']);
const inside = (root, file) => {
  const child = relative(root, file);
  return child !== '..' && !child.startsWith('..' + sep) && !isAbsolute(child);
};
const safeRelative = value => typeof value === 'string' && value.length > 0 && !isAbsolute(value) && !/^[a-z]:/i.test(value) && !value.includes('\\') && !value.startsWith('/') && !value.split('/').includes('..');
const flattenRewrites = rules => Array.isArray(rules) ? rules : ['beforeFiles', 'afterFiles', 'fallback'].flatMap(key => rules?.[key] || []);
const unconditional = rule => !rule.has?.length && !rule.missing?.length;
const matches = (rule, route) => (rule.regex ? new RegExp(rule.regex) : pathToRegexp(rule.source)).test(route);
async function nonempty(file) {
  try { const info = await stat(file); return info.isFile() && info.size > 0; } catch { return false; }
}

/** A stale post-guard revision must not erase invitations registered later. */
export async function validateProductionSource({ env, source, getMainRevision }) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'production') return [];
  if (!/^https:\/\/github\.com\/[a-z0-9_.-]+\/[a-z0-9_.-]+\.git$/i.test(source?.repository || '') ||
      !/^[a-z0-9/_-]+$/i.test(source?.branch || '') || !/^[a-f0-9]{40}$/i.test(env.VERCEL_GIT_COMMIT_SHA || '')) {
    return ['Publicación de producción sin una revisión Git verificable. Usa la rama principal actualizada.'];
  }
  try {
    const current = await getMainRevision(source);
    if (!/^[a-f0-9]{40}$/i.test(current || '')) return ['No se pudo verificar la revisión actual de la rama principal.'];
    if (current !== env.VERCEL_GIT_COMMIT_SHA) return ['La revisión a publicar está desactualizada respecto a la rama principal; podría perder invitaciones. Actualiza la rama antes de publicar.'];
    return [];
  } catch { return ['No se pudo consultar la rama principal. Se bloquea la publicación para conservar las invitaciones existentes.']; }
}

function references(text) {
  const values = [];
  for (const match of text.matchAll(/\b(?:src|href|poster|srcset|data-src|data-video-src)\s*=\s*["']([^"']+)["']/gi)) {
    if (/^(?:data|blob):/i.test(match[1])) continue;
    values.push(...match[1].split(',').map(value => value.trim().split(/\s+/)[0]));
  }
  for (const match of text.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi)) values.push(match[1]);
  for (const match of text.matchAll(/["'`]((?:assets\/|\.\.?\/|\/)[^"'`\s<>]+)["'`]/g)) values.push(match[1]);
  return [...new Set(values)].filter(value => RESOURCE.test(value) && !value.includes('${'));
}

/** Offline publication contract. It never contacts APIs or writes participant data. */
export async function validateInvitations({ root, config, manifest, built = false }) {
  const errors = [];
  const invitations = manifest?.invitations;
  if (manifest?.version !== 1 || !Array.isArray(invitations) || !invitations.length ||
      !Array.isArray(manifest.excludedPublicDirectories) || !Array.isArray(manifest.redirects)) {
    return { errors: ['Registro de invitaciones inválido o vacío.'], invitations: 0, files: 0 };
  }
  const publicRoot = resolve(root, 'public');
  const slugs = new Set();
  let files = 0;
  for (const invitation of invitations) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(invitation?.slug || '') || slugs.has(invitation.slug) ||
        !Array.isArray(invitation.files) || !invitation.files.includes('index.html') ||
        invitation.files.some(file => !safeRelative(file)) || new Set(invitation.files).size !== invitation.files.length ||
        !Array.isArray(invitation.apiRoutes) || invitation.apiRoutes.some(route => !/^\/api\/[a-z0-9/-]+$/.test(route) || route.includes('..'))) {
      errors.push(`Registro inválido o duplicado: ${invitation?.slug || '(sin nombre)'}.`);
      continue;
    }
    slugs.add(invitation.slug);
    const folder = resolve(publicRoot, invitation.slug);
    for (const file of invitation.files) {
      files++;
      if (!await nonempty(resolve(folder, file))) errors.push(`${invitation.slug}: falta o está vacío ${file}.`);
    }
    for (const route of invitation.apiRoutes) {
      const routeRoot = resolve(root, 'src/app', route.slice(1), 'route');
      if (!await nonempty(routeRoot + '.ts') && !await nonempty(routeRoot + '.js')) errors.push(`${invitation.slug}: falta el API ${route}.`);
    }
    // Follow the current page's concrete dependencies, including new assets and
    // shared resources. Legacy unreferenced JS is not executed or scanned.
    const queue = [resolve(folder, 'index.html')];
    const visited = new Set();
    while (queue.length) {
      const file = queue.shift();
      if (visited.has(file) || !await nonempty(file)) continue;
      visited.add(file);
      if (!['.html', '.css', '.js', '.mjs'].includes(extname(file))) continue;
      const text = await readFile(file, 'utf8');
      let documentBase = new URL(`https://www.salondefiestasvillaverde.com/${invitation.slug}/`);
      const baseTag = text.match(/<base\b[^>]*href\s*=\s*["']([^"']+)["']/i);
      if (baseTag) documentBase = new URL(baseTag[1], documentBase);
      const fileURL = new URL(relative(publicRoot, file).split(sep).join('/'), 'https://www.salondefiestasvillaverde.com/');
      for (const reference of references(text)) {
        let url;
        try { url = new URL(reference, extname(file) === '.css' ? fileURL : documentBase); } catch { continue; }
        if (!['https:', 'http:'].includes(url.protocol) || !SITE.has(url.hostname)) continue;
        let local;
        try { local = resolve(publicRoot, '.' + decodeURIComponent(url.pathname)); } catch { continue; }
        if (!inside(publicRoot, local) || !await nonempty(local)) {
          errors.push(`${invitation.slug}: recurso local ausente o vacío ${url.pathname} (desde ${relative(publicRoot, file).split(sep).join('/')}).`);
        } else if (!visited.has(local)) queue.push(local);
      }
    }
  }
  try {
    for (const entry of await readdir(publicRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || manifest.excludedPublicDirectories.includes(entry.name)) continue;
      try {
        await stat(resolve(publicRoot, entry.name, 'index.html'));
        if (!slugs.has(entry.name)) errors.push(`Invitación sin registrar: ${entry.name}. Añádela al registro de publicación.`);
      } catch { /* Other public directories are not invitations. */ }
    }
  } catch { errors.push('Falta el directorio public.'); }

  const checkRules = (rewrites, headers, redirects, label) => {
    const rules = flattenRewrites(rewrites);
    for (const invitation of invitations.filter(invitation => slugs.has(invitation.slug))) {
      const route = '/' + invitation.slug;
      if (!rules.some(rule => rule.source === route && rule.destination === route + '/index.html' && unconditional(rule))) errors.push(`${label}: falta la ruta pública ${route}.`);
      if (redirects.some(rule => matches(rule, route))) errors.push(`${label}: una redirección impide abrir ${route}.`);
      const firstRewrite = rules.find(rule => matches(rule, route));
      const overridingBefore = !Array.isArray(rewrites) && rewrites?.beforeFiles?.some(rule => matches(rule, route) && rule.destination !== route + '/index.html');
      if (firstRewrite?.destination !== route + '/index.html' || overridingBefore) errors.push(`${label}: otra regla de ruta impide abrir ${route}.`);
      for (const source of [route, route + '/:path*']) {
        const path = source === route ? route : route + '/assets/publication-check.webp';
        const matching = headers.filter(rule => matches(rule, path) && unconditional(rule));
        const values = new Map(matching.flatMap(rule => rule.headers || []).map(header => [header.key.toLowerCase(), header.value.toLowerCase()]));
        const robots = (values.get('x-robots-tag') || '').split(',').map(value => value.trim());
        if (!headers.some(rule => rule.source === source && unconditional(rule)) || !ROBOTS.every(token => robots.includes(token)) || values.get('referrer-policy') !== 'no-referrer') errors.push(`${label}: faltan cabeceras de privacidad en ${source}.`);
      }
    }
    for (const rule of rules) {
      const match = rule.destination?.match(/^\/([^/]+)\/index\.html$/);
      if (match && !slugs.has(match[1]) && !manifest.excludedPublicDirectories.includes(match[1])) errors.push(`${label}: ruta de invitación sin registrar ${rule.source}.`);
    }
    for (const required of manifest.redirects) {
      if (!required?.source || !required?.destination || !redirects.some(rule => rule.source === required.source && rule.destination === required.destination && unconditional(rule))) errors.push(`${label}: falta la redirección compartida ${required?.source || '(inválida)'}.`);
    }
  };
  try {
    checkRules(await config.rewrites(), await config.headers(), await config.redirects?.() || [], 'Configuración');
  } catch (error) { errors.push('No se pudo comprobar next.config: ' + error.message); }
  if (built) {
    try {
      const output = JSON.parse(await readFile(resolve(root, '.next/routes-manifest.json'), 'utf8'));
      checkRules(output.rewrites, output.headers || [], output.redirects || [], 'Build');
      const routes = JSON.parse(await readFile(resolve(root, '.next/server/app-paths-manifest.json'), 'utf8'));
      for (const route of new Set(invitations.flatMap(invitation => invitation.apiRoutes || []))) {
        const file = routes[route + '/route'];
        if (!file || !inside(resolve(root, '.next/server'), resolve(root, '.next/server', file)) || !await nonempty(resolve(root, '.next/server', file))) errors.push(`Build: falta el API compilado ${route}.`);
      }
    } catch (error) { errors.push('Build incompleto: ' + error.message); }
  }
  return { errors: [...new Set(errors)], invitations: slugs.size, files };
}
