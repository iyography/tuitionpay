# TuitionPay.ai Setup Guide

This guide will help you set up and run TuitionPay locally.

## Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)

## Quick Start

### 1. Install Dependencies

```bash
cd tuitionpay
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your credentials
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open the file `supabase/schema.sql`
4. Copy and paste the entire contents into the SQL Editor
5. Click "Run" to create all tables, policies, and seed data

This will create:
- All required tables (schools, students, payments, credit_cards, etc.)
- Row Level Security policies
- Sample credit card data (15 cards)
- Sample school data (5 schools)

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
tuitionpay/
├── src/
│   ├── app/
│   │   ├── (public)/           # Parent-facing pages
│   │   │   ├── optimizer/      # Card recommendation wizard
│   │   │   └── pay/            # Payment portal
│   │   ├── (admin)/            # School admin pages
│   │   │   ├── admin/          # Dashboard, transactions, etc.
│   │   │   └── login/          # Admin login
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Form components
│   │   └── layout/             # Header, footer, sidebar
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   ├── helcim/             # Payment processing (mocked)
│   │   ├── matching/           # Card recommendation engine
│   │   └── validations/        # Zod schemas
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript definitions
└── supabase/
    └── schema.sql              # Database schema
```

## Key Features

### Parent Flows

1. **Card Optimizer** (`/optimizer`)
   - 8-step assessment wizard
   - Personalized credit card recommendations
   - Savings breakdown with explanations

2. **Payment Portal** (`/pay`)
   - School selection
   - Student information
   - Mock payment processing

### School Admin Dashboard

Access at `/admin` (requires login)

- Dashboard with payment metrics
- Transaction list with search/filter/export
- Credit card catalog management
- School settings and onboarding status

## Creating Admin Users

To create a school admin user:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" and create a user with email/password
3. Run this SQL to link the user to a school:

```sql
-- Replace with actual user ID and school ID
INSERT INTO school_admins (id, school_id, email, role)
VALUES (
  'user-uuid-here',
  (SELECT id FROM schools WHERE name = 'Westwood Academy'),
  'admin@school.edu',
  'admin'
);
```

## Helcim Integration

The payment processing is currently **mocked** for development. The mock:
- Simulates payment processing with realistic delays
- Returns mock transaction IDs
- Has a 95% success rate (5% random failures)

To connect real Helcim:
1. Get API credentials from Helcim
2. Add to `.env.local`:
   ```
   HELCIM_API_KEY=your-api-key
   HELCIM_ACCOUNT_ID=your-account-id
   ```
3. The `lib/helcim/client.ts` will automatically switch to real API calls

## Customization

### Adding New Credit Cards

Use the admin interface at `/admin/cards` or insert directly:

```sql
INSERT INTO credit_cards (
  card_name, issuer, signup_bonus_value,
  signup_bonus_requirement, annual_fee,
  rewards_rate, min_credit_score, is_active
) VALUES (
  'New Card Name', 'Issuer', 500,
  'Spend $3,000', 95,
  2, 700, true
);
```

### Adding New Schools

```sql
INSERT INTO schools (name, contact_email, status, revenue_share_percentage)
VALUES ('School Name', 'admin@school.edu', 'active', 1.50);
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Development Tips

- Run `npm run build` to check for type errors
- The middleware protects `/admin/*` routes automatically
- Card recommendations are calculated in `lib/matching/card-engine.ts`
- All form validation uses Zod schemas in `lib/validations/schemas.ts`

## Troubleshooting

### "No schools found" in dropdowns
Run the seed data SQL from `supabase/schema.sql`

### Admin login not working
1. Check that the user exists in Supabase Auth
2. Verify the user is linked in `school_admins` table
3. Check browser console for errors

### Payment processing fails
Check that the payment API route is working:
```bash
curl -X POST http://localhost:3000/api/payments -H "Content-Type: application/json" -d '{}'
```

## Support

For issues or questions, check:
1. Browser console for client-side errors
2. Terminal for server-side errors
3. Supabase logs for database issues
