import pricingPlans from "@/config/pricing-plans.json";
import { createClient } from "@/lib/supabase/server";
import { subscriptionService } from "@/services/subscription.service";
import { ArrowRight, Check, Crown, Flame, Shield, Star, Zap } from "lucide-react";
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
      case 'trial': return 'Scrape 25 Leads for $7';
      case 'basic': return 'Start for $97';
      case 'pro': return 'Scale with Pro';
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
      case 'trial': return <Flame className="h-6 w-6" />; // or Sparkle, Rocket, Lightbulb
      case 'basic': return <Star className="h-6 w-6" />;
      case 'pro': return <Zap className="h-6 w-6" />;
      case 'unlimited': return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getIconStyles = (isPopular: boolean, isEnterprise: boolean) => {
    if (isPopular) return "bg-gradient-to-br from-indigo-500 to-purple-600 text-white";
    if (isEnterprise) return "bg-gradient-to-br from-gray-500 to-gray-700 text-white";
    return "bg-gradient-to-br from-gray-600 to-gray-800 text-white";
  };

  return (
    <div className={availablePlans?.length === 3 ? "max-w-6xl mx-auto" : "max-w-3xl mx-auto"}>
      <div className={`grid grid-cols-1 gap-8 ${availablePlans?.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
        {availablePlans.map((plan) => {
          const isPopular = plan.tier === 'pro';
          const isEnterprise = plan.tier === 'unlimited';
          const isCurrentPlan = activeSubscription?.plan_tier === plan.tier;

          return (
            <div
              key={plan.tier}
              className={`relative rounded-2xl border-2 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${isCurrentPlan
                ? 'border-green-500 bg-gradient-to-br from-green-50/50 to-white'
                : getCardStyles(isPopular, isEnterprise)
                }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                </div>
              )}
              {isPopular && !isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                {/* Plan Icon */}
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${isCurrentPlan
                  ? "bg-gradient-to-br from-green-500 to-green-700 text-white"
                  : getIconStyles(isPopular, isEnterprise)
                  }`}>
                  {getPlanIcon(plan.tier)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-3">
                  <span className="text-4xl font-bold text-gray-900">
                    ${(plan.priceMonthly / 100).toLocaleString()}
                  </span>
                  {
                    plan.tier === 'trial' ?
                      <span className="text-gray-500 ml-1">/one-time</span> :
                      <span className="text-gray-500 ml-1">/month</span>
                  }
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-2 group ${feature.startsWith(
                    'Empty'
                  ) ? 'invisible' : ''}`}>
                    <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                      <Check className="h-2.5 w-2.5 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-md leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="w-full py-3 px-5 rounded-xl font-semibold text-base bg-green-100 text-green-700 border-2 border-green-300 text-center">
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" />
                    Active Plan
                  </span>
                </div>
              ) : (
                <Link
                  href={user ? `/checkout?plan=${plan.tier}` : "/login"}
                  className={`w-full py-3 px-5 rounded-xl font-semibold text-base transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${getButtonStyles(isPopular, isEnterprise)} block text-center no-underline`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {(() => {
                      if (!activeSubscription) return getButtonText(plan.tier);

                      const currentPlanPrice = pricingPlans.find(p => p.tier === activeSubscription.plan_tier)?.priceMonthly || 0;
                      if (plan.priceMonthly > currentPlanPrice) {
                        return 'Upgrade to ' + plan.name;
                      } else {
                        return 'Switch to ' + plan.name;
                      }
                    })()}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )}

              {/* Trust Badge */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>
                    {plan.tier === 'trial' ? 'Get a taste of AI-powered lead gen. Upgrade anytime for more volume' : '30-day money-back guarantee. Cancel anytime'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
