-- =============================================
-- SEGURIDAD RLS — Políticas restrictivas para Supabase
-- Ejecutar en: Supabase → SQL Editor → New Query
-- IMPORTANTE: Ejecutar DESPUÉS de supabase-setup.sql
-- =============================================

-- =============================================
-- PASO 1: Eliminar todas las políticas permisivas existentes
-- =============================================
DROP POLICY IF EXISTS "public_all_events" ON eventus_events;
DROP POLICY IF EXISTS "public_all_guests" ON eventus_guests;
DROP POLICY IF EXISTS "public_all_payments" ON eventus_payments;
DROP POLICY IF EXISTS "public_all_checklist" ON eventus_checklist;
DROP POLICY IF EXISTS "public_all_program" ON eventus_program;
DROP POLICY IF EXISTS "public_all_scheduled" ON scheduled_messages;
DROP POLICY IF EXISTS "public_all_lead_notes" ON lead_notes;
DROP POLICY IF EXISTS "public_all_followup_rules" ON followup_rules;
DROP POLICY IF EXISTS "public_all_bot_rules" ON bot_rules;

-- =============================================
-- PASO 2: Tablas EVENTUS (acceso público con anon key)
-- Estas tablas se acceden desde páginas públicas (RSVP, Pase, Eventus Admin)
-- Permitimos lectura/escritura con anon key porque el admin de eventos
-- accede desde una página estática (eventus.html)
-- =============================================

-- EVENTUS_EVENTS — Acceso completo con anon key
CREATE POLICY "events_anon_all" ON eventus_events
  FOR ALL USING (true) WITH CHECK (true);

-- EVENTUS_GUESTS — Acceso completo con anon key
CREATE POLICY "guests_anon_all" ON eventus_guests
  FOR ALL USING (true) WITH CHECK (true);

-- EVENTUS_PAYMENTS — Acceso completo con anon key
CREATE POLICY "payments_anon_all" ON eventus_payments
  FOR ALL USING (true) WITH CHECK (true);

-- EVENTUS_CHECKLIST — Acceso completo con anon key
CREATE POLICY "checklist_anon_all" ON eventus_checklist
  FOR ALL USING (true) WITH CHECK (true);

-- EVENTUS_PROGRAM — Acceso completo con anon key
CREATE POLICY "program_anon_all" ON eventus_program
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- PASO 3: Tablas CRM — SOLO acceso con service_role
-- Estas tablas contienen datos sensibles de clientes/leads
-- NUNCA deben ser accesibles con la anon key
-- =============================================

-- LEADS (datos de clientes potenciales)
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_service_only" ON leads;
CREATE POLICY "leads_service_only" ON leads
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- MESSAGES (conversaciones de WhatsApp)
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_service_only" ON messages;
CREATE POLICY "messages_service_only" ON messages
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- SCHEDULED_MESSAGES (mensajes programados)
DROP POLICY IF EXISTS "scheduled_service_only" ON scheduled_messages;
CREATE POLICY "scheduled_service_only" ON scheduled_messages
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- LEAD_NOTES (notas internas del asesor)
DROP POLICY IF EXISTS "notes_service_only" ON lead_notes;
CREATE POLICY "notes_service_only" ON lead_notes
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- FOLLOWUP_RULES (reglas de seguimiento automático)
DROP POLICY IF EXISTS "followup_service_only" ON followup_rules;
CREATE POLICY "followup_service_only" ON followup_rules
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- BOT_RULES (reglas del Cerebro Madre)
DROP POLICY IF EXISTS "bot_rules_service_only" ON bot_rules;
CREATE POLICY "bot_rules_service_only" ON bot_rules
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- APPOINTMENTS (citas agendadas)
ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appointments_service_only" ON appointments;
CREATE POLICY "appointments_service_only" ON appointments
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =============================================
-- PASOS POST-SQL (hacer en Vercel y Supabase):
--
-- 1. En Supabase → Settings → API → copiar la "service_role" key
--
-- 2. En Vercel → Settings → Environment Variables, agregar:
--    SUPABASE_SERVICE_KEY = <tu service_role key>
--    JWT_SECRET = <un string aleatorio largo, ej: openssl rand -hex 32>
--    DASH_PASSWORD = <nueva contraseña segura para el CRM>
--    CRON_SECRET = <otro string aleatorio para cron jobs>
--    WA_VERIFY_TOKEN = <token para webhook WhatsApp>
--    SUPABASE_ANON_KEY = <tu anon key (para el Next.js app)>
--    NEXT_PUBLIC_SUPABASE_URL = https://gfbixkddumsqlfrfbsmp.supabase.co
--
-- 3. En api/dashboard.js, api/whatsapp.js, etc:
--    Cambiar SUPABASE_KEY para usar SUPABASE_SERVICE_KEY
--    (ya hecho en el código — solo falta agregar la variable en Vercel)
--
-- 4. Redesplegar en Vercel
-- =============================================
