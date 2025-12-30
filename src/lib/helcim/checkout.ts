import type { HelcimCheckoutSession } from './types'

const HELCIM_API_URL = 'https://api.helcim.com/v2'

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
 * Create a HelcimPay.js checkout session
 * This generates a secure token for client-side payment collection
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<HelcimCheckoutSession> {
  const apiToken = process.env.HELCIM_API_TOKEN

  if (!apiToken) {
    throw new Error('HELCIM_API_TOKEN is not configured')
  }

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
 */
export async function verifyTransaction(transactionId: string): Promise<{
  status: 'approved' | 'declined' | 'error'
  amount: number
  cardLastFour: string
  cardType: string
  approvalCode?: string
}> {
  const apiToken = process.env.HELCIM_API_TOKEN

  if (!apiToken) {
    throw new Error('HELCIM_API_TOKEN is not configured')
  }

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
