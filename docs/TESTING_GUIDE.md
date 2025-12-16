# TuitionPay Testing Guide

This guide walks you through testing every page and feature of the TuitionPay platform.

---

## Prerequisites

### 1. Start the Development Server

```bash
cd ~/Desktop/tuitionpay
npm run dev -- -p 3001
```

The app will be available at: **http://localhost:3001**

### 2. Set Up Supabase (Required for Full Testing)

Without Supabase, you'll see loading states and errors. To fully test:

1. Create a free account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase/schema.sql`
4. Go to Project Settings → API and copy your credentials
5. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

6. Restart the dev server

### 3. Create a Test Admin User

In Supabase:
1. Go to Authentication → Users
2. Click "Add User" → "Create New User"
3. Enter email and password
4. Then run this SQL to link them to a school:

```sql
-- Get a school ID first
SELECT id, name FROM schools LIMIT 1;

-- Then create the admin (replace values)
INSERT INTO school_admins (id, school_id, email, role)
VALUES (
  'your-user-uuid-from-auth',
  'school-uuid-from-above',
  'your@email.com',
  'admin'
);
```

---

## Testing Walkthrough

### Page 1: Landing Page

**URL:** http://localhost:3001

**What to Test:**
- [ ] Page loads with animated mesh gradient background
- [ ] Floating blob animations are visible
- [ ] Header appears and becomes frosted glass on scroll
- [ ] "See How Much You Can Save" button works
- [ ] "Already Have a Card? Pay Now" button works
- [ ] Scroll down - animations trigger on each section
- [ ] "How It Works" section shows 4 steps
- [ ] Stats cards display with gradient text
- [ ] "For Schools" section shows "Apply to Partner" button
- [ ] Final purple CTA section displays correctly
- [ ] Footer links all work
- [ ] Mobile: Test hamburger menu on narrow viewport

**Expected Behavior:**
- Smooth animations throughout
- All content centered properly
- No overlapping elements

---

### Page 2: Card Optimizer Start

**URL:** http://localhost:3001/optimizer

**What to Test:**
- [ ] Page loads with icon and description
- [ ] "What to Expect" card shows 3 items
- [ ] "Start Assessment" button works
- [ ] "Make a payment" link at bottom works

---

### Page 3: Card Optimizer Wizard (8 Steps)

**URL:** http://localhost:3001/optimizer/1

**Step 1 - Select School:**
- [ ] School dropdown loads (requires Supabase)
- [ ] Search/filter works
- [ ] Selecting a school enables "Continue" button
- [ ] Progress bar shows step 1 of 8

**Step 2 - Student Info:**
**URL:** http://localhost:3001/optimizer/2
- [ ] Student name field validates (min 2 chars)
- [ ] Student ID is optional
- [ ] Back button works
- [ ] Continue button works

**Step 3 - Tuition Amount:**
**URL:** http://localhost:3001/optimizer/3
- [ ] Amount input works
- [ ] Validates min $100, max $100,000
- [ ] Shows formatted currency

**Step 4 - Credit Score:**
**URL:** http://localhost:3001/optimizer/4
- [ ] Four options display: Excellent, Good, Fair, Below Average
- [ ] Radio selection works
- [ ] Descriptions show for each

**Step 5 - Current Cards:**
**URL:** http://localhost:3001/optimizer/5
- [ ] Common card checkboxes display
- [ ] Multiple selection works
- [ ] "None of these" or skip works

**Step 6 - Monthly Spend:**
**URL:** http://localhost:3001/optimizer/6
- [ ] Spend capacity slider/input works
- [ ] Shows formatted amount

**Step 7 - Rewards Preference:**
**URL:** http://localhost:3001/optimizer/7
- [ ] Four options: Cash Back, Travel, Statement Credits, Flexible
- [ ] Selection enables continue

**Step 8 - Business Cards:**
**URL:** http://localhost:3001/optimizer/8
- [ ] Yes/No toggle works
- [ ] "See My Results" button appears (not "Continue")
- [ ] Submits and redirects to results

---

### Page 4: Results Page

**URL:** http://localhost:3001/optimizer/results

**What to Test:**
- [ ] Shows personalized header with school name and tuition
- [ ] Summary card shows estimated savings
- [ ] Top 3 card recommendations display
- [ ] Each card shows: signup bonus, rewards rate, annual fee, your savings
- [ ] "Best Match" badge on #1 card
- [ ] Business card badge shows if applicable
- [ ] "How we calculated" collapsible works
- [ ] "Learn More" buttons link out
- [ ] "Next Steps" section shows 4 steps
- [ ] "Ready to Pay Now" button works

---

### Page 5: Payment Portal

**URL:** http://localhost:3001/pay

**Step 1 - Select School:**
- [ ] School dropdown loads
- [ ] Selection works

**Step 2 - Student Info:**
- [ ] Student name required
- [ ] Student ID optional
- [ ] Parent email required (with validation)

**Step 3 - Payment Amount:**
- [ ] Amount input works
- [ ] Shows processing fee calculation
- [ ] Shows total to be charged

**Step 4 - Payment Form:**
- [ ] Card number field (mock - any 16 digits)
- [ ] Expiry field
- [ ] CVV field
- [ ] Cardholder name field
- [ ] "Pay Now" button processes payment
- [ ] Loading state during processing
- [ ] Redirects to confirmation on success

---

### Page 6: Payment Confirmation

**URL:** http://localhost:3001/pay/confirmation?transactionId=TXN-123

**What to Test:**
- [ ] Success checkmark animation
- [ ] Transaction ID displays
- [ ] Receipt summary shows
- [ ] "What's Next" steps display
- [ ] "Return Home" button works
- [ ] "Make Another Payment" button works

---

### Page 7: School Partner Application

**URL:** http://localhost:3001/partner

**What to Test:**
- [ ] Hero section with benefits displays
- [ ] 4 benefit cards show with icons
- [ ] Application form sections:
  - [ ] School Information (name, type, address)
  - [ ] Contact Information (name, title, email, phone)
  - [ ] School Details (students, tuition, current system)
- [ ] Form validation works (try submitting empty)
- [ ] Submit button shows loading state
- [ ] Success screen shows after submission
- [ ] "What happens next" steps display

---

### Page 8: Admin Login

**URL:** http://localhost:3001/login

**What to Test:**
- [ ] Email and password fields work
- [ ] "Sign In" button attempts authentication
- [ ] Error message shows for wrong credentials
- [ ] Successful login redirects to /admin
- [ ] "Back to home" link works

**Test Credentials:** (after setting up Supabase auth)
- Email: your test email
- Password: your test password

---

### Page 9: Admin Dashboard

**URL:** http://localhost:3001/admin

**Requires:** Logged in admin user

**What to Test:**
- [ ] Sidebar navigation shows all links
- [ ] Sidebar collapse/expand works
- [ ] Dashboard metrics display:
  - [ ] Total Payments
  - [ ] Revenue Share
  - [ ] Processing Fees
  - [ ] Pending Payments
- [ ] Recent transactions table shows
- [ ] Quick actions or stats cards display

---

### Page 10: Admin - Applications

**URL:** http://localhost:3001/admin/applications

**What to Test:**
- [ ] Table shows all school applications
- [ ] Status badges (Pending, Approved, Rejected)
- [ ] "View" button opens detail modal
- [ ] Modal shows all application info:
  - [ ] School name and type
  - [ ] Contact info with email/phone links
  - [ ] Address
  - [ ] Student count and tuition
  - [ ] Current payment system
  - [ ] Additional notes
- [ ] "Approve" button creates school and updates status
- [ ] "Reject" button updates status
- [ ] Table refreshes after action

---

### Page 11: Admin - Transactions

**URL:** http://localhost:3001/admin/transactions

**What to Test:**
- [ ] Transaction table loads
- [ ] Columns: Date, Student, Amount, Fee, Status
- [ ] Status badges (Completed, Pending, Failed)
- [ ] Pagination works (if many records)
- [ ] Search/filter works
- [ ] Export to CSV button works

---

### Page 12: Admin - Credit Cards

**URL:** http://localhost:3001/admin/cards

**What to Test:**
- [ ] Credit card table loads with seed data
- [ ] Shows: Card Name, Issuer, Bonus, Fee, Rewards, Status
- [ ] "Add Card" button opens form modal
- [ ] Add new card form:
  - [ ] Card name, issuer
  - [ ] Signup bonus value/requirement/timeframe
  - [ ] Annual fee, first year waived toggle
  - [ ] Rewards rate and type
  - [ ] Min credit score
  - [ ] Business card toggle
  - [ ] Application URL
  - [ ] Active toggle
- [ ] Edit existing card works
- [ ] Toggle active/inactive works
- [ ] Delete card works (with confirmation)

---

### Page 13: Admin - Settings

**URL:** http://localhost:3001/admin/settings

**What to Test:**
- [ ] School profile info displays
- [ ] Helcim integration status shows
- [ ] Onboarding checklist items display
- [ ] Contact info section shows

---

## API Endpoints Testing

You can test these with curl or Postman:

### POST /api/recommendations
```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "uuid-here",
    "schoolName": "Test School",
    "studentName": "John Doe",
    "tuitionAmount": 15000,
    "creditScoreRange": "excellent",
    "currentCards": [],
    "monthlySpendCapacity": 5000,
    "preferredRewardsType": "travel_points",
    "openToBusinessCards": true
  }'
