'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  School,
  CheckCircle,
  DollarSign,
  Users,
  ArrowRight,
  Building,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Gift,
  Shield,
  Zap,
} from 'lucide-react'

const schoolApplicationSchema = z.object({
  schoolName: z.string().min(2, 'School name is required'),
  schoolType: z.enum(['catholic', 'christian', 'private_secular', 'montessori', 'other']),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactTitle: z.string().min(2, 'Title is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Phone number is required'),
  estimatedStudents: z.string().min(1, 'Please select estimated students'),
  averageTuition: z.string().min(1, 'Please enter average tuition'),
  currentPaymentSystem: z.string().optional(),
  additionalNotes: z.string().optional(),
})

type SchoolApplicationData = z.infer<typeof schoolApplicationSchema>

const benefits = [
  {
    icon: DollarSign,
    title: 'Revenue Share',
    description: 'Earn a portion of processing fees on every payment made through TuitionPay.',
  },
  {
    icon: Users,
    title: 'Happy Parents',
    description: 'Parents save 10-12% on tuition through optimized credit card rewards.',
  },
  {
    icon: Shield,
    title: 'Zero Risk',
    description: 'No cost to implement. Funds go directly to your account. We never touch your money.',
  },
  {
    icon: Zap,
    title: 'Easy Setup',
    description: 'No changes to your existing systems. Works alongside your current payment methods.',
  },
]

export default function PartnerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchoolApplicationData>({
    resolver: zodResolver(schoolApplicationSchema),
  })

  const onSubmit = async (data: SchoolApplicationData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/schools/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to submit application')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container pt-28 pb-12 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card>
            <CardContent className="pt-12 pb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Application Submitted!</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Thank you for your interest in partnering with TuitionPay. We&apos;ll review your
                application and reach out within 2-3 business days.
              </p>
              <div className="space-y-4">
                <p className="text-sm font-medium">What happens next?</p>
                <div className="text-left max-w-sm mx-auto space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We review your application and verify school information
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll schedule a quick call to discuss integration
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Set up your Helcim account for direct deposits
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your school goes live and parents can start paying!
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => router.push('/')} className="mt-8">
                Return Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-lg shadow-primary/25">
              <School className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Partner With TuitionPay</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Offer your families a better way to pay tuition while earning revenue share
              on every transaction. Zero cost, zero risk.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">School Application</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll be in touch within 2-3 business days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* School Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        School Information
                      </h3>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name *</Label>
                          <Input
                            id="schoolName"
                            placeholder="St. Joseph Academy"
                            {...register('schoolName')}
                          />
                          {errors.schoolName && (
                            <p className="text-sm text-destructive">{errors.schoolName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="schoolType">School Type *</Label>
                          <Select onValueChange={(value) => setValue('schoolType', value as SchoolApplicationData['schoolType'])}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select school type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="catholic">Catholic</SelectItem>
                              <SelectItem value="christian">Christian (Non-Catholic)</SelectItem>
                              <SelectItem value="private_secular">Private Secular</SelectItem>
                              <SelectItem value="montessori">Montessori</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.schoolType && (
                            <p className="text-sm text-destructive">{errors.schoolType.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Street Address *</Label>
                          <Input
                            id="address"
                            placeholder="123 Main Street"
                            {...register('address')}
                          />
                          {errors.address && (
                            <p className="text-sm text-destructive">{errors.address.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input id="city" placeholder="Detroit" {...register('city')} />
                            {errors.city && (
                              <p className="text-sm text-destructive">{errors.city.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input id="state" placeholder="MI" {...register('state')} />
                            {errors.state && (
                              <p className="text-sm text-destructive">{errors.state.message}</p>
                            )}
                          </div>
                          <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label htmlFor="zipCode">ZIP Code *</Label>
                            <Input id="zipCode" placeholder="48201" {...register('zipCode')} />
                            {errors.zipCode && (
                              <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact Information
                      </h3>

                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactName">Your Name *</Label>
                            <Input
                              id="contactName"
                              placeholder="John Smith"
                              {...register('contactName')}
                            />
                            {errors.contactName && (
                              <p className="text-sm text-destructive">{errors.contactName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactTitle">Title *</Label>
                            <Input
                              id="contactTitle"
                              placeholder="Business Manager"
                              {...register('contactTitle')}
                            />
                            {errors.contactTitle && (
                              <p className="text-sm text-destructive">{errors.contactTitle.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email *</Label>
                            <Input
                              id="contactEmail"
                              type="email"
                              placeholder="jsmith@school.edu"
                              {...register('contactEmail')}
                            />
                            {errors.contactEmail && (
                              <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">Phone *</Label>
                            <Input
                              id="contactPhone"
                              placeholder="(313) 555-0100"
                              {...register('contactPhone')}
                            />
                            {errors.contactPhone && (
                              <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* School Details */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        School Details
                      </h3>

                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="estimatedStudents">Estimated Students *</Label>
                            <Select onValueChange={(value) => setValue('estimatedStudents', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-100">1-100</SelectItem>
                                <SelectItem value="101-250">101-250</SelectItem>
                                <SelectItem value="251-500">251-500</SelectItem>
                                <SelectItem value="501-1000">501-1,000</SelectItem>
                                <SelectItem value="1000+">1,000+</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.estimatedStudents && (
                              <p className="text-sm text-destructive">{errors.estimatedStudents.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="averageTuition">Avg. Annual Tuition *</Label>
                            <Input
                              id="averageTuition"
                              placeholder="$8,500"
                              {...register('averageTuition')}
                            />
                            {errors.averageTuition && (
                              <p className="text-sm text-destructive">{errors.averageTuition.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currentPaymentSystem">Current Payment System (optional)</Label>
                          <Input
                            id="currentPaymentSystem"
                            placeholder="e.g., FACTS, Blackbaud, in-house"
                            {...register('currentPaymentSystem')}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="additionalNotes">Additional Notes (optional)</Label>
                          <Textarea
                            id="additionalNotes"
                            placeholder="Anything else you'd like us to know..."
                            rows={3}
                            {...register('additionalNotes')}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting, you agree to be contacted about TuitionPay partnership opportunities.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
