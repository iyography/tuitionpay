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

interface WelcomeEmailParams {
  to: string
  parentName: string
}

export async function sendWelcomeEmail(params: WelcomeEmailParams) {
  const { to, parentName } = params

  const resend = getResendClient()

  // Don't send if no API key configured
  if (!resend) {
    console.log('RESEND_API_KEY not set, skipping welcome email:', { to })
    return { success: true, mock: true }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'info@tuitionpay.ai'

  try {
    const { data, error } = await resend.emails.send({
      from: `TuitionPay <${fromEmail}>`,
      to: [to],
      subject: 'Welcome to TuitionPay!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to TuitionPay</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f3f4f6;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to TuitionPay!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Smart tuition payments, real rewards.</p>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin: 0 0 16px 0;">
                Hi ${parentName || 'there'},
              </p>

              <p style="font-size: 15px; margin: 0 0 24px 0; color: #374151;">
                Thanks for signing up! TuitionPay helps you save hundreds (or even thousands) on tuition by matching you with the best credit card rewards and signup bonuses.
              </p>

              <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #111827;">Here's how it works:</h2>

              <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 16px;">
                  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0;">1</div>
                  <div>
                    <strong style="color: #111827;">Find your best card</strong>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Use our free optimizer to get personalized credit card recommendations based on your tuition amount.</p>
                  </div>
                </div>
                <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 16px;">
                  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0;">2</div>
                  <div>
                    <strong style="color: #111827;">Apply and get approved</strong>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Apply directly with the card issuer. Most approvals happen within minutes.</p>
                  </div>
                </div>
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0;">3</div>
                  <div>
                    <strong style="color: #111827;">Pay tuition through TuitionPay</strong>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Make your tuition payment with your new card and earn rewards toward the signup bonus.</p>
                  </div>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://tuitionpay.ai/optimizer" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Find Your Best Card
                </a>
              </div>
            </div>

            <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">
                &copy; ${new Date().getFullYear()} TuitionPay. All rights reserved.
              </p>
              <p style="margin: 0;">
                Questions? Contact us at <a href="mailto:info@tuitionpay.ai" style="color: #9ca3af;">info@tuitionpay.ai</a>
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
    console.error('Welcome email send error:', error)
    throw error
  }
}
