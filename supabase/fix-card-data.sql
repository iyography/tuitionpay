-- TuitionPay Card Data Fixes - Taylor Revisions 2/21/2026
-- Run this against the Supabase database

-- 1. Fix Delta Amex Gold Required Spend to $5,000
UPDATE credit_cards
SET signup_bonus_requirement = 'Spend $5,000'
WHERE card_name ILIKE '%delta%gold%' AND issuer ILIKE '%amex%';

-- 2. Fix Wells Fargo Autograph Journey - should be cash back, not travel
UPDATE credit_cards
SET rewards_type = 'cash_back'
WHERE card_name ILIKE '%autograph journey%';

-- 3. Fix Citi Double Cash SUB from $2 to $200
UPDATE credit_cards
SET signup_bonus_value = 200
WHERE card_name ILIKE '%double cash%' AND issuer ILIKE '%citi%';

-- 4. Verify Capital One Spark 2% Cash Plus exists (if missing, insert it)
-- Check first: SELECT * FROM credit_cards WHERE card_name ILIKE '%spark%cash%plus%';
-- If missing, add it:
INSERT INTO credit_cards (
  card_name, issuer, signup_bonus_value, signup_bonus_requirement,
  signup_bonus_timeframe, annual_fee, first_year_waived, rewards_rate,
  rewards_type, min_credit_score, is_business_card, is_active
)
SELECT
  'Capital One Spark 2% Cash Plus',
  'Capital One',
  1200,
  'Spend $30,000',
  '6 months',
  150,
  true,
  2,
  'cash_back',
  720,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM credit_cards WHERE card_name ILIKE '%spark%cash%plus%'
);
