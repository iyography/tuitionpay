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
import { Plus, Pencil, Trash2, CreditCard, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
    const supabase = createClient()
    const { data } = await supabase
      .from('credit_cards')
      .select('*')
      .order('issuer', { ascending: true })

    if (data) {
      setCards(data)
    }
    setIsLoading(false)
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
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

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
    }

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
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('credit_cards') as any)
      .update({ is_active: !card.is_active })
      .eq('id', card.id)
    fetchCards()
  }

  const deleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return

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
