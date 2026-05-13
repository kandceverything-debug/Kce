-- Enums

CREATE TYPE member_status AS ENUM ('pending', 'active', 'suspended', 'banned');
CREATE TYPE ban_source AS ENUM ('app', 'venue', 'cascade');
CREATE TYPE event_kind AS ENUM ('dj_set', 'podcast', 'special', 'pop_up');
CREATE TYPE transaction_kind AS ENUM ('tip', 'song_request');
CREATE TYPE transaction_status AS ENUM ('pending', 'succeeded', 'refunded', 'failed');

-- profiles (extends auth.users)

CREATE TABLE profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle               TEXT UNIQUE NOT NULL,
  display_name         TEXT NOT NULL,
  status               member_status NOT NULL DEFAULT 'pending',
  ban_source           ban_source,
  banned_at            TIMESTAMPTZ,
  joined_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  good_standing_since  TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_present_irl       BOOLEAN NOT NULL DEFAULT false,
  is_dj                BOOLEAN NOT NULL DEFAULT false,
  is_mod               BOOLEAN NOT NULL DEFAULT false,
  stripe_account_id    TEXT,
  traits               JSONB NOT NULL DEFAULT '{}',
  evolution_score      INT NOT NULL DEFAULT 0,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vouch_codes

CREATE TABLE vouch_codes (
  code         TEXT PRIMARY KEY,
  issuer_id    UUID NOT NULL REFERENCES profiles(id),
  redeemed_by  UUID REFERENCES profiles(id),
  redeemed_at  TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- vouches (one voucher per member — the vouchee_id is the PK)

CREATE TABLE vouches (
  voucher_id  UUID NOT NULL REFERENCES profiles(id),
  vouchee_id  UUID PRIMARY KEY REFERENCES profiles(id),
  code        TEXT NOT NULL REFERENCES vouch_codes(code),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- events

CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind             event_kind NOT NULL,
  title            TEXT NOT NULL,
  subtitle         TEXT,
  dj_id            UUID REFERENCES profiles(id),
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ,
  is_live          BOOLEAN NOT NULL DEFAULT false,
  cover_url        TEXT,
  stream_url       TEXT,
  mux_playback_id  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- transactions

CREATE TABLE transactions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                   transaction_kind NOT NULL,
  payer_id               UUID NOT NULL REFERENCES profiles(id),
  payee_id               UUID NOT NULL REFERENCES profiles(id),
  event_id               UUID REFERENCES events(id),
  amount_cents           INT NOT NULL,
  platform_fee_cents     INT NOT NULL DEFAULT 0,
  stripe_payment_intent  TEXT UNIQUE,
  status                 transaction_status NOT NULL DEFAULT 'pending',
  message                TEXT,
  song_title             TEXT,
  song_artist            TEXT,
  play_next              BOOLEAN NOT NULL DEFAULT false,
  played_at              TIMESTAMPTZ,
  declined_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- booth_energy_log

CREATE TABLE booth_energy_log (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  UUID NOT NULL REFERENCES events(id),
  user_id   UUID NOT NULL REFERENCES profiles(id),
  amount    INT NOT NULL CHECK (amount BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- venue_checkins

CREATE TABLE venue_checkins (
  night_id       UUID NOT NULL,
  user_id        UUID NOT NULL REFERENCES profiles(id),
  checked_in_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (night_id, user_id)
);

-- Ban cascade trigger
-- When a member is banned, their voucher is also banned (cascade source)

CREATE OR REPLACE FUNCTION cascade_ban()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'banned' AND OLD.status <> 'banned' THEN
    UPDATE profiles
    SET
      status     = 'banned',
      ban_source = 'cascade',
      banned_at  = now()
    WHERE id IN (
      SELECT voucher_id FROM vouches WHERE vouchee_id = NEW.id
    )
    AND status NOT IN ('banned');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cascade_ban
  AFTER UPDATE OF status ON profiles
  FOR EACH ROW EXECUTE FUNCTION cascade_ban();

-- Row Level Security

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouch_codes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouches           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_energy_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_checkins    ENABLE ROW LEVEL SECURITY;

-- Helper: true if the calling uid is an active member

CREATE OR REPLACE FUNCTION is_active_member(uid UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = uid AND status = 'active'
  );
$$;

-- profiles policies

CREATE POLICY "active members read profiles"
  ON profiles FOR SELECT
  USING (status = 'active' AND is_active_member(auth.uid()));

CREATE POLICY "read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- vouch_codes policies

CREATE POLICY "read own codes"
  ON vouch_codes FOR SELECT
  USING (issuer_id = auth.uid() AND is_active_member(auth.uid()));

-- events policies

CREATE POLICY "active members read events"
  ON events FOR SELECT
  USING (is_active_member(auth.uid()));

-- transactions policies

CREATE POLICY "read own transactions"
  ON transactions FOR SELECT
  USING (
    (payer_id = auth.uid() OR payee_id = auth.uid())
    AND is_active_member(auth.uid())
  );
