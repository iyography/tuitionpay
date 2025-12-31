'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreditCard, Briefcase, User, DollarSign, Plane, Building2 } from 'lucide-react'
import { demoCreditCards } from '@/lib/demo-data'

export default function DemoCardsPage() {
  const businessCards = demoCreditCards.filter(card => card.is_business_card)
  const personalCards = demoCreditCards.filter(card => !card.is_business_card)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="container pt-28 pb-12 md:pt-32 md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Credit Card Database
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All {demoCreditCards.length} credit cards in our recommendation engine
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{demoCreditCards.length}</p>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{businessCards.length}</p>
                  <p className="text-sm text-muted-foreground">Business Cards</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{personalCards.length}</p>
                  <p className="text-sm text-muted-foreground">Personal Cards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Business Cards ({businessCards.length})
              </CardTitle>
              <CardDescription>
                Cards for business owners, freelancers, and side hustlers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card Name</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Signup Bonus</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Annual Fee</TableHead>
                      <TableHead>Rewards Type</TableHead>
                      <TableHead>Point Values</TableHead>
                      <TableHead>Benefits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.card_name}</TableCell>
                        <TableCell>{card.issuer}</TableCell>
                        <TableCell className="text-emerald-600 font-semibold">
                          {formatCurrency(card.signup_bonus_value || 0)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {card.signup_bonus_requirement}
                        </TableCell>
                        <TableCell>
                          {card.annual_fee === 0 ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">$0</Badge>
                          ) : (
                            formatCurrency(card.annual_fee)
                          )}
                          {card.first_year_waived && card.annual_fee > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">(1st yr free)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {card.rewards_type === 'cash_back' && <DollarSign className="h-3 w-3 mr-1" />}
                            {card.rewards_type === 'travel_points' && <Plane className="h-3 w-3 mr-1" />}
                            {card.rewards_type === 'hotel_points' && <Building2 className="h-3 w-3 mr-1" />}
                            {card.rewards_type?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {card.hyatt_value && <div>Hyatt: {formatCurrency(card.hyatt_value)}</div>}
                          {card.southwest_value && <div>SW: {formatCurrency(card.southwest_value)}</div>}
                          {card.delta_value && card.delta_value > 0 && <div>Delta: {formatCurrency(card.delta_value)}</div>}
                          {card.cash_value && card.cash_value > 0 && <div>Cash: {formatCurrency(card.cash_value)}</div>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                          {card.benefits || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Personal Cards ({personalCards.length})
              </CardTitle>
              <CardDescription>
                Cards for individuals without a business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card Name</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Signup Bonus</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Annual Fee</TableHead>
                      <TableHead>Rewards Type</TableHead>
                      <TableHead>Point Values</TableHead>
                      <TableHead>Benefits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personalCards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.card_name}</TableCell>
                        <TableCell>{card.issuer}</TableCell>
                        <TableCell className="text-emerald-600 font-semibold">
                          {formatCurrency(card.signup_bonus_value || 0)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {card.signup_bonus_requirement}
                        </TableCell>
                        <TableCell>
                          {card.annual_fee === 0 ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">$0</Badge>
                          ) : (
                            formatCurrency(card.annual_fee)
                          )}
                          {card.first_year_waived && card.annual_fee > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">(1st yr free)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {card.rewards_type === 'cash_back' && <DollarSign className="h-3 w-3 mr-1" />}
                            {card.rewards_type === 'travel_points' && <Plane className="h-3 w-3 mr-1" />}
                            {card.rewards_type === 'airline_miles' && <Plane className="h-3 w-3 mr-1" />}
                            {card.rewards_type?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {card.hyatt_value && <div>Hyatt: {formatCurrency(card.hyatt_value)}</div>}
                          {card.southwest_value && <div>SW: {formatCurrency(card.southwest_value)}</div>}
                          {card.delta_value && card.delta_value > 0 && <div>Delta: {formatCurrency(card.delta_value)}</div>}
                          {card.aa_value && card.aa_value > 0 && <div>AA: {formatCurrency(card.aa_value)}</div>}
                          {card.cash_value && card.cash_value > 0 && <div>Cash: {formatCurrency(card.cash_value)}</div>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                          {card.benefits || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
