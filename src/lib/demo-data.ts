// Demo data for prototype mode - works without Supabase

export const DEMO_MODE = true // Set to false when Supabase is configured

export const demoSchools = [
  {
    id: 'school-1',
    name: 'St. Mary Catholic Academy',
    helcim_merchant_id: 'DEMO-001',
    bank_account_info: { last4: '4567' },
    contact_email: 'admin@stmary.edu',
    address: {
      street: '1234 Faith Avenue',
      city: 'Detroit',
      state: 'MI',
      zip: '48201'
    },
    revenue_share_percentage: 1.50,
    status: 'active' as const,
    created_at: '2024-09-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z'
  },
  {
    id: 'school-2',
    name: 'Grace Christian School',
    helcim_merchant_id: 'DEMO-002',
    bank_account_info: { last4: '8901' },
    contact_email: 'payments@gracechristian.org',
    address: {
      street: '567 Hope Street',
      city: 'Ann Arbor',
      state: 'MI',
      zip: '48104'
    },
    revenue_share_percentage: 1.50,
    status: 'active' as const,
    created_at: '2024-10-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z'
  },
  {
    id: 'school-3',
    name: 'Montessori Academy of Detroit',
    helcim_merchant_id: 'DEMO-003',
    bank_account_info: { last4: '2345' },
    contact_email: 'billing@montessoriaod.edu',
    address: {
      street: '890 Learning Lane',
      city: 'Bloomfield Hills',
      state: 'MI',
      zip: '48302'
    },
    revenue_share_percentage: 1.50,
    status: 'active' as const,
    created_at: '2024-10-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z'
  },
  {
    id: 'school-4',
    name: 'Covenant Day School',
    helcim_merchant_id: null,
    bank_account_info: null,
    contact_email: 'info@covenantday.edu',
    address: {
      street: '456 Covenant Drive',
      city: 'Troy',
      state: 'MI',
      zip: '48083'
    },
    revenue_share_percentage: 1.50,
    status: 'pending' as const,
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z'
  },
  {
    id: 'school-5',
    name: 'Summit Preparatory School',
    helcim_merchant_id: 'DEMO-005',
    bank_account_info: { last4: '6789' },
    contact_email: 'admin@summitprep.edu',
    address: {
      street: '321 Summit Way',
      city: 'Birmingham',
      state: 'MI',
      zip: '48009'
    },
    revenue_share_percentage: 1.50,
    status: 'active' as const,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z'
  }
]

