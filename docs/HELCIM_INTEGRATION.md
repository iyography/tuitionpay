# Helcim Integration Guide

## Overview

TuitionPay uses Helcim for payment processing with a **sub-merchant architecture**. This means:

1. **TuitionPay is NOT the merchant of record** - funds flow directly to schools
2. Each school becomes a sub-merchant under the TuitionPay master account
3. Revenue share is split between Helcim, TuitionPay, and schools

## Architecture

```
Parent/Payer → TuitionPay Portal → Helcim API → School's Bank Account
                                       ↓
                              Revenue Share Split
                              - Interchange (fixed)
                              - Helcim fee
                              - TuitionPay fee (donated to school)
```

## Setup Requirements

### 1. Helcim Account Setup

1. Create a Helcim Partner account at https://www.helcim.com/partners/
2. Obtain your API credentials:
   - `HELCIM_API_KEY` - Your API key
   - `HELCIM_ACCOUNT_ID` - Your master account ID
3. Enable sub-merchant provisioning

### 2. Environment Variables

Add to `.env.local`:

```env
# Helcim API (Production)
HELCIM_API_KEY=your_api_key_here
HELCIM_ACCOUNT_ID=your_account_id_here
HELCIM_API_URL=https://api.helcim.com/v2

# Helcim API (Sandbox - for testing)
HELCIM_SANDBOX_API_KEY=your_sandbox_key
HELCIM_SANDBOX_ACCOUNT_ID=your_sandbox_account
HELCIM_SANDBOX_API_URL=https://api.sandbox.helcim.com/v2
```

### 3. School Onboarding Flow

When a school is approved:

1. Create sub-merchant account via Helcim API
2. Store `helcim_merchant_id` in `schools` table
3. Set up bank account for deposits
4. School status becomes `active`

## API Integration

### Current Implementation (Mocked)

The current implementation at `src/lib/helcim/mock.ts` simulates Helcim responses for development.

### Production Implementation

Replace the mock with real Helcim API calls:

```typescript
// src/lib/helcim/client.ts

const HELCIM_API_URL = process.env.HELCIM_API_URL || 'https://api.helcim.com/v2';
const HELCIM_API_KEY = process.env.HELCIM_API_KEY;

export async function processPayment(data: PaymentRequest): Promise<PaymentResponse> {
  const response = await fetch(`${HELCIM_API_URL}/payment/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-token': HELCIM_API_KEY!,
    },
    body: JSON.stringify({
      amount: data.amount,
      currency: data.currency || 'USD',
      accountId: data.merchantId, // Sub-merchant account
      invoiceNumber: data.invoiceNumber,
      comments: data.comments,
      // Card token from Helcim.js
      cardToken: data.cardToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Payment processing failed');
  }

  return response.json();
}

export async function createSubMerchant(data: SubMerchantData): Promise<SubMerchantResponse> {
  const response = await fetch(`${HELCIM_API_URL}/merchant/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-token': HELCIM_API_KEY!,
    },
    body: JSON.stringify({
      businessName: data.schoolName,
      contactEmail: data.contactEmail,
      bankAccount: data.bankAccount,
      // ... other required fields
    }),
  });

  return response.json();
}
```

### Helcim.js for Card Collection

For PCI compliance, use Helcim.js to tokenize card data:

```html
<script src="https://js.helcim.com/v2/helcim.js"></script>
```

```typescript
// Initialize Helcim.js
const helcim = new Helcim({
  account: 'YOUR_ACCOUNT_ID',
  token: 'YOUR_JS_TOKEN',
});

// Create card token
const { token } = await helcim.createCardToken({
  cardNumber: '4111111111111111',
  cardExpiry: '12/25',
  cardCVV: '123',
});

// Use token in payment request
await processPayment({ cardToken: token, ... });
```

## Webhook Handling

Helcim sends webhooks for payment events. The handler is at:

`src/app/api/webhooks/helcim/route.ts`

### Webhook Events

- `payment.approved` - Payment successful
- `payment.declined` - Payment declined
- `payment.refunded` - Refund processed
- `merchant.approved` - Sub-merchant approved
- `merchant.rejected` - Sub-merchant rejected

## Fee Structure

| Party | Fee | Notes |
|-------|-----|-------|
| Interchange | ~1.5-2.5% | Fixed by card networks |
| Helcim | ~0.5% | Processing fee |
| TuitionPay | ~0.5% | Donated back to school |
| **Total Parent Pays** | ~3% | Standard credit card processing |

## Testing

### Sandbox Mode

Use Helcim sandbox for testing:

```env
NEXT_PUBLIC_USE_HELCIM_SANDBOX=true
```

### Test Cards

| Card Number | Result |
|-------------|--------|
| 4111111111111111 | Approved |
| 4000000000000002 | Declined |
| 4000000000000069 | Expired card |

## Security Considerations

1. **Never store full card numbers** - Use Helcim.js tokenization
2. **Validate webhook signatures** - Prevent fraudulent webhooks
3. **Use HTTPS only** - All API calls must be encrypted
4. **Rate limit API calls** - Prevent abuse

## Going Live Checklist

- [ ] Helcim production account approved
- [ ] API keys rotated from sandbox
- [ ] Webhook URL configured in Helcim dashboard
- [ ] SSL certificate valid
- [ ] Test transaction successful
- [ ] Refund process tested
- [ ] Error handling verified
- [ ] Monitoring/alerting set up
