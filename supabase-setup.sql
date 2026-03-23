-- =============================================
-- EVENTUS PRO — Supabase Tables Setup
-- Ejecutar en: Supabase → SQL Editor → New Query
-- =============================================

-- 1. EVENTOS
CREATE TABLE IF NOT EXISTS eventus_events (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'xv',
  date DATE NOT NULL,
  hours INTEGER NOT NULL DEFAULT 7,
  total_cost INTEGER NOT NULL DEFAULT 0,
  contract_date DATE,
  num_mesas INTEGER NOT NULL DEFAULT 20,
  menu_sel JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVITADOS
CREATE TABLE IF NOT EXISTS eventus_guests (
  id SERIAL PRIMARY KEY,
  event_code TEXT NOT NULL REFERENCES eventus_events(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  companions INTEGER DEFAULT 0,
  mesa INTEGER,
  status TEXT DEFAULT 'pending',
  wa TEXT DEFAULT '',
  arrived BOOLEAN DEFAULT FALSE,
  arrived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAGOS
CREATE TABLE IF NOT EXISTS eventus_payments (
  id SERIAL PRIMARY KEY,
  event_code TEXT NOT NULL REFERENCES eventus_events(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  note TEXT DEFAULT '',
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHECKLIST
CREATE TABLE IF NOT EXISTS eventus_checklist (
  id SERIAL PRIMARY KEY,
  event_code TEXT NOT NULL REFERENCES eventus_events(code) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- 5. PROGRAMA
CREATE TABLE IF NOT EXISTS eventus_program (
  id SERIAL PRIMARY KEY,
  event_code TEXT NOT NULL REFERENCES eventus_events(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TIME,
  dur INTEGER DEFAULT 15,
  note TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

-- 6. INDICES para performance
CREATE INDEX IF NOT EXISTS idx_guests_event ON eventus_guests(event_code);
CREATE INDEX IF NOT EXISTS idx_payments_event ON eventus_payments(event_code);
CREATE INDEX IF NOT EXISTS idx_checklist_event ON eventus_checklist(event_code);
CREATE INDEX IF NOT EXISTS idx_program_event ON eventus_program(event_code);

-- 7. ROW LEVEL SECURITY (permitir acceso público con anon key)
ALTER TABLE eventus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventus_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventus_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventus_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventus_program ENABLE ROW LEVEL SECURITY;

-- Políticas: cualquiera con el código puede leer/escribir su evento
CREATE POLICY "public_all_events" ON eventus_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_guests" ON eventus_guests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_payments" ON eventus_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_checklist" ON eventus_checklist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_program" ON eventus_program FOR ALL USING (true) WITH CHECK (true);

-- 8. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON eventus_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