export const demoTransactions = [
  {
    id: 'txn-1',
    school_id: 'school-1',
    student_id: 'student-1',
    student_name: 'Emma Johnson',
    parent_email: 'johnson.family@email.com',
    amount: 8500.00,
    helcim_transaction_id: 'TXN-2024120101',
    card_last_four: '4242',
    processing_fee: 255.00,
    revenue_share_amount: 127.50,
    status: 'completed' as const,
    created_at: '2024-12-01T14:30:00Z',
    updated_at: '2024-12-01T14:30:00Z'
  },
  {
    id: 'txn-2',
    school_id: 'school-1',
    student_id: 'student-2',
    student_name: 'Michael Chen',
    parent_email: 'chen.parents@email.com',
    amount: 12000.00,
    helcim_transaction_id: 'TXN-2024120102',
    card_last_four: '1234',
    processing_fee: 360.00,
    revenue_share_amount: 180.00,
    status: 'completed' as const,
    created_at: '2024-12-02T09:15:00Z',
    updated_at: '2024-12-02T09:15:00Z'
  },
  {
    id: 'txn-3',
    school_id: 'school-1',
    student_id: 'student-3',
    student_name: 'Sarah Williams',
    parent_email: 'williams@email.com',
    amount: 5500.00,
    helcim_transaction_id: 'TXN-2024120501',
    card_last_four: '5678',
    processing_fee: 165.00,
    revenue_share_amount: 82.50,
    status: 'completed' as const,
    created_at: '2024-12-05T11:45:00Z',
    updated_at: '2024-12-05T11:45:00Z'
  },
  {
    id: 'txn-4',
    school_id: 'school-1',
    student_id: 'student-4',
    student_name: 'David Martinez',
    parent_email: 'martinez.d@email.com',
    amount: 9800.00,
    helcim_transaction_id: 'TXN-2024121001',
    card_last_four: '9012',
    processing_fee: 294.00,
    revenue_share_amount: 147.00,
    status: 'completed' as const,
    created_at: '2024-12-10T16:20:00Z',
    updated_at: '2024-12-10T16:20:00Z'
  },
  {
    id: 'txn-5',
    school_id: 'school-1',
    student_id: 'student-5',
    student_name: 'Emily Brown',
    parent_email: 'brown.emily@email.com',
    amount: 7200.00,
    helcim_transaction_id: null,
    card_last_four: '3456',
    processing_fee: 216.00,
    revenue_share_amount: 108.00,
    status: 'processing' as const,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 'txn-6',
    school_id: 'school-1',
    student_id: 'student-6',
    student_name: 'James Wilson',
    parent_email: 'wilson.james@email.com',
    amount: 6500.00,
    helcim_transaction_id: null,
    card_last_four: null,
    processing_fee: 195.00,
    revenue_share_amount: 97.50,
    status: 'pending' as const,
    created_at: '2024-12-16T08:30:00Z',
    updated_at: '2024-12-16T08:30:00Z'
  },
  {
    id: 'txn-7',
    school_id: 'school-1',
    student_id: 'student-7',
    student_name: 'Olivia Davis',
    parent_email: 'davis.olivia@email.com',
    amount: 4200.00,
    helcim_transaction_id: 'TXN-2024120801',
    card_last_four: '7890',
    processing_fee: 126.00,
    revenue_share_amount: 63.00,
    status: 'failed' as const,
    created_at: '2024-12-08T13:45:00Z',
    updated_at: '2024-12-08T13:45:00Z'
  }
]

export const demoApplications = [
  {
    id: 'app-1',
    school_name: 'Holy Cross Academy',
    school_type: 'catholic' as const,
    address: {
      street: '789 Cross Street',
      city: 'Livonia',
      state: 'MI',
      zip: '48150'
    },
    contact_name: 'Sister Mary Catherine',
    contact_title: 'Principal',
    contact_email: 'mcatherine@holycross.edu',
    contact_phone: '248-555-0101',
    estimated_students: '251-500',
    average_tuition: '$8,500',
    current_payment_system: 'FACTS Management',
    additional_notes: 'Looking to offer more payment options to parents.',
    status: 'pending' as const,
    reviewed_at: null,
    reviewed_by: null,
    created_at: '2024-12-14T09:00:00Z',
    updated_at: '2024-12-14T09:00:00Z'
  },
  {
    id: 'app-2',
    school_name: 'Bright Horizons Learning Center',
    school_type: 'montessori' as const,
    address: {
      street: '123 Horizon Blvd',
      city: 'Royal Oak',
      state: 'MI',
      zip: '48067'
    },
    contact_name: 'Jennifer Adams',
    contact_title: 'Director',
    contact_email: 'jadams@brighthorizons.edu',
    contact_phone: '248-555-0202',
    estimated_students: '51-100',
    average_tuition: '$12,000',
    current_payment_system: 'Manual checks and bank transfers',
    additional_notes: 'Small school, need simple solution.',
    status: 'pending' as const,
    reviewed_at: null,
    reviewed_by: null,
    created_at: '2024-12-15T14:30:00Z',
    updated_at: '2024-12-15T14:30:00Z'
  },
  {
    id: 'app-3',
    school_name: 'Faith Lutheran School',
    school_type: 'christian' as const,
    address: {
      street: '456 Luther Lane',
      city: 'Sterling Heights',
      state: 'MI',
      zip: '48310'
    },
    contact_name: 'Pastor John Miller',
    contact_title: 'School Administrator',
    contact_email: 'jmiller@faithlutheran.org',
    contact_phone: '586-555-0303',
    estimated_students: '101-250',
    average_tuition: '$7,200',
    current_payment_system: 'Blackbaud Tuition Management',
    additional_notes: null,
    status: 'approved' as const,
    reviewed_at: '2024-12-12T15:00:00Z',
    reviewed_by: 'admin-1',
    created_at: '2024-12-10T11:00:00Z',
    updated_at: '2024-12-12T15:00:00Z'
  },
  {
    id: 'app-4',
    school_name: 'Westside Private Academy',
    school_type: 'private_secular' as const,
    address: {
      street: '999 West Boulevard',
      city: 'Farmington Hills',
      state: 'MI',
      zip: '48334'
    },
    contact_name: 'Robert Thompson',
    contact_title: 'CFO',
    contact_email: 'rthompson@westsideacademy.edu',
    contact_phone: '248-555-0404',
    estimated_students: '501+',
    average_tuition: '$22,000',
    current_payment_system: 'Custom internal system',
    additional_notes: 'Large school, need API integration.',
    status: 'rejected' as const,
    reviewed_at: '2024-12-07T09:30:00Z',
    reviewed_by: 'admin-1',
    created_at: '2024-12-05T16:45:00Z',
    updated_at: '2024-12-07T09:30:00Z'
  }
]

