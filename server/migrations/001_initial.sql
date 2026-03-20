-- Elite Finishes Lead Pipeline — Supabase Schema

-- Services offered
CREATE TABLE IF NOT EXISTS services (
    id    SERIAL PRIMARY KEY,
    name  TEXT NOT NULL UNIQUE
);

-- Users (canvassers, supervisors, estimators)
CREATE TABLE IF NOT EXISTS app_users (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL UNIQUE,
    pin_hash      TEXT NOT NULL,
    role          TEXT NOT NULL CHECK(role IN ('canvasser','supervisor','estimator')),
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Core leads table
CREATE TABLE IF NOT EXISTS leads (
    id              SERIAL PRIMARY KEY,
    canvasser_id    INTEGER NOT NULL REFERENCES app_users(id),
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    address         TEXT NOT NULL,
    city            TEXT NOT NULL DEFAULT 'Baltimore',
    state           TEXT NOT NULL DEFAULT 'MD',
    zip             TEXT,
    phone           TEXT NOT NULL,
    email           TEXT,
    service_id      INTEGER NOT NULL REFERENCES services(id),
    status          TEXT NOT NULL DEFAULT 'new'
                    CHECK(status IN ('new','contacted','appointment_set',
                                     'estimate_complete','won','lost','sold_lead')),
    canvasser_notes TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments (one per lead)
CREATE TABLE IF NOT EXISTS appointments (
    id              SERIAL PRIMARY KEY,
    lead_id         INTEGER NOT NULL UNIQUE REFERENCES leads(id),
    estimator_id    INTEGER NOT NULL REFERENCES app_users(id),
    scheduled_date  DATE NOT NULL,
    scheduled_time  TIME NOT NULL,
    outcome_notes   TEXT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity log / audit trail
CREATE TABLE IF NOT EXISTS lead_activity (
    id          SERIAL PRIMARY KEY,
    lead_id     INTEGER NOT NULL REFERENCES leads(id),
    user_id     INTEGER NOT NULL REFERENCES app_users(id),
    action      TEXT NOT NULL,
    detail      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_canvasser ON leads(canvasser_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_estimator ON appointments(estimator_id);
CREATE INDEX IF NOT EXISTS idx_activity_lead ON lead_activity(lead_id);

-- Seed services
INSERT INTO services (name) VALUES
  ('Interior Painting'),
  ('Exterior Painting'),
  ('Kitchen Remodeling'),
  ('Bathroom Remodeling'),
  ('Home Remodeling'),
  ('Basement Remodeling'),
  ('Deck Building/Staining'),
  ('Siding'),
  ('Roofing'),
  ('Concrete & Masonry'),
  ('Flooring'),
  ('Commercial Services'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
