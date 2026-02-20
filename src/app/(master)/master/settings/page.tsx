'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  DollarSign,
  Mail,
  Shield,
  Save,
  AlertCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    processingFeePercentage: 3.0,
    minPaymentAmount: 100,
    maxPaymentAmount: 100000,
    supportEmail: 'support@tuitionpay.ai',
    enableDemoMode: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    // In a real app, this would save to the database
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaveMessage('Settings saved successfully!')
    setIsSaving(false)
    setTimeout(() => setSaveMessage(null), 3000)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure global platform settings
        </p>
      </div>

      {saveMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{saveMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Payment Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment processing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="processingFee">Processing Fee (%)</Label>
                  <Input
                    id="processingFee"
                    type="number"
                    step="0.1"
                    value={settings.processingFeePercentage}
                    onChange={(e) => setSettings({ ...settings, processingFeePercentage: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fee charged on each transaction
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minPayment">Minimum Payment ($)</Label>
                  <Input
                    id="minPayment"
                    type="number"
                    value={settings.minPaymentAmount}
                    onChange={(e) => setSettings({ ...settings, minPaymentAmount: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum allowed payment amount
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPayment">Maximum Payment ($)</Label>
                  <Input
                    id="maxPayment"
                    type="number"
                    value={settings.maxPaymentAmount}
                    onChange={(e) => setSettings({ ...settings, maxPaymentAmount: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum allowed payment amount
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email & Notifications
              </CardTitle>
              <CardDescription>
                Configure email and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Email address for customer support inquiries
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for payments and recommendations
                  </p>
                </div>
                <Switch
                  checked={settings.enableEmailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Flags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Demo Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable demo pages for testing and demonstrations
                  </p>
                </div>
                <Switch
                  checked={settings.enableDemoMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableDemoMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-red-600">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the platform for maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API & Integration Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                API & Integrations
              </CardTitle>
              <CardDescription>
                Payment processor and third-party integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  API keys and integration settings are managed via environment variables for security.
                  Contact your system administrator to update these values.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Stripe (Payment Processing)</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: {process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not Configured'}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">Resend (Email Service)</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: {process.env.RESEND_API_KEY ? 'Configured' : 'Disabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
