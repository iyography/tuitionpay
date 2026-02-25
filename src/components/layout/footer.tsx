'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()

  // Don't show footer on admin pages
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null
  }

  return (
    <footer className="border-t bg-gradient-to-b from-muted/30 to-muted/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto items-start">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="TuitionPay"
                width={640}
                height={160}
                className="h-[160px] w-auto"
              />
            </Link>
          </div>

          {/* Parents */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Parents</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/optimizer" className="text-muted-foreground hover:text-primary transition-colors">
                  See Your Savings
                </Link>
              </li>
              <li>
                <Link href="/pay" className="text-muted-foreground hover:text-primary transition-colors">
                  Pay Your Tuition
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Schools */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Schools</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/partner" className="text-muted-foreground hover:text-primary transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                  School Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TuitionPay.ai. All rights reserved.</p>
            <p className="text-center md:text-right">
              Card recommendations are for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
