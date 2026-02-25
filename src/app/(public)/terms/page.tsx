import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | TuitionPay',
  description: 'TuitionPay Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="container pt-28 pb-16">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="text-3xl font-bold mb-2">TuitionPay.ai &mdash; Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Effective Date: February 23, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          Welcome to TuitionPay.ai (&ldquo;TuitionPay,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing or using the TuitionPay platform, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).
        </p>
        <p>If you do not agree, do not use the platform.</p>

        <h2>2. Description of Services</h2>
        <p>
          TuitionPay provides a payment facilitation platform that allows families to submit tuition payments to participating schools using supported payment methods.
        </p>
        <p>TuitionPay:</p>
        <ul>
          <li>Does not set tuition amounts</li>
          <li>Does not provide educational services</li>
          <li>Does not hold or custody tuition funds</li>
          <li>Does not provide financial, credit, or tax advice</li>
        </ul>
        <p>Participating schools remain solely responsible for tuition billing and policies.</p>

        <h2>3. User Eligibility</h2>
        <p>You must:</p>
        <ul>
          <li>Be at least 18 years old</li>
          <li>Have authority to make payments for the student</li>
          <li>Provide accurate information</li>
        </ul>
        <p>You agree to use the platform only for lawful purposes.</p>

        <h2>4. Payments and Authorization</h2>
        <p>By submitting a payment, you:</p>
        <ul>
          <li>Authorize TuitionPay and its payment processors (including Stripe) to charge your selected payment method</li>
          <li>Confirm the payment amount is correct</li>
          <li>Acknowledge transactions may begin processing immediately</li>
        </ul>
        <p>You are solely responsible for verifying payment amounts before submission.</p>

        <h2>5. Optional Payment Methods</h2>
        <p>TuitionPay may offer:</p>
        <ul>
          <li>Credit card payments</li>
          <li>ACH bank payments</li>
        </ul>
        <p>Credit card use is optional and intended for financially responsible families who pay balances in full.</p>

        <h2>6. Payment Finality and Corrections</h2>
        <p>
          If you believe a payment was submitted in error, you must contact{' '}
          <a href="mailto:support@tuitionpay.ai">support@tuitionpay.ai</a> promptly.
        </p>
        <p>Depending on timing:</p>
        <ul>
          <li>Transactions may be voided prior to settlement; or</li>
          <li>A refund or tuition credit may be issued after settlement</li>
        </ul>
        <p><strong>Processing fees, if any, are not refundable once a transaction has settled.</strong></p>

        <h2>7. Chargebacks and Disputes</h2>
        <p>You agree to contact TuitionPay support before initiating a chargeback.</p>
        <p>Improper or abusive chargebacks may result in:</p>
        <ul>
          <li>Account suspension</li>
          <li>Loss of platform access</li>
        </ul>
        <p>Nothing in this section limits your rights under applicable law.</p>

        <h2>8. Third-Party Payment Processing</h2>
        <p>Payments are processed by third-party providers such as Stripe.</p>
        <p>TuitionPay:</p>
        <ul>
          <li>Does not store full credit card numbers</li>
          <li>Does not control payment network decisions</li>
          <li>Is not responsible for processor outages</li>
        </ul>

        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, TuitionPay shall not be liable for:</p>
        <ul>
          <li>School billing errors</li>
          <li>Tuition disputes</li>
          <li>Indirect or consequential damages</li>
          <li>Reward outcomes or credit card benefits</li>
        </ul>
        <p>
          TuitionPay&apos;s total liability shall not exceed the amount of fees paid to TuitionPay in the preceding 12 months.
        </p>

        <h2>10. Termination</h2>
        <p>We may suspend or terminate access for:</p>
        <ul>
          <li>Fraud or suspected fraud</li>
          <li>Terms violations</li>
          <li>Processor requirements</li>
        </ul>
        <p>Users may stop using the service at any time.</p>

        <h2>11. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of Michigan.</p>

        <h2>12. Contact</h2>
        <p>
          TuitionPay.ai<br />
          <a href="mailto:support@tuitionpay.ai">support@tuitionpay.ai</a><br />
          <a href="https://www.tuitionpay.ai">www.tuitionpay.ai</a>
        </p>
      </div>
    </div>
  )
}
