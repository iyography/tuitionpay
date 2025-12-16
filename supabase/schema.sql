-- TuitionPay.ai Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  helcim_merchant_id TEXT,
  bank_account_info JSONB,
  contact_email TEXT NOT NULL,
  address JSONB,
  revenue_share_percentage DECIMAL(5,2) DEFAULT 1.50,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_identifier TEXT,
  parent_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  student_id UUID REFERENCES students(id),
  amount DECIMAL(10,2) NOT NULL,
  helcim_transaction_id TEXT,
  card_last_four TEXT,
  processing_fee DECIMAL(10,2),
  revenue_share_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Cards catalog
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  signup_bonus_value DECIMAL(10,2),
  signup_bonus_requirement TEXT,
  signup_bonus_timeframe TEXT,
  annual_fee DECIMAL(10,2) DEFAULT 0,
  first_year_waived BOOLEAN DEFAULT FALSE,
  rewards_rate DECIMAL(5,2),
  rewards_type TEXT,
  category_bonuses JSONB,
  min_credit_score INTEGER,
  is_business_card BOOLEAN DEFAULT FALSE,
  application_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment responses
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  school_id UUID REFERENCES schools(id),
  student_name TEXT,
  student_identifier TEXT,
  tuition_amount DECIMAL(10,2),
  credit_score_range TEXT,
  current_cards TEXT[],
  monthly_spend_capacity DECIMAL(10,2),
  preferred_rewards_type TEXT,
  open_to_business_cards BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card recommendations shown
CREATE TABLE IF NOT EXISTS card_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessment_responses(id),
  card_id UUID REFERENCES credit_cards(id),
  card_name TEXT NOT NULL,
  estimated_savings DECIMAL(10,2),
  rank INTEGER,
  was_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- School admin users (linked to auth.users)
CREATE TABLE IF NOT EXISTS school_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- School applications (self-service onboarding)
CREATE TABLE IF NOT EXISTS school_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  school_type TEXT NOT NULL CHECK (school_type IN ('catholic', 'christian', 'private_secular', 'montessori', 'other')),
  address JSONB NOT NULL,
  contact_name TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  contact_email TEXT NOT NULL UNIQUE,
  contact_phone TEXT NOT NULL,
  estimated_students TEXT NOT NULL,
  average_tuition TEXT NOT NULL,
  current_payment_system TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'onboarding')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_school_id ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_cards_is_active ON credit_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_cards_issuer ON credit_cards(issuer);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session_id ON assessment_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_card_recommendations_assessment_id ON card_recommendations(assessment_id);
CREATE INDEX IF NOT EXISTS idx_school_admins_school_id ON school_admins(school_id);
CREATE INDEX IF NOT EXISTS idx_school_applications_status ON school_applications(status);
CREATE INDEX IF NOT EXISTS idx_school_applications_created_at ON school_applications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_applications ENABLE ROW LEVEL SECURITY;

-- Schools policies
CREATE POLICY "Public can view active schools" ON schools
  FOR SELECT USING (status = 'active');

CREATE POLICY "School admins can view their school" ON schools
  FOR SELECT USING (
    id IN (SELECT school_id FROM school_admins WHERE id = auth.uid())
  );

CREATE POLICY "School admins can update their school" ON schools
  FOR UPDATE USING (
    id IN (SELECT school_id FROM school_admins WHERE id = auth.uid())
  );

-- Students policies
CREATE POLICY "School admins can view their students" ON students
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM school_admins WHERE id = auth.uid())
  );

CREATE POLICY "Anyone can create students" ON students
  FOR INSERT WITH CHECK (TRUE);

-- Payments policies
CREATE POLICY "School admins can view their payments" ON payments
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM school_admins WHERE id = auth.uid())
  );

CREATE POLICY "Anyone can create payments" ON payments
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service role can update payments" ON payments
  FOR UPDATE USING (TRUE);

-- Credit cards policies
CREATE POLICY "Anyone can view active cards" ON credit_cards
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage cards" ON credit_cards
  FOR ALL USING (
    EXISTS (SELECT 1 FROM school_admins WHERE id = auth.uid())
  );

-- Assessment responses policies
CREATE POLICY "Anyone can create assessments" ON assessment_responses
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can view their own assessments" ON assessment_responses
  FOR SELECT USING (TRUE);

-- Card recommendations policies
CREATE POLICY "Anyone can create recommendations" ON card_recommendations
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anyone can view recommendations" ON card_recommendations
  FOR SELECT USING (TRUE);

