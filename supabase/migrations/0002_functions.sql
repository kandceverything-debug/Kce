-- Booth energy aggregation function

CREATE OR REPLACE FUNCTION get_booth_energy(p_event_id UUID)
RETURNS INT LANGUAGE sql STABLE AS $$
  SELECT COALESCE(SUM(amount), 0) FROM booth_energy_log WHERE event_id = p_event_id;
$$;

-- Get evolution score for a member

CREATE OR REPLACE FUNCTION get_evolution_score(p_user_id UUID)
RETURNS INT LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_days_in_good_standing INT;
  v_successful_vouches INT;
  v_total_tips INT;
  v_booth_participations INT;
  v_venue_checkins INT;
  v_score INT;
BEGIN
  -- Days in good standing
  SELECT EXTRACT(DAY FROM (NOW() - good_standing_since))::INT INTO v_days_in_good_standing
  FROM profiles WHERE id = p_user_id;

  -- Successful vouches (where vouchee is still active)
  SELECT COUNT(*)::INT INTO v_successful_vouches
  FROM vouches v
  JOIN profiles p ON p.id = v.vouchee_id
  WHERE v.voucher_id = p_user_id AND p.status = 'active';

  -- Total tips received (in cents)
  SELECT COALESCE(SUM(amount_cents), 0)::INT INTO v_total_tips
  FROM transactions
  WHERE payee_id = p_user_id AND kind = 'tip' AND status = 'succeeded';

  -- Booth energy participations
  SELECT COUNT(*)::INT INTO v_booth_participations
  FROM booth_energy_log
  WHERE user_id = p_user_id;

  -- Venue checkins
  SELECT COUNT(*)::INT INTO v_venue_checkins
  FROM venue_checkins
  WHERE user_id = p_user_id;

  -- Compute score
  v_score := (v_days_in_good_standing * 1) +
             (v_successful_vouches * 50) +
             ((v_total_tips / 1000) * 2) +
             (v_booth_participations / 2) +
             (v_venue_checkins * 10);

  RETURN v_score;
END;
$$;

-- Refresh profile evolution score

CREATE OR REPLACE FUNCTION refresh_evolution_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE profiles
  SET evolution_score = get_evolution_score(NEW.id)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_refresh_evolution
  AFTER INSERT OR UPDATE ON booth_energy_log
  FOR EACH ROW EXECUTE FUNCTION refresh_evolution_score();

CREATE TRIGGER trg_refresh_evolution_transactions
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION refresh_evolution_score();