```

### POST /api/payments
```bash
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": "uuid-here",
    "studentName": "John Doe",
    "parentEmail": "parent@email.com",
    "amount": 5000
  }'
```

### POST /api/schools/apply
```bash
curl -X POST http://localhost:3001/api/schools/apply \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Test Academy",
    "schoolType": "private_secular",
    "address": "123 Main St",
    "city": "Detroit",
    "state": "MI",
    "zipCode": "48201",
    "contactName": "Jane Smith",
    "contactTitle": "Business Manager",
    "contactEmail": "jane@test.edu",
    "contactPhone": "313-555-0100",
    "estimatedStudents": "101-250",
    "averageTuition": "$12,000"
  }'
```

---

## Mobile Testing

Test all pages on mobile viewport (375px width):

1. Open Chrome DevTools (F12)
2. Click the device toggle icon
3. Select "iPhone 12 Pro" or similar
4. Navigate through all pages

**Check for:**
- [ ] No horizontal scrolling
- [ ] Text is readable
- [ ] Buttons are tappable (min 44px)
- [ ] Forms are usable
- [ ] Modals don't overflow
- [ ] Navigation menu works

---

## Edge Cases to Test

1. **Empty States:**
   - No schools in database
   - No transactions
   - No applications

2. **Validation:**
   - Submit forms with empty fields
   - Enter invalid email formats
   - Enter tuition outside min/max
   - Enter negative numbers

3. **Error Handling:**
   - Disconnect from internet during payment
   - Invalid session on results page
   - Expired auth token

4. **Performance:**
   - Load with slow 3G network
   - Check for layout shifts
   - Verify images lazy load

---

## Quick Test Checklist

### Parent Flow (No Auth Required)
- [ ] Home → Optimizer → Complete 8 steps → Results
- [ ] Home → Pay → Complete payment → Confirmation
- [ ] Home → Partner → Submit application

### Admin Flow (Auth Required)
- [ ] Login → Dashboard
- [ ] Review application → Approve
- [ ] View transactions
- [ ] Add/edit credit card
- [ ] Check settings
- [ ] Sign out

---

## Troubleshooting

**"Supabase client error"**
- Check `.env.local` has correct credentials
- Restart dev server after env changes

**"No schools found"**
- Run the seed data SQL in Supabase

**"Cannot login"**
- Create user in Supabase Auth
- Link to school_admins table

**"Page not loading"**
- Check terminal for errors
- Clear browser cache
- Try incognito mode

---

## Next Steps After Testing

1. Report any bugs found
2. Note UX improvements needed
3. Set up Supabase production project
4. Configure real Helcim account
5. Deploy to Vercel