-- School admins policies
CREATE POLICY "Admins can view their own record" ON school_admins
  FOR SELECT USING (id = auth.uid());

-- School applications policies
CREATE POLICY "Anyone can create applications" ON school_applications
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all applications" ON school_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM school_admins WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update applications" ON school_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM school_admins WHERE id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Sample Credit Cards)
-- ============================================

INSERT INTO credit_cards (card_name, issuer, signup_bonus_value, signup_bonus_requirement, signup_bonus_timeframe, annual_fee, first_year_waived, rewards_rate, rewards_type, min_credit_score, is_business_card, is_active) VALUES
-- Personal Cards
('Chase Sapphire Preferred', 'Chase', 750, 'Spend $4,000', '3 months', 95, FALSE, 2, 'travel_points', 720, FALSE, TRUE),
('Chase Sapphire Reserve', 'Chase', 600, 'Spend $4,000', '3 months', 550, FALSE, 3, 'travel_points', 750, FALSE, TRUE),
('American Express Gold', 'American Express', 600, 'Spend $6,000', '6 months', 250, FALSE, 4, 'points', 700, FALSE, TRUE),
('American Express Platinum', 'American Express', 800, 'Spend $8,000', '6 months', 695, FALSE, 5, 'travel_points', 750, FALSE, TRUE),
('Capital One Venture X', 'Capital One', 750, 'Spend $4,000', '3 months', 395, FALSE, 2, 'travel_points', 720, FALSE, TRUE),
('Capital One Venture', 'Capital One', 750, 'Spend $4,000', '3 months', 95, FALSE, 2, 'travel_points', 700, FALSE, TRUE),
('Citi Double Cash', 'Citi', 200, 'Spend $1,500', '6 months', 0, FALSE, 2, 'cash_back', 680, FALSE, TRUE),
('Chase Freedom Unlimited', 'Chase', 200, 'Spend $500', '3 months', 0, FALSE, 1.5, 'cash_back', 680, FALSE, TRUE),
('Bank of America Premium Rewards', 'Bank of America', 500, 'Spend $3,000', '3 months', 95, FALSE, 2, 'travel_points', 700, FALSE, TRUE),
('Wells Fargo Active Cash', 'Wells Fargo', 200, 'Spend $500', '3 months', 0, FALSE, 2, 'cash_back', 670, FALSE, TRUE),
('Discover it Cash Back', 'Discover', 150, 'First year cashback match', '12 months', 0, FALSE, 5, 'cash_back', 650, FALSE, TRUE),
-- Business Cards
('Chase Ink Business Preferred', 'Chase', 1000, 'Spend $8,000', '3 months', 95, FALSE, 3, 'points', 720, TRUE, TRUE),
('Chase Ink Business Unlimited', 'Chase', 750, 'Spend $6,000', '3 months', 0, FALSE, 1.5, 'cash_back', 700, TRUE, TRUE),
('American Express Business Gold', 'American Express', 700, 'Spend $10,000', '3 months', 295, FALSE, 4, 'points', 700, TRUE, TRUE),
('Capital One Spark Cash Plus', 'Capital One', 1200, 'Spend $30,000', '3 months', 150, FALSE, 2, 'cash_back', 720, TRUE, TRUE);

-- ============================================
-- SEED DATA (Sample Schools)
-- ============================================

INSERT INTO schools (name, contact_email, status, revenue_share_percentage, address) VALUES
('Westwood Academy', 'admin@westwoodacademy.edu', 'active', 1.50, '{"street": "123 Education Lane", "city": "Los Angeles", "state": "CA", "zip": "90024"}'),
('St. Mary''s Preparatory', 'billing@stmarysprep.org', 'active', 1.50, '{"street": "456 Faith Avenue", "city": "Boston", "state": "MA", "zip": "02108"}'),
('Riverside Country Day School', 'finance@riversidecds.edu', 'active', 1.50, '{"street": "789 River Road", "city": "Greenwich", "state": "CT", "zip": "06830"}'),
('The Harrington School', 'payments@harringtonschool.org', 'active', 1.50, '{"street": "321 Oak Street", "city": "San Francisco", "state": "CA", "zip": "94102"}'),
('Pacific Heights Academy', 'admin@pacificheights.edu', 'pending', 1.50, '{"street": "555 Pacific Blvd", "city": "Seattle", "state": "WA", "zip": "98101"}');
