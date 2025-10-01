import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import pricingPlans from "@/config/pricing-plans.json";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { PlanTier } from "@/types/subscription";
import { Crown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RewardfulScript from "../rewardfull-script";

interface ErrorLimitMessageProps {
  message?: string | null;
  onClose?: () => void;
}

export function ErrorLimitMessage({ message, onClose }: ErrorLimitMessageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [referral, setReferral] = useState(null);
  const { data: userSubscription } = useUserActiveSubscription();

  const handleClose = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  }

  const getNextPlan = (plan: PlanTier): PlanTier | null => {
    if (plan === "basic" || plan === "trial") return "pro";
    if (plan === "pro") return "unlimited";
    return null;
  };

  // Determine next plan tier
  const nextPlan = getNextPlan(userSubscription?.plan_tier ?? "trial");

  // Get features for next plan from pricingPlans
  const plan = pricingPlans.find(p => p.tier === nextPlan);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan?.priceId,
          source: null,
          referral,
          upgrade: true,
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
      setIsLoading(false);
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

  return (
    <>
      <RewardfulScript />
      <Dialog open={!!message} onOpenChange={handleClose}>
        <DialogContent onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Confirm Upgrade</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 mt-4">
                {
                  message === "Lead limit exceeded" ? (
                    <>
                      {
                        ["trial", "basic"].includes(userSubscription?.plan_tier || "trial") ? (
                          <>
                            <p className="text-gray-900">You’ve reached your {userSubscription?.plan_tier || "trial"} limit ({userSubscription?.usage_limits?.max_leads || 0} leads).</p>
                            <p className="text-gray-900">Unlock 500 scrapes/mo + SmartSend (150 emails/day) → Upgrade to Pro ($297/mo).</p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-900">You’ve reached your {userSubscription?.plan_tier || "trial"} limit ({userSubscription?.usage_limits?.max_leads || 0} leads).</p>
                            <p className="text-gray-900">Unlock unlimited scrapes + SmartSend (150 emails/day) → Upgrade to Unlimited ($497/mo).</p>
                          </>
                        )
                      }</>
                  ) : <p className="text-gray-900">{message}</p>
                }
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3 border-gray-200 border-t pt-6 mt-2">
            <DialogClose asChild>
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="flex-1 from-indigo-600 to-purple-600"
              type="button"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4 text-yellow-300" />
                  Upgrade now
                </>
              )
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}