export const demoCreditCards = [
  {
    id: 'card-1',
    card_name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    signup_bonus_value: 750,
    signup_bonus_requirement: 'Spend $4,000',
    signup_bonus_timeframe: '3 months',
    annual_fee: 95,
    first_year_waived: false,
    rewards_rate: 2,
    rewards_type: 'travel_points',
    category_bonuses: { dining: 3, travel: 2 },
    min_credit_score: 720,
    is_business_card: false,
    application_url: 'https://chase.com/sapphire-preferred',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 'card-2',
    card_name: 'American Express Gold',
    issuer: 'American Express',
    signup_bonus_value: 600,
    signup_bonus_requirement: 'Spend $6,000',
    signup_bonus_timeframe: '6 months',
    annual_fee: 250,
    first_year_waived: false,
    rewards_rate: 4,
    rewards_type: 'travel_points',
    category_bonuses: { restaurants: 4, groceries: 4 },
    min_credit_score: 700,
    is_business_card: false,
    application_url: 'https://americanexpress.com/gold',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 'card-3',
    card_name: 'Capital One Venture X',
    issuer: 'Capital One',
    signup_bonus_value: 750,
    signup_bonus_requirement: 'Spend $4,000',
    signup_bonus_timeframe: '3 months',
    annual_fee: 395,
    first_year_waived: false,
    rewards_rate: 2,
    rewards_type: 'travel_points',
    category_bonuses: null,
    min_credit_score: 740,
    is_business_card: false,
    application_url: 'https://capitalone.com/venture-x',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 'card-4',
    card_name: 'Citi Double Cash',
    issuer: 'Citi',
    signup_bonus_value: 200,
    signup_bonus_requirement: 'Spend $1,500',
    signup_bonus_timeframe: '6 months',
    annual_fee: 0,
    first_year_waived: true,
    rewards_rate: 2,
    rewards_type: 'cash_back',
    category_bonuses: null,
    min_credit_score: 680,
    is_business_card: false,
    application_url: 'https://citi.com/double-cash',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 'card-5',
    card_name: 'Chase Ink Business Preferred',
    issuer: 'Chase',
    signup_bonus_value: 1000,
    signup_bonus_requirement: 'Spend $8,000',
    signup_bonus_timeframe: '3 months',
    annual_fee: 95,
    first_year_waived: false,
    rewards_rate: 3,
    rewards_type: 'travel_points',
    category_bonuses: { travel: 3, shipping: 3, advertising: 3 },
    min_credit_score: 720,
    is_business_card: true,
    application_url: 'https://chase.com/ink-business-preferred',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 'card-6',
    card_name: 'Blue Business Plus',
    issuer: 'American Express',
    signup_bonus_value: 150,
    signup_bonus_requirement: 'Spend $3,000',
    signup_bonus_timeframe: '3 months',
    annual_fee: 0,
    first_year_waived: true,
    rewards_rate: 2,
    rewards_type: 'travel_points',
    category_bonuses: null,
    min_credit_score: 670,
    is_business_card: true,
    application_url: 'https://americanexpress.com/blue-business-plus',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 'card-7',
    card_name: 'Discover it Cash Back',
    issuer: 'Discover',
    signup_bonus_value: 150,
    signup_bonus_requirement: 'Cashback Match first year',
    signup_bonus_timeframe: '12 months',
    annual_fee: 0,
    first_year_waived: true,
    rewards_rate: 1,
    rewards_type: 'cash_back',
    category_bonuses: { rotating: 5 },
    min_credit_score: 650,
    is_business_card: false,
    application_url: 'https://discover.com/it-cash-back',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  },
  {
    id: 'card-8',
    card_name: 'Wells Fargo Active Cash',
    issuer: 'Wells Fargo',
    signup_bonus_value: 200,
    signup_bonus_requirement: 'Spend $500',
    signup_bonus_timeframe: '3 months',
    annual_fee: 0,
    first_year_waived: true,
    rewards_rate: 2,
    rewards_type: 'cash_back',
    category_bonuses: null,
    min_credit_score: 670,
    is_business_card: false,
    application_url: 'https://wellsfargo.com/active-cash',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z'
  }
]

