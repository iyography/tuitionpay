'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { CreditCard as CreditCardType } from '@/types/database'

export default function CardsManagementPage() {
  const [cards, setCards] = useState<CreditCardType[]>([])
  const [filteredCards, setFilteredCards] = useState<CreditCardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null)
  const [formData, setFormData] = useState({
    card_name: '',
    issuer: '',
    signup_bonus_value: '',
    signup_bonus_requirement: '',
    signup_bonus_timeframe: '',
    annual_fee: '',
    first_year_waived: false,
    rewards_rate: '',
    rewards_type: '',
    min_credit_score: '',
    is_business_card: false,
    is_active: true,
    application_url: '',
    point_cash_value: '',
    cash_value: '',
    cash_back_pct: '',
    delta_value: '',
    delta_pct: '',
    marriott_value: '',
    marriott_pct: '',
    hyatt_value: '',
    hyatt_pct: '',
    southwest_value: '',
    southwest_pct: '',
    united_value: '',
    united_pct: '',
    aa_value: '',
    aa_pct: '',
  })

  useEffect(() => {
    fetchCards()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      setFilteredCards(
        cards.filter(
          (c) =>
            c.card_name.toLowerCase().includes(search) ||
            c.issuer.toLowerCase().includes(search)
        )
      )
    } else {
      setFilteredCards(cards)
    }
  }, [cards, searchTerm])

  const fetchCards = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase
        .from('credit_cards')
        .select('*')
        .order('issuer', { ascending: true })

      if (data) {
        setCards(data)
      }
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openDialog = (card?: CreditCardType) => {
    if (card) {
      setEditingCard(card)
      setFormData({
        card_name: card.card_name,
        issuer: card.issuer,
        signup_bonus_value: card.signup_bonus_value?.toString() || '',
        signup_bonus_requirement: card.signup_bonus_requirement || '',
        signup_bonus_timeframe: card.signup_bonus_timeframe || '',
        annual_fee: card.annual_fee?.toString() || '0',
        first_year_waived: card.first_year_waived || false,
        rewards_rate: card.rewards_rate?.toString() || '',
        rewards_type: card.rewards_type || '',
        min_credit_score: card.min_credit_score?.toString() || '',
        is_business_card: card.is_business_card || false,
        is_active: card.is_active,
        application_url: card.application_url || '',
        point_cash_value: card.point_cash_value?.toString() || '',
        cash_value: card.cash_value?.toString() || '',
        cash_back_pct: card.cash_back_pct?.toString() || '',
        delta_value: card.delta_value?.toString() || '',
        delta_pct: card.delta_pct?.toString() || '',
        marriott_value: card.marriott_value?.toString() || '',
        marriott_pct: card.marriott_pct?.toString() || '',
        hyatt_value: card.hyatt_value?.toString() || '',
        hyatt_pct: card.hyatt_pct?.toString() || '',
        southwest_value: card.southwest_value?.toString() || '',
        southwest_pct: card.southwest_pct?.toString() || '',
        united_value: card.united_value?.toString() || '',
        united_pct: card.united_pct?.toString() || '',
        aa_value: card.aa_value?.toString() || '',
        aa_pct: card.aa_pct?.toString() || '',
      })
    } else {
      setEditingCard(null)
      setFormData({
        card_name: '',
        issuer: '',
        signup_bonus_value: '',
        signup_bonus_requirement: '',
        signup_bonus_timeframe: '',
        annual_fee: '',
        first_year_waived: false,
        rewards_rate: '',
        rewards_type: '',
        min_credit_score: '',
        is_business_card: false,
        is_active: true,
        application_url: '',
        point_cash_value: '',
        cash_value: '',
        cash_back_pct: '',
        delta_value: '',
        delta_pct: '',
        marriott_value: '',
        marriott_pct: '',
        hyatt_value: '',
        hyatt_pct: '',
        southwest_value: '',
        southwest_pct: '',
        united_value: '',
        united_pct: '',
        aa_value: '',
        aa_pct: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cardData = {
      card_name: formData.card_name,
      issuer: formData.issuer,
      signup_bonus_value: formData.signup_bonus_value ? parseFloat(formData.signup_bonus_value) : null,
      signup_bonus_requirement: formData.signup_bonus_requirement || null,
      signup_bonus_timeframe: formData.signup_bonus_timeframe || null,
      annual_fee: parseFloat(formData.annual_fee) || 0,
      first_year_waived: formData.first_year_waived,
      rewards_rate: formData.rewards_rate ? parseFloat(formData.rewards_rate) : null,
      rewards_type: formData.rewards_type || null,
      min_credit_score: formData.min_credit_score ? parseInt(formData.min_credit_score) : null,
      is_business_card: formData.is_business_card,
      is_active: formData.is_active,
      application_url: formData.application_url || null,
      point_cash_value: formData.point_cash_value ? parseFloat(formData.point_cash_value) : null,
      cash_value: formData.cash_value ? parseFloat(formData.cash_value) : null,
      cash_back_pct: formData.cash_back_pct ? parseFloat(formData.cash_back_pct) : null,
      delta_value: formData.delta_value ? parseFloat(formData.delta_value) : null,
      delta_pct: formData.delta_pct ? parseFloat(formData.delta_pct) : null,
      marriott_value: formData.marriott_value ? parseFloat(formData.marriott_value) : null,
      marriott_pct: formData.marriott_pct ? parseFloat(formData.marriott_pct) : null,
      hyatt_value: formData.hyatt_value ? parseFloat(formData.hyatt_value) : null,
      hyatt_pct: formData.hyatt_pct ? parseFloat(formData.hyatt_pct) : null,
      southwest_value: formData.southwest_value ? parseFloat(formData.southwest_value) : null,
      southwest_pct: formData.southwest_pct ? parseFloat(formData.southwest_pct) : null,
      united_value: formData.united_value ? parseFloat(formData.united_value) : null,
      united_pct: formData.united_pct ? parseFloat(formData.united_pct) : null,
      aa_value: formData.aa_value ? parseFloat(formData.aa_value) : null,
      aa_pct: formData.aa_pct ? parseFloat(formData.aa_pct) : null,
    }

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    if (editingCard) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('credit_cards') as any)
        .update(cardData)
        .eq('id', editingCard.id)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('credit_cards') as any).insert(cardData)
    }

    setIsDialogOpen(false)
    fetchCards()
  }

  const toggleCardStatus = async (card: CreditCardType) => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('credit_cards') as any)
      .update({ is_active: !card.is_active })
      .eq('id', card.id)
    fetchCards()
  }

  const deleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('credit_cards') as any).delete().eq('id', cardId)
    fetchCards()
  }

  const formatCurrency = (amount: number | null) =>
    amount != null
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(amount)
      : '-'

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Credit Cards</h1>
          <p className="text-muted-foreground">
            Manage the credit card catalog for recommendations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
              </DialogTitle>
              <DialogDescription>
                {editingCard
                  ? 'Update the credit card details'
                  : 'Add a new credit card to the recommendation catalog'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card_name">Card Name *</Label>
                  <Input
                    id="card_name"
                    value={formData.card_name}
                    onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                    placeholder="Chase Sapphire Preferred"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Issuer *</Label>
                  <Input
                    id="issuer"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="Chase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup_bonus_value">Signup Bonus Value ($)</Label>
                  <Input
                    id="signup_bonus_value"
                    type="number"
                    value={formData.signup_bonus_value}
                    onChange={(e) => setFormData({ ...formData, signup_bonus_value: e.target.value })}
                    placeholder="750"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup_bonus_requirement">Bonus Requirement</Label>
                  <Input
                    id="signup_bonus_requirement"
                    value={formData.signup_bonus_requirement}
                    onChange={(e) => setFormData({ ...formData, signup_bonus_requirement: e.target.value })}
                    placeholder="Spend $4,000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup_bonus_timeframe">Bonus Timeframe</Label>
                  <Input
                    id="signup_bonus_timeframe"
                    value={formData.signup_bonus_timeframe}
                    onChange={(e) => setFormData({ ...formData, signup_bonus_timeframe: e.target.value })}
                    placeholder="3 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_fee">Annual Fee ($)</Label>
                  <Input
                    id="annual_fee"
                    type="number"
                    value={formData.annual_fee}
                    onChange={(e) => setFormData({ ...formData, annual_fee: e.target.value })}
                    placeholder="95"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rewards_rate">Rewards Rate (%)</Label>
                  <Input
                    id="rewards_rate"
                    type="number"
                    step="0.1"
                    value={formData.rewards_rate}
                    onChange={(e) => setFormData({ ...formData, rewards_rate: e.target.value })}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rewards_type">Rewards Type</Label>
                  <Input
                    id="rewards_type"
                    value={formData.rewards_type}
                    onChange={(e) => setFormData({ ...formData, rewards_type: e.target.value })}
                    placeholder="travel_points"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_credit_score">Minimum Credit Score</Label>
                  <Input
                    id="min_credit_score"
                    type="number"
                    value={formData.min_credit_score}
                    onChange={(e) => setFormData({ ...formData, min_credit_score: e.target.value })}
                    placeholder="720"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="application_url">Application URL</Label>
                  <Input
                    id="application_url"
                    value={formData.application_url}
                    onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Point Valuations Section */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Point Valuations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="point_cash_value">Point Cash Value (cents/pt)</Label>
                    <Input id="point_cash_value" type="number" step="0.1" value={formData.point_cash_value} onChange={(e) => setFormData({ ...formData, point_cash_value: e.target.value })} placeholder="1.0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cash_value">Cash Value ($)</Label>
                    <Input id="cash_value" type="number" value={formData.cash_value} onChange={(e) => setFormData({ ...formData, cash_value: e.target.value })} placeholder="750" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="delta_value" className="text-xs">Delta Value ($)</Label>
                    <Input id="delta_value" type="number" value={formData.delta_value} onChange={(e) => setFormData({ ...formData, delta_value: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="southwest_value" className="text-xs">Southwest Value ($)</Label>
                    <Input id="southwest_value" type="number" value={formData.southwest_value} onChange={(e) => setFormData({ ...formData, southwest_value: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hyatt_value" className="text-xs">Hyatt Value ($)</Label>
                    <Input id="hyatt_value" type="number" value={formData.hyatt_value} onChange={(e) => setFormData({ ...formData, hyatt_value: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="united_value" className="text-xs">United Value ($)</Label>
                    <Input id="united_value" type="number" value={formData.united_value} onChange={(e) => setFormData({ ...formData, united_value: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marriott_value" className="text-xs">Marriott Value ($)</Label>
                    <Input id="marriott_value" type="number" value={formData.marriott_value} onChange={(e) => setFormData({ ...formData, marriott_value: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aa_value" className="text-xs">AA Value ($)</Label>
                    <Input id="aa_value" type="number" value={formData.aa_value} onChange={(e) => setFormData({ ...formData, aa_value: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="first_year_waived"
                    checked={formData.first_year_waived}
                    onCheckedChange={(checked) => setFormData({ ...formData, first_year_waived: checked })}
                  />
                  <Label htmlFor="first_year_waived">First Year Fee Waived</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_business_card"
                    checked={formData.is_business_card}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_business_card: checked })}
                  />
                  <Label htmlFor="is_business_card">Business Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCard ? 'Update Card' : 'Add Card'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by card name or issuer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Credit Cards</CardTitle>
            <CardDescription>
              {filteredCards.length} cards in catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead className="text-right">Bonus</TableHead>
                    <TableHead>Spend Req</TableHead>
                    <TableHead className="text-right">Annual Fee</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.card_name}</TableCell>
                      <TableCell>{card.issuer}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(card.signup_bonus_value)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {card.signup_bonus_requirement || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(card.annual_fee)}
                        {card.first_year_waived && (
                          <span className="text-xs text-muted-foreground ml-1">(waived)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {card.rewards_rate ? `${card.rewards_rate}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {card.is_business_card && (
                          <Badge variant="outline">Business</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={card.is_active}
                          onCheckedChange={() => toggleCardStatus(card)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(card)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCard(card.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
