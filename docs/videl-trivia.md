# Ranking de trivia de Videl

Endpoint aislado `/api/videl-trivia`; no consulta CRM, Eventus ni leads.

`GET /api/videl-trivia?participantId=<UUID>` devuelve `total`, `top20` y `me`.
El identificador es opcional. Cada fila pública tiene sólo `rank`, `name`, `score`.
`me` incluye el puesto real aunque el participante esté fuera de los primeros 20;
sin resultado previo es `null`. No se publican UUID de otros invitados.

`POST` desde el mismo origen, con `Content-Type: application/json`:

```json
{"participantId":"UUID generado por el navegador","name":"Nombre","answers":[1,2,0,2,1,0,2,1,0,1]}
```

Se requieren un UUID, nombre de 1–50 caracteres y exactamente diez índices
enteros de 0 a 2. El servidor calcula el puntaje; ignora puntaje y fecha enviados
por el navegador. La primera entrega de cada UUID queda fija. La respuesta añade
`recorded: true` para una entrega nueva o `false` para un reintento. Un fallo al
leer el ranking después de insertar permite repetir el POST sin duplicar filas.
Orden: puntaje descendente, fecha de entrega del servidor ascendente y UUID
ascendente como desempate estable. El resultado no incorpora teléfonos.

## Desarrollo local

Sólo `NODE_ENV=development` fuera de Vercel usa `.local/videl-trivia.json` bajo el
directorio de la aplicación, incluso si hay variables Supabase. `.local/` está
ignorado por Git. Formato: `{version:1, rows:[{participantId,name,score,finishedAt}]}`.
No guarda respuestas. El bloqueo global sobrevive a hot reload; un lock de archivo
también serializa procesos y la escritura reemplaza el JSON mediante rename
atómico. Un archivo corrupto responde 503 y conserva los datos originales.

Pruebas sin datos reales ni solicitudes de red:

```powershell
node --test tests/videl-trivia.test.mjs
.\node_modules\.bin\tsc.cmd --noEmit
```

Para una prueba visual local, conservar los UUID ficticios que se generaron y
limpiar exclusivamente esos UUID con `removeLocalTestRows(filePath, ids)` del
módulo `src/lib/videl-trivia.mjs`. El helper usa el mismo bloqueo y preserva filas
concurrentes; no hay endpoint de borrado. Se niega a operar en producción/Vercel.

## Producción

El BFF requiere `SUPABASE_URL` (o la URL existente `NEXT_PUBLIC_SUPABASE_URL`) y
`SUPABASE_SERVICE_KEY` del servidor. Nunca usar una variable `NEXT_PUBLIC_*`
para la clave. Sin configuración, o si la tabla/RPC
no están disponibles, responde 503. No recurre a archivos efímeros de Vercel ni
simula persistencia. Tras autorización de publicación, el 9 de octubre de 2026
se aplicó la migración `videl_trivia_private_ranking` al proyecto
`gfbixkddumsqlfrfbsmp`. Se verificaron en una transacción revertida 25 resultados,
un top de 20, el puesto propio 25 y la ausencia de permisos públicos. La tabla
quedó vacía para recibir exclusivamente participaciones reales.

`supabase-videl-trivia.sql` prepara una tabla nueva, índice de ranking y RPC
`videl_trivia_snapshot`. RLS está habilitado; no hay policies públicas; se
revocan permisos de `PUBLIC`, `anon` y `authenticated`. Sólo `service_role` recibe
SELECT/INSERT y EXECUTE; no UPDATE/DELETE. La función usa `SECURITY INVOKER` y
`search_path` vacío. El conteo, ranking global y top 20 se calculan dentro de SQL,
por lo que no dependen del límite de 1000 filas de la API REST.

El POST requiere Origin exacto, limita el cuerpo a 4096 bytes y a cuatro segundos
de recepción. El límite por IP e instancia es de 60 POST y 120 GET por minuto.
Es una defensa de carga por instancia, no un control de identidad: borrar el UUID
del navegador puede generar una participación distinta. No se prometen límites
globales entre instancias de Vercel. Los errores no devuelven claves ni detalles
privados del servicio.

Referencias verificadas: [seguridad de Data API](https://supabase.com/docs/guides/api/securing-your-api),
[funciones de base de datos](https://supabase.com/docs/guides/database/functions).
