-- Add Stripe fields to payments table
-- Run this in Supabase SQL Editor

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'stripe';

-- Update schools table to support Stripe
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;