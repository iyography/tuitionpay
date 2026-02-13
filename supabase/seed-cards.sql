-- Real Credit Card Database for TuitionPay
-- Based on actual card data provided
-- Run this in Supabase SQL Editor to update cards

-- Clear existing cards
DELETE FROM credit_cards;

-- ============================================
-- BUSINESS CARDS
-- ============================================

INSERT INTO credit_cards (
  card_name, issuer, signup_bonus_value, signup_bonus_requirement,
  signup_bonus_timeframe, annual_fee, first_year_waived, rewards_rate,
  rewards_type, min_credit_score, is_business_card, is_active,
  category_bonuses
) VALUES

-- AMEX Business Cards
('AMEX Business Platinum', 'American Express', 2400, 'Spend $20,000', '3 months', 895, FALSE, 2, 'points', 720, TRUE, TRUE,
 '{"travel": 5, "flights": 5, "hotels": 1}'::jsonb),

('AMEX Business Gold', 'American Express', 1150, 'Spend $15,000', '3 months', 395, FALSE, 4, 'points', 700, TRUE, TRUE,
 '{"restaurants": 4, "shipping": 4, "advertising": 4, "technology": 4}'::jsonb),

('AMEX Blue Business Cash', 'American Express', 310, 'Spend $3,000', '3 months', 0, FALSE, 2, 'cash_back', 670, TRUE, TRUE,
 '{"all_purchases": 2}'::jsonb),

('AMEX Delta Gold Business', 'American Express', 600, 'Spend $4,000', '3 months', 0, FALSE, 2, 'miles', 680, TRUE, TRUE,
 '{"delta": 2, "restaurants": 2}'::jsonb),

('AMEX Marriott Bonvoy Business', 'American Express', 543, 'Spend $9,000', '3 months', 125, FALSE, 6, 'points', 700, TRUE, TRUE,
 '{"marriott": 6, "all_purchases": 2}'::jsonb),

-- Capital One Business Cards
('Capital One Spark 2% Cash Plus', 'Capital One', 2450, 'Spend $30,000', '3 months', 150, FALSE, 2, 'cash_back', 720, TRUE, TRUE,
 '{"all_purchases": 2}'::jsonb),

('Capital One Spark Cash', 'Capital One', 1200, 'Spend $10,000', '3 months', 0, FALSE, 2, 'cash_back', 700, TRUE, TRUE,
 '{"all_purchases": 2}'::jsonb),

('Capital One Cash Select', 'Capital One', 840, 'Spend $6,000', '3 months', 0, FALSE, 1.5, 'cash_back', 680, TRUE, TRUE,
 '{"all_purchases": 1.5}'::jsonb),

-- Chase Business Cards
('Chase Ink Business Unlimited', 'Chase', 840, 'Spend $6,000', '3 months', 0, FALSE, 1.5, 'cash_back', 700, TRUE, TRUE,
 '{"all_purchases": 1.5}'::jsonb),

('Chase Ink Business Cash', 'Chase', 840, 'Spend $6,000', '3 months', 0, FALSE, 5, 'cash_back', 700, TRUE, TRUE,
 '{"office_supplies": 5, "internet": 5, "phone": 5, "all_purchases": 1}'::jsonb),

('Chase Ink Business Preferred', 'Chase', 1100, 'Spend $10,000', '3 months', 95, FALSE, 3, 'points', 720, TRUE, TRUE,
 '{"travel": 3, "shipping": 3, "advertising": 3, "internet": 3}'::jsonb),

('Chase Ink Business Premier', 'Chase', 1250, 'Spend $10,000', '3 months', 195, FALSE, 2.5, 'points', 720, TRUE, TRUE,
 '{"all_purchases": 2.5}'::jsonb),

('Chase Southwest Business Premier', 'Chase', 706, 'Spend $3,000', '3 months', 149, FALSE, 2, 'points', 700, TRUE, TRUE,
 '{"southwest": 3, "rapid_rewards": 2}'::jsonb),

-- Wells Fargo Business Cards
('Wells Fargo Business Elite', 'Wells Fargo', 1000, 'Spend $5,000', '3 months', 0, FALSE, 1.5, 'cash_back', 700, TRUE, TRUE,
 '{"all_purchases": 1.5}'::jsonb),

