import type { HelcimCheckoutSession } from './types'

const HELCIM_API_URL = 'https://api.helcim.com/v2'

// Check if we should use mock mode
const USE_MOCK = !process.env.HELCIM_API_TOKEN

interface CreateCheckoutParams {
  amount: number
  currency?: string
  paymentType?: 'purchase' | 'preauth'
  customerCode?: string
  invoiceNumber?: string
  companyName?: string
  customerName?: string
  customerEmail?: string
}

/**
 * Generate mock checkout session for development/demo
 */
function createMockCheckoutSession(): HelcimCheckoutSession {
  const timestamp = Date.now()
  return {
    checkoutToken: `mock-checkout-${timestamp}-${Math.random().toString(36).substring(2, 10)}`,
    secretToken: `mock-secret-${timestamp}-${Math.random().toString(36).substring(2, 10)}`,
  }
}

/**
 * Create a HelcimPay.js checkout session
 * This generates a secure token for client-side payment collection
 * Falls back to mock mode if HELCIM_API_TOKEN is not configured
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<HelcimCheckoutSession> {
  // Use mock mode in development or when API token is not set
  if (USE_MOCK) {
    console.log('Helcim: Using mock checkout session (API token not configured)')
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return createMockCheckoutSession()
  }

  const apiToken = process.env.HELCIM_API_TOKEN!

  const response = await fetch(`${HELCIM_API_URL}/helcim-pay/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-token': apiToken,
    },
    body: JSON.stringify({
      paymentType: params.paymentType || 'purchase',
      amount: params.amount,
      currency: params.currency || 'USD',
      customerCode: params.customerCode,
      invoiceNumber: params.invoiceNumber,
      companyName: params.companyName,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Helcim checkout session error:', errorData)
    throw new Error(
      errorData.message || `Failed to create checkout session: ${response.status}`
    )
  }

  const data = await response.json()

  return {
    checkoutToken: data.checkoutToken,
    secretToken: data.secretToken,
  }
}

/**
 * Verify a completed payment transaction
 * Falls back to mock verification if HELCIM_API_TOKEN is not configured
 */
export async function verifyTransaction(transactionId: string, amount?: number): Promise<{
  status: 'approved' | 'declined' | 'error'
  amount: number
  cardLastFour: string
  cardType: string
  approvalCode?: string
}> {
  // Use mock mode in development or when API token is not set
  if (USE_MOCK) {
    console.log('Helcim: Using mock transaction verification')
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Simulate 95% success rate in mock mode
    const isApproved = Math.random() > 0.05

    return {
      status: isApproved ? 'approved' : 'declined',
      amount: amount || 0,
      cardLastFour: '4242',
      cardType: 'Visa',
      approvalCode: isApproved ? `APR${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
    }
  }

  const apiToken = process.env.HELCIM_API_TOKEN!

  const response = await fetch(`${HELCIM_API_URL}/card-transactions/${transactionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'api-token': apiToken,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to verify transaction')
  }

  const data = await response.json()

  return {
    status: data.status === 'APPROVED' ? 'approved' : 'declined',
    amount: data.amount,
    cardLastFour: data.cardNumber?.slice(-4) || '****',
    cardType: data.cardType || 'Unknown',
    approvalCode: data.approvalCode,
  }
}
