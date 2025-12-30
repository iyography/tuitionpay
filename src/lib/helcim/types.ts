export interface HelcimPaymentRequest {
  amount: number
  currency: string
  cardToken?: string
  merchantId: string
  customerCode?: string
  invoiceNumber?: string
  comments?: string
}

export interface HelcimPaymentResponse {
  transactionId: string
  status: 'approved' | 'declined' | 'error'
  approvalCode?: string
  cardLastFour: string
  cardType: string
  amount: number
  currency: string
  dateCreated: string
  responseMessage: string
}

export interface HelcimSubMerchant {
  merchantId: string
  businessName: string
  contactEmail: string
  status: 'pending' | 'active' | 'suspended'
  bankAccountVerified: boolean
  createdAt: string
}

export interface HelcimWebhookPayload {
  event: 'payment.completed' | 'payment.failed' | 'payment.refunded' | 'settlement.completed'
  transactionId: string
  merchantId: string
  amount: number
  status: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface HelcimHostedPageConfig {
  merchantId: string
  amount: number
  currency: string
  invoiceNumber?: string
  customerEmail?: string
  returnUrl: string
  cancelUrl: string
}

export interface HelcimCheckoutSession {
  checkoutToken: string
  secretToken: string
}

export interface HelcimPayInitializeResponse {
  checkoutToken: string
  secretToken: string
}

export interface HelcimTransactionResult {
  transactionId: string
  cardToken?: string
  status: 'APPROVED' | 'DECLINED' | 'ERROR'
  type: string
  amount: number
  currency: string
  cardNumber: string
  cardType: string
  approvalCode?: string
  dateCreated: string
}