export const demoStudents = [
  { id: 'student-1', school_id: 'school-1', student_name: 'Emma Johnson', student_identifier: 'STU-001', parent_email: 'johnson.family@email.com' },
  { id: 'student-2', school_id: 'school-1', student_name: 'Michael Chen', student_identifier: 'STU-002', parent_email: 'chen.parents@email.com' },
  { id: 'student-3', school_id: 'school-1', student_name: 'Sarah Williams', student_identifier: 'STU-003', parent_email: 'williams@email.com' },
  { id: 'student-4', school_id: 'school-1', student_name: 'David Martinez', student_identifier: 'STU-004', parent_email: 'martinez.d@email.com' },
  { id: 'student-5', school_id: 'school-1', student_name: 'Emily Brown', student_identifier: 'STU-005', parent_email: 'brown.emily@email.com' },
  { id: 'student-6', school_id: 'school-1', student_name: 'James Wilson', student_identifier: 'STU-006', parent_email: 'wilson.james@email.com' },
  { id: 'student-7', school_id: 'school-1', student_name: 'Olivia Davis', student_identifier: 'STU-007', parent_email: 'davis.olivia@email.com' },
]

// Demo admin user
export const demoAdmin = {
  id: 'admin-1',
  email: 'demo@tuitionpay.ai',
  school_id: 'school-1',
  role: 'admin' as const
}

// Helper to get school by ID
export function getDemoSchool(id: string) {
  return demoSchools.find(s => s.id === id) || demoSchools[0]
}

// Helper to get active schools only
export function getActiveDemoSchools() {
  return demoSchools.filter(s => s.status === 'active')
}

// Helper to get transactions for a school
export function getDemoTransactionsForSchool(schoolId: string) {
  return demoTransactions.filter(t => t.school_id === schoolId)
}

// Calculate demo metrics
export function getDemoMetrics(schoolId: string) {
  const schoolTransactions = getDemoTransactionsForSchool(schoolId)
  const completedPayments = schoolTransactions.filter(t => t.status === 'completed')
  const pendingPayments = schoolTransactions.filter(t => t.status === 'pending' || t.status === 'processing')
  const students = demoStudents.filter(s => s.school_id === schoolId)

  return {
    totalPayments: completedPayments.length,
    totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: pendingPayments.length,
    revenueShare: completedPayments.reduce((sum, p) => sum + (p.revenue_share_amount || 0), 0),
    studentCount: students.length
  }
}
