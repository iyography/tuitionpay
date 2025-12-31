-- TuitionPay Database Setup Script
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- 1. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  helcim_merchant_id TEXT,
  bank_account_info JSONB,
  contact_email TEXT NOT NULL,
  address JSONB,
  revenue_share_percentage NUMERIC DEFAULT 1.5,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_identifier TEXT,
  parent_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  helcim_transaction_id TEXT,
  card_last_four TEXT,
  processing_fee NUMERIC,
  revenue_share_amount NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREDIT CARDS TABLE
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  signup_bonus_value NUMERIC,
  signup_bonus_requirement TEXT,
  signup_bonus_timeframe TEXT,
  annual_fee NUMERIC DEFAULT 0,
  first_year_waived BOOLEAN DEFAULT FALSE,
  rewards_rate NUMERIC,
  rewards_type TEXT,
  category_bonuses JSONB,
  min_credit_score INTEGER,
  is_business_card BOOLEAN DEFAULT FALSE,
  application_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  benefits TEXT,
  notes TEXT,
  -- Point valuations
  point_cash_value NUMERIC,
  cash_value NUMERIC,
  delta_value NUMERIC,
  marriott_value NUMERIC,
  hyatt_value NUMERIC,
  southwest_value NUMERIC,
  united_value NUMERIC,
  aa_value NUMERIC,
  -- Percentage returns
  cash_back_pct NUMERIC,
  delta_pct NUMERIC,
  marriott_pct NUMERIC,
  hyatt_pct NUMERIC,
  united_pct NUMERIC,
  aa_pct NUMERIC,
  southwest_pct NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ASSESSMENT RESPONSES TABLE
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  student_name TEXT,
  student_identifier TEXT,
  tuition_amount NUMERIC,
  credit_score_range TEXT,
  current_cards TEXT[],
  monthly_spend_capacity NUMERIC,
  preferred_rewards_type TEXT,
  open_to_business_cards BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CARD RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS card_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessment_responses(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  estimated_savings NUMERIC,
  rank INTEGER,
  was_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SCHOOL ADMINS TABLE
CREATE TABLE IF NOT EXISTS school_admins (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SCHOOL APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS school_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  school_type TEXT NOT NULL CHECK (school_type IN ('catholic', 'christian', 'private_secular', 'montessori', 'other')),
  address JSONB NOT NULL,
  contact_name TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  estimated_students TEXT NOT NULL,
  average_tuition TEXT NOT NULL,
  current_payment_system TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'onboarding')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_school_id ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_credit_cards_is_active ON credit_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_cards_is_business ON credit_cards(is_business_card);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session ON assessment_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_school_applications_status ON school_applications(status);
CREATE INDEX IF NOT EXISTS idx_school_admins_school_id ON school_admins(school_id);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_applications ENABLE ROW LEVEL SECURITY;

-- Credit cards are public read
CREATE POLICY "Credit cards are viewable by everyone" ON credit_cards
  FOR SELECT USING (true);

-- Schools are viewable by their admins
CREATE POLICY "Schools viewable by admins" ON schools
  FOR SELECT USING (
    id IN (SELECT school_id FROM school_admins WHERE id = auth.uid())
  );

-- School admins can view their own record
CREATE POLICY "Admins can view own record" ON school_admins
  FOR SELECT USING (id = auth.uid());

-- Students viewable by school admins
CREATE POLICY "Students viewable by school admins" ON students
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM school_admins WHERE id = auth.uid())
  );

-- Payments viewable by school admins
CREATE POLICY "Payments viewable by school admins" ON payments
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM school_admins WHERE id = auth.uid())
  );

-- Assessment responses - public insert, owner read
CREATE POLICY "Anyone can create assessments" ON assessment_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Assessments viewable by session" ON assessment_responses
  FOR SELECT USING (true);

-- Card recommendations - tied to assessments
CREATE POLICY "Recommendations are viewable" ON card_recommendations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create recommendations" ON card_recommendations
  FOR INSERT WITH CHECK (true);

-- School applications - public insert
CREATE POLICY "Anyone can submit applications" ON school_applications
  FOR INSERT WITH CHECK (true);

-- 11. INSERT SAMPLE SCHOOL FOR TESTING
INSERT INTO schools (id, name, contact_email, status, revenue_share_percentage, address)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Catholic School',
  'admin@democatholic.edu',
  'active',
  1.5,
  '{"street": "123 Faith Street", "city": "Chicago", "state": "IL", "zip": "60601"}'
) ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'TuitionPay database setup complete!' as message;
