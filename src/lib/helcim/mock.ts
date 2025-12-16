import type {
  HelcimPaymentRequest,
  HelcimPaymentResponse,
  HelcimSubMerchant,
  HelcimWebhookPayload,
} from './types'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate mock transaction ID
function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

// Mock payment processing
export async function processPayment(
  request: HelcimPaymentRequest
): Promise<HelcimPaymentResponse> {
  // Simulate API delay (1-2 seconds)
  await delay(1000 + Math.random() * 1000)

  // Simulate 95% success rate
  const isSuccessful = Math.random() > 0.05

  if (!isSuccessful) {
    return {
      transactionId: generateTransactionId(),
      status: 'declined',
      cardLastFour: '4242',
      cardType: 'Visa',
      amount: request.amount,
      currency: request.currency,
      dateCreated: new Date().toISOString(),
      responseMessage: 'Card declined - insufficient funds',
    }
  }

  return {
    transactionId: generateTransactionId(),
    status: 'approved',
    approvalCode: `APR${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    cardLastFour: '4242',
    cardType: 'Visa',
    amount: request.amount,
    currency: request.currency,
    dateCreated: new Date().toISOString(),
    responseMessage: 'Transaction approved',
  }
}

// Mock sub-merchant creation
export async function createSubMerchant(
  businessName: string,
  contactEmail: string
): Promise<HelcimSubMerchant> {
  await delay(500)

  return {
    merchantId: `MER-${Date.now()}`,
    businessName,
    contactEmail,
    status: 'pending',
    bankAccountVerified: false,
    createdAt: new Date().toISOString(),
  }
}

// Mock sub-merchant retrieval
export async function getSubMerchant(merchantId: string): Promise<HelcimSubMerchant | null> {
  await delay(300)

  // Return mock data
  return {
    merchantId,
    businessName: 'Sample School',
    contactEmail: 'admin@school.edu',
    status: 'active',
    bankAccountVerified: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
}

// Mock webhook verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  _secret: string
): boolean {
  // In production, this would verify the HMAC signature
  // For mock, always return true if signature exists
  return !!payload && !!signature
}

// Mock webhook payload generation (for testing)
export function generateMockWebhook(
  event: HelcimWebhookPayload['event'],
  transactionId: string,
  merchantId: string,
  amount: number
): HelcimWebhookPayload {
  return {
    event,
    transactionId,
    merchantId,
    amount,
    status: event === 'payment.completed' ? 'approved' : 'failed',
    timestamp: new Date().toISOString(),
  }
}

// Calculate processing fee (2.9% + $0.30 standard rate)
export function calculateProcessingFee(amount: number): number {
  const percentageFee = amount * 0.029
  const flatFee = 0.30
  return Math.round((percentageFee + flatFee) * 100) / 100
}

// Calculate revenue share
export function calculateRevenueShare(amount: number, percentage: number): number {
  return Math.round((amount * (percentage / 100)) * 100) / 100
}
