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

interface CardRecommendation {
  cardName: string
  issuer: string
  signupBonusValue: number
  signupBonusRequirement: string
  signupBonusTimeframe: string
  annualFee: number
  firstYearWaived: boolean
  rewardsRate: number | null
  estimatedSavings: number
  benefits?: string | null
  isBusinessCard: boolean
}

interface RecommendationEmailParams {
  to: string
  studentName: string
  schoolName: string
  tuitionAmount: number
  recommendations: CardRecommendation[]
  splitStrategy?: {
    cards: { cardName: string; allocatedAmount: number; savings: number }[]
    totalSavings: number
  }
}

export async function sendRecommendationEmail(params: RecommendationEmailParams) {
  const {
    to,
    studentName,
    schoolName,
    tuitionAmount,
    recommendations,
    splitStrategy,
  } = params

  const resend = getResendClient()

  // Don't send if no API key configured
  if (!resend) {
    console.log('RESEND_API_KEY not set, skipping recommendation email:', { to })
    return { success: true, mock: true }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'recommendations@tuitionpay.ai'

  const topCard = recommendations[0]

  // Generate cards HTML
  const cardsHtml = recommendations.map((card, index) => `
    <div style="background: ${index === 0 ? '#fef3c7' : '#f9fafb'}; border: ${index === 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb'}; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div>
          <span style="background: ${index === 0 ? '#f59e0b' : '#6b7280'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${index === 0 ? 'BEST MATCH' : `#${index + 1}`}</span>
          ${card.isBusinessCard ? '<span style="background: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 20px; font-size: 11px; margin-left: 8px;">Business</span>' : ''}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: 700; color: #059669;">$${card.estimatedSavings.toLocaleString()}</div>
          <div style="font-size: 12px; color: #6b7280;">estimated savings</div>
        </div>
      </div>

      <h3 style="margin: 0 0 4px 0; font-size: 18px; color: #111827;">${card.cardName}</h3>
      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">${card.issuer}</p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
          <div style="font-size: 18px; font-weight: 700; color: #059669;">$${card.signupBonusValue.toLocaleString()}</div>
          <div style="font-size: 11px; color: #6b7280;">Signup Bonus</div>
        </div>
        <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
          <div style="font-size: 18px; font-weight: 700; color: #111827;">${card.rewardsRate ?? 1}%</div>
          <div style="font-size: 11px; color: #6b7280;">Rewards Rate</div>
        </div>
        <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
          <div style="font-size: 18px; font-weight: 700; color: #111827;">$${card.annualFee}${card.firstYearWaived && card.annualFee > 0 ? '*' : ''}</div>
          <div style="font-size: 11px; color: #6b7280;">Annual Fee${card.firstYearWaived && card.annualFee > 0 ? ' (waived Y1)' : ''}</div>
        </div>
      </div>

      <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
        <p style="margin: 0; font-size: 13px;"><strong>To earn the bonus:</strong> <span style="color: #6b7280;">${card.signupBonusRequirement} in ${card.signupBonusTimeframe}</span></p>
      </div>

      ${card.benefits ? `<p style="margin: 0; font-size: 13px; color: #6b7280;"><strong>Benefits:</strong> ${card.benefits}</p>` : ''}
    </div>
  `).join('')

  // Split strategy HTML
  const splitHtml = splitStrategy ? `
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px dashed #f59e0b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #92400e;">Split Payment Strategy - Maximum Savings!</h2>
      <p style="margin: 0 0 16px 0; color: #92400e;">Split your $${tuitionAmount.toLocaleString()} tuition across 2 cards:</p>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
        ${splitStrategy.cards.map((card, idx) => `
          <div style="background: white; padding: 16px; border-radius: 8px;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Card ${idx + 1}</div>
            <div style="font-weight: 600; margin-bottom: 8px;">${card.cardName}</div>
            <div style="font-size: 14px;">Pay: <strong>$${card.allocatedAmount.toLocaleString()}</strong></div>
          </div>
        `).join('')}
      </div>

      <div style="text-align: center; padding: 16px; background: white; border-radius: 8px;">
        <div style="font-size: 14px; color: #6b7280;">Combined First-Year Savings</div>
        <div style="font-size: 32px; font-weight: 700; color: #059669;">$${splitStrategy.totalSavings.toLocaleString()}</div>
      </div>
    </div>
  ` : ''

  try {
    const { data, error } = await resend.emails.send({
      from: `TuitionPay <${fromEmail}>`,
      to: [to],
      subject: `Your Credit Card Recommendations for ${schoolName} Tuition`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Credit Card Recommendations</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; padding: 20px; background: #f3f4f6;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px;">Your Personalized Card Recommendations</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">For ${studentName}'s tuition at ${schoolName}</p>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">

              <!-- Summary -->
              <div style="background: #059669; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 4px 0; opacity: 0.9;">On your $${tuitionAmount.toLocaleString()} tuition payment</p>
                <p style="margin: 0; font-size: 36px; font-weight: 700;">$${topCard.estimatedSavings.toLocaleString()} in savings</p>
                <p style="margin: 4px 0 0 0; opacity: 0.9;">${Math.round((topCard.estimatedSavings / tuitionAmount) * 100)}% effective return</p>
              </div>

              <!-- IMPORTANT: Pay in Full Warning -->
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px;">IMPORTANT: Pay Off Your Balance in Full</h3>
                <p style="margin: 0; font-size: 13px; color: #7f1d1d;">
                  These savings estimates assume you <strong>pay off your credit card balance in full</strong> before any interest charges.
                  Carrying a balance and paying interest will significantly reduce or eliminate your savings.
                  Only charge what you can afford to pay off immediately.
                </p>
              </div>

              ${splitHtml}

              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Your Top ${recommendations.length} Card Recommendations</h2>

              ${cardsHtml}

              <!-- How to Apply Section -->
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #166534;">How to Apply & Maximize Your Rewards</h3>

                <div style="margin-bottom: 16px;">
                  <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #166534; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</div>
                    <div>
                      <strong>Apply for your card</strong>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Visit the card issuer's website to apply. Most approvals happen within minutes.</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #166534; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</div>
                    <div>
                      <strong>Wait for your card</strong>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Cards typically arrive in 7-10 business days. Wait for the physical card before making your payment.</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
                    <div style="background: #166534; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</div>
                    <div>
                      <strong>Pay your tuition at TuitionPay</strong>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Return to tuitionpay.ai/pay to make your payment. This counts toward your signup bonus!</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: start; gap: 12px;">
                    <div style="background: #166534; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">4</div>
                    <div>
                      <strong>Pay off your balance immediately</strong>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Pay your credit card bill in full to avoid interest charges and maximize your rewards.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Business Card Tips -->
              ${recommendations.some(r => r.isBusinessCard) ? `
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px;">Applying for Business Cards?</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e40af;">
                  <li>Use your legal name as the business name</li>
                  <li>Use your SSN (no EIN required for sole proprietors)</li>
                  <li>Home address is fine for business address</li>
                  <li>Side hustles, freelancing, and rental income all qualify</li>
                </ul>
              </div>
              ` : ''}

              <!-- Warning about offers -->
              <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">Verify Your Offer Before Applying</h4>
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  Credit card offers change frequently. Before applying, verify that the signup bonus matches what we've shown here.
                  <strong>If the offer doesn't match, do not proceed</strong> - contact us at <a href="mailto:support@tuitionpay.ai" style="color: #92400e;">support@tuitionpay.ai</a> and we'll recommend an alternative card with a current offer.
                </p>
              </div>

              <!-- Credit Score Impact -->
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Impact on Your Credit Score</h4>
                <p style="margin: 0; font-size: 13px; color: #6b7280;">
                  Applying for a new card will result in a hard inquiry, which may temporarily lower your score by 5-10 points.
                  However, the new credit line typically improves your credit utilization ratio, often resulting in a net positive effect within 2-3 months.
                  Space applications 30-90 days apart if applying for multiple cards.
                </p>
              </div>

              <!-- Spouse Reminder -->
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px;">Have a Spouse or Partner?</h4>
                <p style="margin: 0; font-size: 13px; color: #1e40af;">
                  Don't forget - your spouse or partner should fill out the assessment separately at <a href="https://tuitionpay.ai/optimizer" style="color: #1e40af;">tuitionpay.ai/optimizer</a>.
                  Each person can earn their own signup bonuses, potentially <strong>doubling your family's rewards</strong>!
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://tuitionpay.ai/pay" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Pay Your Tuition Now
                </a>
                <p style="margin: 12px 0 0 0; font-size: 13px; color: #6b7280;">
                  Already have your card? Make your payment at TuitionPay.
                </p>
              </div>

            </div>

            <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">
                &copy; ${new Date().getFullYear()} TuitionPay. All rights reserved.
              </p>
              <p style="margin: 0;">
                Questions? Contact us at <a href="mailto:support@tuitionpay.ai" style="color: #9ca3af;">support@tuitionpay.ai</a>
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
    console.error('Recommendation email send error:', error)
    throw error
  }
}
