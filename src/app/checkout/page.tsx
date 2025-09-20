"use client";
import Footer from "@/components/footer";
import RewardfulScript from "@/components/rewardfull-script";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import pricingPlans from "@/config/pricing-plans.json";
import { ArrowLeft, Check, Crown, Globe, Shield, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SOURCES = [
  { value: "woocommerce", label: "WooCommerce" },
  { value: "shopify", label: "Shopify" },
  { value: "etsy", label: "Etsy" },
  { value: "g2", label: "G2" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan")?.toLowerCase() || "";
  const plan = pricingPlans.find(p => p.tier === planParam);
  const [source, setSource] = useState("");
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(false);

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Star className="h-6 w-6" />;
      case 'pro': return <Zap className="h-6 w-6" />;
      case 'unlimited': return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  useEffect(() => {
    const checkRewardful = () => {
      if (window.Rewardful && typeof window.Rewardful === 'function') {
        window.rewardful('ready', () => {
          setReferral(window.Rewardful.referral)
          console.log('Rewardful.referral', window.Rewardful.referral);
        });
      } else {
        setTimeout(checkRewardful, 100);
      }
    };
    checkRewardful();
  }, []);

  useEffect(() => {
    if (!planParam || !plan) {
      // Redirect to pricing page if plan is missing or invalid
      router.replace("/pricing");
    }
  }, [planParam, plan, router]);

  let buttonText = "Proceed to Payment";
  if (loading) {
    buttonText = "Processing...";
  } else if (planParam === "basic" && !source) {
    buttonText = "Select a data source to continue";
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan?.priceId,
          sources: source ? [source] : [],
          referral,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe or payment page
      } else {
        // Handle error
        toast.error("Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!planParam || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-lg font-semibold text-red-500 mb-2">Plan not found</div>
          <button
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            onClick={() => router.push("/pricing")}
          >
            Go to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <RewardfulScript />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-gray-100 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xl">
                LeadCore AI
              </span>
            </div>
            <div className="hidden items-center space-x-8 md:flex">
              <div className="flex items-center gap-x-3">
                <Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
                  <Link href="/pricing">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Choose Different Plan
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <div className="text-center pt-16">
        <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl">
          Complete your{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            subscription
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 text-lg leading-8">
          Just a few more steps to unlock powerful AI-driven lead generation for your business
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                {getPlanIcon(plan.tier)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-indigo-600">
                    ${(plan.priceMonthly / 100).toLocaleString()}
                  </span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-900">What's included:</h3>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-md leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Configuration */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Configuration</h3>

            {planParam === "basic" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select your data source{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(src => (
                      <SelectItem key={src.value} value={src.value}>
                        {src.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-sm text-gray-500">
                  You can connect additional sources after upgrading to Pro or Unlimited.
                </p>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{plan.name}</span>
                <span className="font-medium text-gray-900">
                  ${(plan.priceMonthly / 100).toLocaleString()}/month
                </span>
              </div>
              {planParam === "basic" && source && (
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-600">Data Source: {SOURCES.find(s => s.value === source)?.label}</span>
                  <span className="text-green-600">Included</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-xl text-indigo-600">
                    ${(plan.priceMonthly / 100).toLocaleString()}/month
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-4 mb-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>30-day Guarantee</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={planParam === "basic" && !source || loading}
              onClick={handleCheckout}
            >
              {loading
                ? "Processing..."
                : buttonText}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By proceeding, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
