'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  CreditCard,
  DollarSign,
  Shield,
  Bell,
  Mail,
  Database,
  Code,
} from 'lucide-react'
import { DEMO_MODE } from '@/lib/demo-data'

export default function SuperAdminSettingsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure TuitionPay platform settings
          {DEMO_MODE && (
            <Badge variant="outline" className="ml-2 text-xs bg-violet-100 text-violet-700 border-violet-200">Demo Mode</Badge>
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Payment Settings
            </CardTitle>
            <CardDescription>Configure payment processing defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Revenue Share (%)</Label>
              <Input type="number" defaultValue="1.50" step="0.01" disabled={DEMO_MODE} />
              <p className="text-xs text-muted-foreground">Platform fee percentage on each transaction</p>
            </div>
            <div className="space-y-2">
              <Label>Processing Fee Rate (%)</Label>
              <Input type="number" defaultValue="3.00" step="0.01" disabled={DEMO_MODE} />
              <p className="text-xs text-muted-foreground">Credit card processing fee passed to parents</p>
            </div>
            <Button disabled={DEMO_MODE}>Save Payment Settings</Button>
          </CardContent>
        </Card>

        {/* Helcim Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Helcim Integration
            </CardTitle>
            <CardDescription>Payment gateway configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">API Status</p>
                <p className="text-sm text-muted-foreground">Connection to Helcim</p>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-0">
                {DEMO_MODE ? 'Demo Mode' : 'Connected'}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" defaultValue="••••••••••••••••" disabled={DEMO_MODE} />
            </div>
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input defaultValue={DEMO_MODE ? 'DEMO-ACCOUNT' : ''} disabled={DEMO_MODE} />
            </div>
            <Button variant="outline" disabled={DEMO_MODE}>Test Connection</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-violet-600" />
              Notifications
            </CardTitle>
            <CardDescription>Email and alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Application Alerts</p>
                <p className="text-sm text-muted-foreground">Email when schools apply</p>
              </div>
              <Switch defaultChecked disabled={DEMO_MODE} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Failures</p>
                <p className="text-sm text-muted-foreground">Alert on failed transactions</p>
              </div>
              <Switch defaultChecked disabled={DEMO_MODE} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Summary</p>
                <p className="text-sm text-muted-foreground">Daily transaction report</p>
              </div>
              <Switch disabled={DEMO_MODE} />
            </div>
            <div className="space-y-2">
              <Label>Notification Email</Label>
              <Input type="email" defaultValue="team@tuitionpay.ai" disabled={DEMO_MODE} />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Security
            </CardTitle>
            <CardDescription>Platform security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
              </div>
              <Switch defaultChecked disabled={DEMO_MODE} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">IP Whitelisting</p>
                <p className="text-sm text-muted-foreground">Restrict admin access by IP</p>
              </div>
              <Switch disabled={DEMO_MODE} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Audit Logging</p>
                <p className="text-sm text-muted-foreground">Log all admin actions</p>
              </div>
              <Switch defaultChecked disabled={DEMO_MODE} />
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-600" />
              Database
            </CardTitle>
            <CardDescription>Supabase connection status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Connection Status</p>
                <p className="text-sm text-muted-foreground">Supabase database</p>
              </div>
              <Badge className={DEMO_MODE ? 'bg-amber-100 text-amber-700 border-0' : 'bg-emerald-100 text-emerald-700 border-0'}>
                {DEMO_MODE ? 'Demo Mode' : 'Connected'}
              </Badge>
            </div>
            {DEMO_MODE && (
              <p className="text-sm text-muted-foreground bg-amber-50 p-3 rounded-lg">
                Running in demo mode with sample data. Configure Supabase environment variables to connect to a real database.
              </p>
            )}
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-slate-600" />
              API & Webhooks
            </CardTitle>
            <CardDescription>API configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input defaultValue="https://tuitionpay.ai/api/webhooks/helcim" disabled />
              <p className="text-xs text-muted-foreground">Configure this URL in Helcim dashboard</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Rate Limiting</p>
                <p className="text-sm text-muted-foreground">100 requests/minute</p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
