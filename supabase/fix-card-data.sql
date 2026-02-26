-- TuitionPay Card Data Fixes - Taylor Revisions 2/21/2026
-- NOTE: signup_bonus_value is stored in POINTS format (divide by 100 for dollars)
-- e.g., $200 cash back = 20000, $1,200 = 120000, 75,000 Chase points = 75000

-- 1. Fix Delta Amex Gold Required Spend to $5,000
UPDATE credit_cards
SET signup_bonus_requirement = 'Spend $5,000'
WHERE card_name ILIKE '%delta%gold%' AND issuer ILIKE '%amex%';

-- 2. Fix Wells Fargo Autograph Journey - should be cash back, not travel
UPDATE credit_cards
SET rewards_type = 'cash_back'
WHERE card_name ILIKE '%autograph journey%';

-- 3. Fix Citi Double Cash SUB to $200 (= 20,000 in points format)
UPDATE credit_cards
SET signup_bonus_value = 20000
WHERE card_name ILIKE '%double cash%' AND issuer ILIKE '%citi%';

-- 4. Fix Capital One Spark 2% Cash Plus bonus to $1,200 (= 120,000 in points format)
UPDATE credit_cards
SET signup_bonus_value = 120000
WHERE card_name ILIKE '%spark%cash%plus%';
