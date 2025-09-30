import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import pricingPlans from "@/config/pricing-plans.json";
import { createClient } from "@/lib/supabase/server";
import { subscriptionService } from "@/services/subscription.service";
import { ArrowRight, Check, Crown, Globe, Shield, Star, Zap } from "lucide-react";
import Link from "next/link";

export default async function PricingPage() {
  const supabase = await createClient();
  const activeSubscription = await subscriptionService.getUserActiveSubscription();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const availablePlans = pricingPlans;

  const getButtonText = (tier: string) => {
    switch (tier) {
      case 'trial': return 'Try for $7';
      case 'basic': return 'Start Basic';
      case 'pro': return 'Get Pro';
      case 'unlimited': return 'Go Unlimited';
      default: return 'Get Started';
    }
  };

  const getCardStyles = (isPopular: boolean, isEnterprise: boolean) => {
    if (isPopular) return 'border-indigo-500 ring-2 ring-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white';
    if (isEnterprise) return 'border-gray-300 bg-white';
    return 'border-gray-200 hover:border-indigo-300';
  };

  const getButtonStyles = (isPopular: boolean, isEnterprise: boolean) => {
    if (isPopular) return 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white focus:ring-indigo-200 shadow-lg hover:shadow-xl transform hover:scale-105';
    if (isEnterprise) return 'bg-gray-700 hover:bg-gray-800 text-white focus:ring-gray-200 shadow-md hover:shadow-lg transform hover:scale-105';
    return 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105';
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Star className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'unlimited': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getIconStyles = (isPopular: boolean, isEnterprise: boolean) => {
    if (isPopular) return "bg-gradient-to-br from-indigo-500 to-purple-600 text-white";
    if (isEnterprise) return "bg-gradient-to-br from-gray-500 to-gray-700 text-white";
    return "bg-gradient-to-br from-gray-600 to-gray-800 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-gray-100 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <Link href="/" className="font-bold text-gray-900 text-xl">
                LeadCore AI
              </Link>
            </div>
            <div className="hidden items-center space-x-8 md:flex">
              <Link
                className="font-medium text-gray-600 hover:text-gray-900"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="font-medium text-gray-600 hover:text-gray-900"
                href="/pricing"
              >
                Pricing
              </Link>
              <div className="flex items-center gap-x-3">
                {!user ? (
                  <>
                    <Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium rounded-lg shadow-sm" size="sm">
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
                    <Link href="/dashboard/leads">Dashboard</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <div className="text-center py-16">
        <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl">
          Simple, transparent{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            pricing
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 text-lg leading-8">
          Start today. Scale when you're ready. Cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {availablePlans.map((plan) => {
              const isPopular = plan.tier === 'pro';
              const isEnterprise = plan.tier === 'unlimited';
              const isCurrentPlan = activeSubscription?.plan_tier === plan.tier;

              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-xl border-2 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg ${isCurrentPlan
                    ? 'border-green-500 bg-gradient-to-br from-green-50/50 to-white'
                    : getCardStyles(isPopular, isEnterprise)
                    }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Current Plan
                      </div>
                    </div>
                  )}
                  {isPopular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    {/* Plan Icon */}
                    <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${isCurrentPlan
                      ? "bg-gradient-to-br from-green-500 to-green-700 text-white"
                      : getIconStyles(isPopular, isEnterprise)
                      }`}>
                      <div className="h-4 w-4">
                        {getPlanIcon(plan.tier)}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${(plan.priceMonthly / 100).toLocaleString()}
                      </span>
                      {
                        plan.tier === 'trial' ?
                          <span className="text-gray-500 ml-1 text-sm">/one-time</span> :
                          <span className="text-gray-500 ml-1 text-sm">/month</span>
                      }
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-center gap-2 group ${feature.startsWith(
                        'Empty'
                      ) ? 'invisible' : ''}`}>
                        <div className="mt-0.5 flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                          <Check className="h-2 w-2 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <div className="w-full py-2 px-3 rounded-lg font-medium text-sm bg-green-100 text-green-700 border-2 border-green-300 text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Check className="h-3 w-3" />
                        Active Plan
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={user ? `/checkout?plan=${plan.tier}` : "/login"}
                      className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${getButtonStyles(isPopular, isEnterprise)} block text-center no-underline ${activeSubscription ? 'pointer-events-none opacity-50' : ''}`}
                      aria-disabled={!!activeSubscription}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {(() => {
                          if (!activeSubscription) return getButtonText(plan.tier);

                          const currentPlanPrice = pricingPlans.find(p => p.tier === activeSubscription.plan_tier)?.priceMonthly || 0;
                          if (plan.priceMonthly > currentPlanPrice) {
                            return 'Upgrade to ' + plan.name;
                          } else {
                            return 'Switch to ' + plan.name;
                          }
                        })()}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  )}

                  {/* Trust Badge */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Shield className="h-2.5 w-2.5" />
                      <span className="text-center leading-tight">
                        {plan.tier === 'trial' ? 'Try AI-powered leads' : '30-day guarantee'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