('Wells Fargo Active Cash Business', 'Wells Fargo', 750, 'Spend $5,000', '3 months', 0, FALSE, 2, 'cash_back', 680, TRUE, TRUE,
 '{"all_purchases": 2}'::jsonb),

-- ============================================
-- PERSONAL CARDS
-- ============================================

('Chase Sapphire Preferred', 'Chase', 800, 'Spend $5,000', '3 months', 95, FALSE, 3, 'points', 720, FALSE, TRUE,
 '{"travel": 3, "dining": 3, "streaming": 3, "groceries": 3}'::jsonb),

('Chase Southwest Rapid Rewards Plus', 'Chase', 636, 'Spend $1,000', '3 months', 99, FALSE, 2, 'points', 700, FALSE, TRUE,
 '{"southwest": 2, "rapid_rewards": 2}'::jsonb),

('Chase United Explorer', 'Chase', 666, 'Spend $3,000', '3 months', 0, TRUE, 2, 'miles', 700, FALSE, TRUE,
 '{"united": 2, "travel": 2}'::jsonb),

('AMEX Blue Cash Everyday', 'American Express', 160, 'Spend $2,000', '3 months', 0, FALSE, 3, 'cash_back', 670, FALSE, TRUE,
 '{"groceries": 3, "gas": 2, "online": 3}'::jsonb),

('AMEX Delta Gold', 'American Express', 900, 'Spend $5,000', '3 months', 0, TRUE, 2, 'miles', 680, FALSE, TRUE,
 '{"delta": 2, "restaurants": 2}'::jsonb),

('Citi AAdvantage Platinum Select', 'Citi', 607, 'Spend $2,500', '3 months', 0, TRUE, 2, 'miles', 700, FALSE, TRUE,
 '{"american_airlines": 2, "gas": 2, "restaurants": 2}'::jsonb),

('Citi Double Cash', 'Citi', 230, 'Spend $1,500', '6 months', 0, FALSE, 2, 'cash_back', 680, FALSE, TRUE,
 '{"all_purchases": 2}'::jsonb);

-- Update notes/benefits column if it exists, or add it
-- First check if the column exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'credit_cards' AND column_name = 'benefits') THEN
    ALTER TABLE credit_cards ADD COLUMN benefits TEXT;
  END IF;
END $$;

-- Update benefits for key cards
UPDATE credit_cards SET benefits = '$600 AMEX Travel Hotel Credit, $200 Hilton Credit, $150 Dell Credit, $120 Cell Phone Credit'
WHERE card_name = 'AMEX Business Platinum';

UPDATE credit_cards SET benefits = '$250 Flexible Business Credit (GrubHub, Office Supplies)'
WHERE card_name = 'AMEX Business Gold';

UPDATE credit_cards SET benefits = '15% off Mile Redemption flights, First checked bag free'
WHERE card_name = 'AMEX Delta Gold Business';

UPDATE credit_cards SET benefits = '15% off Mile Redemption flights, First checked bag free'
WHERE card_name = 'AMEX Delta Gold';

UPDATE credit_cards SET benefits = '$50 Chase Travel Hotel Credit, Free DashPass'
WHERE card_name = 'Chase Sapphire Preferred';

UPDATE credit_cards SET benefits = 'First Checked Bag Free, Companion Pass eligible'
WHERE card_name LIKE '%Southwest%';

UPDATE credit_cards SET benefits = 'First Checked Bag Free, Priority Boarding'
WHERE card_name = 'Chase United Explorer';

UPDATE credit_cards SET benefits = 'First Checked Bag Free, Priority Boarding'
WHERE card_name = 'Citi AAdvantage Platinum Select';

UPDATE credit_cards SET benefits = '$7/mo Disney, Hulu, or ESPN Annual Credit'
WHERE card_name = 'AMEX Blue Cash Everyday';

-- Verify the data
SELECT card_name, issuer, signup_bonus_value, annual_fee, rewards_rate, is_business_card
FROM credit_cards
ORDER BY is_business_card DESC, signup_bonus_value DESC;
