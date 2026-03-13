-- Update referral/application URLs from Taylor's referral links (March 2026)
-- Run this against the production Supabase database

-- Chase Business Cards (all use the same referral link)
UPDATE credit_cards SET application_url = 'https://www.referyourchasecard.com/21d/H68JC4O0RD'
WHERE card_name IN (
  'Chase Ink Business Unlimited',
  'Chase Ink Business Cash',
  'Chase Ink Business Preferred',
  'Chase Ink Business Premier',
  'Chase Southwest Business Premier'
);

-- Chase Personal Cards (Sapphire, Southwest, United)
UPDATE credit_cards SET application_url = 'https://www.referyourchasecard.com/19u/WRSFMIAJ8T'
WHERE card_name IN (
  'Chase Sapphire Preferred',
  'Chase Southwest Rapid Rewards Plus',
  'Chase United Explorer'
);

-- Delta SkyMiles Gold (personal AMEX Delta Gold)
UPDATE credit_cards SET application_url = 'https://americanexpress.com/en-us/referral/delta-skymiles-gold?ref=TAYLOCCjk8&XLINK=MYCP'
WHERE card_name = 'AMEX Delta Gold';

-- AMEX Business Platinum
UPDATE credit_cards SET application_url = 'https://americanexpress.com/en-us/referral/business-platinum-charge-card?ref=TAYLOCIF9Q&XLINK=MYCP'
WHERE card_name = 'AMEX Business Platinum';

-- AMEX Business Gold
UPDATE credit_cards SET application_url = 'https://americanexpress.com/en-us/referral/businessgold-card?ref=TAYLOCnYJo&XLINK=MYCP'
WHERE card_name = 'AMEX Business Gold';

-- AMEX Blue Business Cash (Blue Business Plus referral)
UPDATE credit_cards SET application_url = 'https://americanexpress.com/en-us/referral/bluebusinessplus-credit-card?ref=TAYLOCKQKU&XLINK=MYCP'
WHERE card_name = 'AMEX Blue Business Cash';

-- Capital One (all Capital One cards use the same referral link)
UPDATE credit_cards SET application_url = 'https://i.capitalone.com/Jiqc22Y1T'
WHERE card_name IN (
  'Capital One Spark 2% Cash Plus',
  'Capital One Spark Cash',
  'Capital One Spark Cash Select'
);

-- Verify the updates
SELECT card_name, application_url FROM credit_cards ORDER BY issuer, card_name;
