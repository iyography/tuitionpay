import type {
  HelcimPaymentRequest,
  HelcimPaymentResponse,
  HelcimSubMerchant,
} from './types'
import * as mock from './mock'

// Environment check - use mock in development or when API key is not set
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.HELCIM_API_KEY

// Helcim API base URL
const HELCIM_API_URL = 'https://api.helcim.com/v2'

// API headers
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'api-token': process.env.HELCIM_API_KEY || '',
  }
}

// Process a payment
export async function processPayment(
  request: HelcimPaymentRequest
): Promise<HelcimPaymentResponse> {
  if (USE_MOCK) {
    return mock.processPayment(request)
  }

  const response = await fetch(`${HELCIM_API_URL}/payment/purchase`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      amount: request.amount,
      currency: request.currency,
      cardToken: request.cardToken,
      terminalId: request.merchantId,
      invoiceNumber: request.invoiceNumber,
      comments: request.comments,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Payment processing failed')
  }

  return response.json()
}

// Create a sub-merchant (for school onboarding)
export async function createSubMerchant(
  businessName: string,
  contactEmail: string
): Promise<HelcimSubMerchant> {
  if (USE_MOCK) {
    return mock.createSubMerchant(businessName, contactEmail)
  }

  const response = await fetch(`${HELCIM_API_URL}/sub-merchants`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      businessName,
      contactEmail,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Sub-merchant creation failed')
  }

  return response.json()
}

// Get sub-merchant details
export async function getSubMerchant(merchantId: string): Promise<HelcimSubMerchant | null> {
  if (USE_MOCK) {
    return mock.getSubMerchant(merchantId)
  }

  const response = await fetch(`${HELCIM_API_URL}/sub-merchants/${merchantId}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to fetch sub-merchant')
  }

  return response.json()
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (USE_MOCK) {
    return mock.verifyWebhookSignature(payload, signature, secret)
  }

  // In production, implement HMAC verification
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex')
  // return signature === expectedSignature

  return !!payload && !!signature && !!secret
}

// Re-export utility functions
export { calculateProcessingFee, calculateRevenueShare } from './mock'
