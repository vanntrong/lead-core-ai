import pricingPlans from "@/config/pricing-plans.json";
import { ArrowRight, Check, Crown, Shield, Star, Zap } from "lucide-react";
import Link from "next/link";

export default async function PricingPlants() {
  const getButtonText = (tier: string) => {
    switch (tier) {
      case 'basic': return 'Start for $97';
      case 'pro': return 'Scale with Pro';
      case 'unlimited': return 'Go Unlimited';
      default: return 'Get Started';
    }
  };

  const getCardStyles = (isPopular: boolean, isEnterprise: boolean) => {
    if (isPopular) return 'border-indigo-500 scale-105 ring-2 ring-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white';
    if (isEnterprise) return 'border-purple-500 bg-gradient-to-br from-purple-50 to-white';
    return 'border-gray-200 hover:border-indigo-300';
  };

  const getButtonStyles = (isPopular: boolean, isEnterprise: boolean) => {
    if (isPopular) return 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white focus:ring-indigo-200 shadow-lg hover:shadow-xl transform hover:scale-105';
    if (isEnterprise) return 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-200 shadow-lg hover:shadow-xl transform hover:scale-105';
    return 'bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105';
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Star className="h-6 w-6" />;
      case 'pro': return <Zap className="h-6 w-6" />;
      case 'unlimited': return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getIconStyles = (isPopular: boolean, isEnterprise: boolean) => {
    if (isPopular) return "bg-gradient-to-br from-indigo-500 to-purple-600 text-white";
    if (isEnterprise) return "bg-gradient-to-br from-purple-500 to-purple-700 text-white";
    return "bg-gradient-to-br from-gray-600 to-gray-800 text-white";
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24">
      <div className="px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing — built for growth</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Start today. Scale when you're ready. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => {
              const isPopular = plan.tier === 'pro';
              const isEnterprise = plan.tier === 'unlimited';

              return (
                <div
                  key={plan.tier}
                  className={`relative rounded-2xl border-2 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${getCardStyles(isPopular, isEnterprise)}`}
                >

                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    {/* Plan Icon */}
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${getIconStyles(isPopular, isEnterprise)}`}>
                      {getPlanIcon(plan.tier)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center mb-3">
                      <span className="text-4xl font-bold text-gray-900">
                        ${(plan.priceMonthly / 100).toLocaleString()}
                      </span>
                      <span className="text-gray-500 ml-1">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 group">
                        <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                          <Check className="h-2.5 w-2.5 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-md leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/checkout?plan=${plan.tier}`}
                    className={`w-full py-3 px-5 rounded-xl font-semibold text-base transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 ${getButtonStyles(isPopular, isEnterprise)} block text-center no-underline`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {getButtonText(plan.tier)}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>

                  {/* Trust Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
