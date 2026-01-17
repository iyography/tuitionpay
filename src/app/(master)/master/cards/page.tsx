'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  Search,
  ExternalLink,
  DollarSign,
} from 'lucide-react'
import type { CreditCard as CreditCardType } from '@/types/database'

export default function CardsPage() {
  const [cards, setCards] = useState<CreditCardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data } = await supabase
        .from('credit_cards')
        .select('*')
        .order('signup_bonus_value', { ascending: false })

      setCards(data || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCardActive = async (cardId: string, isActive: boolean) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      await supabase
        .from('credit_cards')
        .update({ is_active: isActive })
        .eq('id', cardId)

      setCards(cards.map(card =>
        card.id === cardId ? { ...card, is_active: isActive } : card
      ))
    } catch (error) {
      console.error('Error updating card:', error)
    }
  }

  const formatCurrency = (amount: number | null) =>
    amount ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount) : '$0'

  const filteredCards = cards.filter(card =>
    card.card_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Card Catalog</h1>
        <p className="text-muted-foreground">
          Manage credit cards available for recommendations
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{cards.length}</div>
            <p className="text-sm text-muted-foreground">Total cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {cards.filter(c => c.is_active).length}
            </div>
            <p className="text-sm text-muted-foreground">Active cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {cards.filter(c => c.is_business_card).length}
            </div>
            <p className="text-sm text-muted-foreground">Business cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Cards Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Cards ({filteredCards.length})</CardTitle>
            <CardDescription>
              Credit cards available for user recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cards found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Active</TableHead>
                    <TableHead>Card Name</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Bonus Value</TableHead>
                    <TableHead className="text-right">Annual Fee</TableHead>
                    <TableHead className="text-right">Rewards Rate</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow key={card.id} className={!card.is_active ? 'opacity-50' : ''}>
                      <TableCell>
                        <Switch
                          checked={card.is_active}
                          onCheckedChange={(checked) => toggleCardActive(card.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[250px] truncate">
                        {card.card_name}
                      </TableCell>
                      <TableCell>{card.issuer}</TableCell>
                      <TableCell>
                        {card.is_business_card ? (
                          <Badge className="bg-blue-100 text-blue-800">Business</Badge>
                        ) : (
                          <Badge variant="outline">Personal</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        {formatCurrency(card.signup_bonus_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(card.annual_fee)}
                        {card.first_year_waived && card.annual_fee > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">(Y1 free)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {card.rewards_rate ? `${card.rewards_rate}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {card.application_url && (
                          <a
                            href={card.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
