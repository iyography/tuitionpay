-- TuitionPay Card Data Migration — March 2026
-- Converts ALL signup_bonus_value from dollar format to POINTS FORMAT
-- Points format: (value * multiplier) / 100 = dollar amount
-- Run this in Supabase SQL Editor

-- ============================================
-- BUSINESS CARDS
-- ============================================

-- AMEX Business Platinum: 200,000 MR points
UPDATE credit_cards SET signup_bonus_value = 200000
WHERE card_name = 'AMEX Business Platinum';

-- AMEX Business Gold: 100,000 MR points
UPDATE credit_cards SET signup_bonus_value = 100000
WHERE card_name = 'AMEX Business Gold';

-- AMEX Blue Business Cash: $250 cash = 25000
UPDATE credit_cards SET signup_bonus_value = 25000
WHERE card_name = 'AMEX Blue Business Cash';

-- AMEX Delta Gold Business: 60,000 Delta miles
UPDATE credit_cards SET signup_bonus_value = 60000
WHERE card_name = 'AMEX Delta Gold Business';

-- AMEX Marriott Bonvoy Business: 125,000 Marriott points
UPDATE credit_cards SET signup_bonus_value = 125000
WHERE card_name = 'AMEX Marriott Bonvoy Business';

-- Capital One Spark 2% Cash Plus: $2,000 cash = 200000
UPDATE credit_cards SET signup_bonus_value = 200000
WHERE card_name = 'Capital One Spark 2% Cash Plus';

-- Capital One Spark Cash: $1,000 cash = 100000
UPDATE credit_cards SET signup_bonus_value = 100000
WHERE card_name = 'Capital One Spark Cash';

-- Capital One Cash Select: $750 cash = 75000
UPDATE credit_cards SET signup_bonus_value = 75000
WHERE card_name = 'Capital One Cash Select';

-- Chase Ink Business Unlimited: 75,000 UR points
UPDATE credit_cards SET signup_bonus_value = 75000
WHERE card_name = 'Chase Ink Business Unlimited';

-- Chase Ink Business Cash: 75,000 UR points
UPDATE credit_cards SET signup_bonus_value = 75000
WHERE card_name = 'Chase Ink Business Cash';

-- Chase Ink Business Preferred: 100,000 UR points
UPDATE credit_cards SET signup_bonus_value = 100000
WHERE card_name = 'Chase Ink Business Preferred';

-- Chase Ink Business Premier: 100,000 UR points → treated as cash only per client rules
UPDATE credit_cards SET signup_bonus_value = 100000, rewards_type = 'cash_back'
WHERE card_name = 'Chase Ink Business Premier';

-- Chase Southwest Business Premier: 60,000 SW points
UPDATE credit_cards SET signup_bonus_value = 60000
WHERE card_name = 'Chase Southwest Business Premier';

-- Wells Fargo Business Elite: $1,000 cash = 100000
UPDATE credit_cards SET signup_bonus_value = 100000
WHERE card_name = 'Wells Fargo Business Elite';

-- Wells Fargo Active Cash Business: $750 cash = 75000
UPDATE credit_cards SET signup_bonus_value = 75000
WHERE card_name = 'Wells Fargo Active Cash Business';

-- ============================================
-- PERSONAL CARDS
-- ============================================

-- Chase Sapphire Preferred: 75,000 UR points
UPDATE credit_cards SET signup_bonus_value = 75000
WHERE card_name = 'Chase Sapphire Preferred';

-- Chase Southwest Rapid Rewards Plus: 50,000 SW points
UPDATE credit_cards SET signup_bonus_value = 50000
WHERE card_name = 'Chase Southwest Rapid Rewards Plus';

-- Chase United Explorer: 60,000 United miles
UPDATE credit_cards SET signup_bonus_value = 60000
WHERE card_name = 'Chase United Explorer';

-- AMEX Blue Cash Everyday: $200 cash = 20000
UPDATE credit_cards SET signup_bonus_value = 20000
WHERE card_name = 'AMEX Blue Cash Everyday';

-- AMEX Delta Gold: 50,000 Delta miles
UPDATE credit_cards SET signup_bonus_value = 50000
WHERE card_name = 'AMEX Delta Gold';

-- Citi AAdvantage Platinum Select: 50,000 AA miles
UPDATE credit_cards SET signup_bonus_value = 50000
WHERE card_name = 'Citi AAdvantage Platinum Select';

-- Citi Double Cash: $200 cash = 20000
UPDATE credit_cards SET signup_bonus_value = 20000
WHERE card_name = 'Citi Double Cash';

-- ============================================
-- VERIFY
-- ============================================
SELECT card_name, issuer, signup_bonus_value, rewards_type, is_business_card,
  ROUND(signup_bonus_value / 100.0, 2) as "approx_cash_value"
FROM credit_cards
ORDER BY is_business_card DESC, signup_bonus_value DESC;
