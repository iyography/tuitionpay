import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | TuitionPay',
  description: 'TuitionPay Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="container pt-28 pb-16">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1 className="text-3xl font-bold mb-2">TuitionPay.ai &mdash; Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: February 23, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect:</p>

        <h3>Information You Provide</h3>
        <ul>
          <li>Parent/guardian name and contact info</li>
          <li>Student and school identifiers</li>
          <li>Payment instructions</li>
        </ul>

        <h3>Automatically Collected</h3>
        <ul>
          <li>Device information</li>
          <li>Usage data</li>
          <li>IP address</li>
        </ul>

        <h3>Payment Information</h3>
        <p>
          Payment credentials are collected and processed directly by our payment processors (e.g., Stripe). TuitionPay does not store full card numbers.
        </p>

        <h2>2. How We Use Information</h2>
        <p>We use information to:</p>
        <ul>
          <li>Facilitate tuition payments</li>
          <li>Provide customer support</li>
          <li>Communicate transaction status</li>
          <li>Improve services</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p><strong>We do not sell personal information.</strong></p>

        <h2>3. Sharing of Information</h2>
        <p>We may share data with:</p>
        <ul>
          <li>Payment processors (e.g., Stripe)</li>
          <li>Schools designated by the user</li>
          <li>Service providers supporting operations</li>
          <li>Legal authorities when required</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>
          We implement reasonable administrative, technical, and physical safeguards.
          However, no system can be guaranteed 100% secure.
        </p>

        <h2>5. Data Retention</h2>
        <p>We retain information only as long as necessary to:</p>
        <ul>
          <li>Provide services</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes</li>
        </ul>

        <h2>6. Your Choices</h2>
        <p>You may contact us to:</p>
        <ul>
          <li>Update information</li>
          <li>Request deletion (subject to legal limits)</li>
          <li>Ask privacy questions</li>
        </ul>
        <p>
          Email: <a href="mailto:support@tuitionpay.ai">support@tuitionpay.ai</a>
        </p>

        <h2>7. Children&apos;s Information</h2>
        <p>
          TuitionPay is intended for parents and guardians. We do not knowingly collect data directly from children under 13.
        </p>

        <h2>8. Changes</h2>
        <p>We may update this policy from time to time.</p>

        <h2>9. Contact</h2>
        <p>
          <a href="mailto:support@tuitionpay.ai">support@tuitionpay.ai</a><br />
          <a href="https://www.tuitionpay.ai">www.tuitionpay.ai</a>
        </p>
      </div>
    </div>
  )
}
