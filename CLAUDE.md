# TuitionPay - Project Context

## Overview
TuitionPay is a Next.js 16 tuition payment platform. Parents pay school tuition via Stripe. The app also includes a credit card optimizer tool.

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Supabase (PostgreSQL + Auth + RLS)
- Stripe (payment processing - live keys)
- shadcn/ui components, Framer Motion
- Resend for transactional emails
- Deployed on Vercel

## Production Domain
- URL: https://tuitionpay.ai
- Vercel project ID: prj_jINVJhJ0N6GOjH8syTO4FYDkavGr
- GitHub: https://github.com/iyography/tuitionpay.git

## Key Architecture
- `src/app/(public)/pay/` — Parent payment portal (4-step wizard)
- `src/app/(public)/optimizer/` — Credit card recommendation wizard
- `src/app/(admin)/` — School admin dashboard
- `src/app/(master)/` — Master admin dashboard
- `src/app/api/stripe/` — Stripe API routes (create-payment-intent, webhooks)
- `src/lib/stripe/` — Stripe client/server SDK setup
- `src/lib/supabase/` — Database client
- `supabase/schema.sql` — Full database schema

## Payment Flow
1. Parent selects school -> enters student info -> enters amount -> payment
2. StripePaymentForm calls /api/stripe/create-payment-intent
3. 3% processing fee added to all transactions
4. Webhook processes payment_intent.succeeded
5. 1.5% revenue share calculated for TuitionPay

## Environment Variables (Production)
Required on Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...)
- STRIPE_SECRET_KEY (sk_live_...)
- STRIPE_WEBHOOK_SECRET (whsec_...)
- NEXT_PUBLIC_APP_URL=https://tuitionpay.ai

## Current Status (Feb 2026)
- Stripe integration code: COMPLETE
- Stripe webhook handler: COMPLETE (uses service client for RLS bypass)
- Stripe API version: 2026-01-28.clover (SDK v20.3.1)
- Database schema: COMPLETE (stripe-migration.sql applied)
- Database types: COMPLETE (includes stripe_payment_intent_id, payment_method, stripe_account_id)
- Legacy Helcim code: REMOVED (all files deleted, all branding replaced)
- Security headers: ADDED (X-Frame-Options, X-Content-Type-Options, etc.)
- Middleware: Protects /admin, /superadmin, /master, /parent routes
- Vercel deployment: CONFIGURED (needs env vars + domain)
- Domain (tuitionpay.ai): NEEDS DNS setup pointing to Vercel
- STRIPE_WEBHOOK_SECRET: NEEDS to be set in Vercel env vars

## Dev Server
Runs on port 5001: `npm run dev`
