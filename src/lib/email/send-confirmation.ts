import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

interface PaymentConfirmationParams {
  to: string
  studentName: string
  schoolName: string
  amount: number
  processingFee: number
  totalAmount: number
  transactionId: string
  cardLastFour: string
}

export async function sendPaymentConfirmation(params: PaymentConfirmationParams) {
  const {
    to,
    studentName,
    schoolName,
    amount,
    processingFee,
    totalAmount,
    transactionId,
    cardLastFour,
  } = params

  const resend = getResendClient()

  // Don't send if no API key configured
  if (!resend) {
    console.log('RESEND_API_KEY not set, skipping email:', { to, transactionId })
    return { success: true, mock: true }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'payments@tuitionpay.ai'

  try {
    const { data, error } = await resend.emails.send({
      from: `TuitionPay <${fromEmail}>`,
      to: [to],
      subject: `Payment Confirmation - ${schoolName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Confirmation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Payment Confirmed</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Your tuition payment has been successfully processed.
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
                <h2 style="font-size: 14px; color: #6b7280; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">Payment Details</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">School</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 500;">${schoolName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Student</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 500;">${studentName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Tuition Amount</td>
                    <td style="padding: 8px 0; text-align: right;">$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Processing Fee</td>
                    <td style="padding: 8px 0; text-align: right;">$${processingFee.toFixed(2)}</td>
                  </tr>
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 12px 0 8px; font-weight: 600;">Total Charged</td>
                    <td style="padding: 12px 0 8px; text-align: right; font-weight: 600; font-size: 18px;">$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h2 style="font-size: 14px; color: #6b7280; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">Transaction Info</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Transaction ID</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${transactionId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Card</td>
                    <td style="padding: 8px 0; text-align: right;">**** **** **** ${cardLastFour}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Date</td>
                    <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 20px; text-align: center;">
                Please save this email for your records.
              </p>
            </div>

            <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">
                &copy; ${new Date().getFullYear()} TuitionPay. All rights reserved.
              </p>
              <p style="margin: 0;">
                Questions? Contact us at support@tuitionpay.ai
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}
