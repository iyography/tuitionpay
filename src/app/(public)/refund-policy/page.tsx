import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Overpayment Policy | TuitionPay',
  description: 'TuitionPay Refund and Overpayment Policy',
}

export default function RefundPolicyPage() {
  return (
    <div className="container pt-28 pb-16">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="text-3xl font-bold mb-2">Refund and Overpayment Policy</h1>
        <p className="text-muted-foreground mb-8">
          TuitionPay is committed to helping families resolve payment errors quickly and fairly.
        </p>

        <h2>Before Settlement</h2>
        <p>
          If an incorrect payment is reported before settlement, TuitionPay will attempt to void the transaction where possible.
        </p>

        <h2>After Settlement</h2>
        <p>If funds have already settled:</p>
        <ul>
          <li>TuitionPay may issue a refund to the original payment method; or</li>
          <li>The overpayment may be applied as a tuition credit with the school&apos;s coordination</li>
        </ul>
        <p>
          <strong>Processing fees, if any, ARE NOT refundable once a transaction has settled with the payment networks.</strong>
        </p>

        <h2>Parent Responsibility</h2>
        <p>Users are responsible for confirming payment amounts prior to submission.</p>

        <h2>How to Request Help</h2>
        <p>
          Contact: <a href="mailto:support@tuitionpay.ai">support@tuitionpay.ai</a>
        </p>
        <p>Include:</p>
        <ul>
          <li>Parent name</li>
          <li>School</li>
          <li>Payment date</li>
          <li>Amount</li>
        </ul>
        <p>Requests are reviewed promptly.</p>
      </div>
    </div>
  )
}
