'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, CreditCard, Clock } from 'lucide-react'
import { formatPrice, getTrialDaysRemaining, type SubscriptionWithPlan } from '@/lib/subscription-old'

interface TrialBannerProps {
  subscription: SubscriptionWithPlan
  onUpgrade?: () => void
}

export function TrialBanner({ subscription, onUpgrade }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || subscription.status !== 'trialing') {
    return null
  }

  const daysRemaining = getTrialDaysRemaining(subscription)

  if (daysRemaining <= 0) {
    return null
  }

  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      // Create billing portal session
      try {
        const response = await fetch('/api/create-billing-portal', {
          method: 'POST',
        })

        if (response.ok) {
          const { url } = await response.json()
          window.location.href = url
        }
      } catch (error) {
        console.error('Error creating billing portal:', error)
      }
    }
  }

  const getBannerColor = (days: number) => {
    if (days <= 1) return 'bg-red-50 border-red-200 text-red-900'
    if (days <= 3) return 'bg-orange-50 border-orange-200 text-orange-900'
    return 'bg-blue-50 border-blue-200 text-blue-900'
  }

  const getIconColor = (days: number) => {
    if (days <= 1) return 'text-red-600'
    if (days <= 3) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getUrgencyText = (days: number) => {
    if (days <= 1) return 'Your trial expires today!'
    if (days === 1) return 'Your trial expires tomorrow!'
    return `${days} days left in your trial`
  }

  return (
    <div className={`relative ${getBannerColor(daysRemaining)} border rounded-lg p-4 mb-6 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full bg-white/80 ${getIconColor(daysRemaining)}`}>
            <Clock className="h-4 w-4" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">
                {getUrgencyText(daysRemaining)}
              </h3>
              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white/60">
                {subscription.plan.name} Plan
              </Badge>
            </div>

            <p className="text-sm opacity-80">
              Upgrade now to continue enjoying all features without interruption.
              Starting at {formatPrice(subscription.plan.price_monthly)}/month.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="bg-white/90 hover:bg-white text-gray-900 shadow-sm border border-white/50"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Upgrade Now
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-current hover:bg-white/20 p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar for visual urgency */}
      <div className="mt-3">
        <div className="flex justify-between text-xs opacity-70 mb-1">
          <span>Trial Progress</span>
          <span>{7 - daysRemaining}/7 days used</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${daysRemaining <= 1 ? 'bg-red-500' :
                daysRemaining <= 3 ? 'bg-orange-500' : 'bg-blue-500'
              }`}
            style={{ width: `${((7 - daysRemaining) / 7) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Server-side wrapper to check subscription and render banner
interface TrialBannerWrapperProps {
  subscription?: SubscriptionWithPlan | null
  onUpgrade?: () => void
}

export function TrialBannerWrapper({ subscription, onUpgrade }: TrialBannerWrapperProps) {
  if (!subscription || subscription.status !== 'trialing') {
    return null
  }

  return <TrialBanner subscription={subscription} onUpgrade={onUpgrade} />
}
