'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, School, Shield } from 'lucide-react'
import { DEMO_MODE, demoAdmin, demoSuperAdmin } from '@/lib/demo-data'
import Link from 'next/link'
import Image from 'next/image'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (DEMO_MODE) {
        // Demo mode - simulate login
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Accept demo credentials or any credentials in demo mode
        if (email === demoAdmin.email || email.includes('@')) {
          // Store demo session
          sessionStorage.setItem('demo_admin', JSON.stringify({
            ...demoAdmin,
            email: email || demoAdmin.email
          }))
          router.push(redirect)
          return
        } else {
          throw new Error('Please enter a valid email address')
        }
      }

      // Real Supabase auth
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      router.push(redirect)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchoolDemoLogin = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    sessionStorage.setItem('demo_admin', JSON.stringify(demoAdmin))
    router.push('/admin')
  }

  const handleSuperAdminDemoLogin = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    sessionStorage.setItem('demo_superadmin', JSON.stringify(demoSuperAdmin))
    router.push('/superadmin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="TuitionPay"
              width={200}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>School Admin Login</CardTitle>
            <CardDescription>
              Sign in to access your school&apos;s payment dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {DEMO_MODE && (
              <div className="mb-6">
                <p className="text-sm font-medium text-center mb-3">Try Demo Mode</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={handleSchoolDemoLogin}
                    disabled={isLoading}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 border-2 hover:border-primary hover:bg-primary/5"
                  >
                    <School className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">School Portal</span>
                    <span className="text-xs text-muted-foreground">For partner schools</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSuperAdminDemoLogin}
                    disabled={isLoading}
                    className="h-auto py-4 flex-col gap-2 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800"
                  >
                    <Shield className="h-6 w-6" />
                    <span className="text-sm font-medium">Admin Portal</span>
                    <span className="text-xs text-white/70">TuitionPay team</span>
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  No account needed - explore with sample data
                </p>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or sign in with credentials
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required={!DEMO_MODE}
                />
                {DEMO_MODE && (
                  <p className="text-xs text-muted-foreground">
                    Demo mode: any password works
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                Not a registered school?{' '}
                <Link href="/partner" className="text-primary hover:underline">
                  Apply to Partner
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link href="/" className="hover:underline">
            &larr; Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
