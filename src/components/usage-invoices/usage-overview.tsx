import pricingPlans from "@/config/pricing-plans.json";
import { leadSourceColorConfig } from "@/constants/saas-source";
import { Subscription } from "@/types/subscription";
import { BarChart3, Calendar, CheckCircle, Crown, DollarSign, Zap } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useRouter } from "@bprogress/next/app";

interface UsageOverviewProps {
  activeSubscription?: Subscription | null;
}

export const UsageOverview: React.FC<UsageOverviewProps> = ({
  activeSubscription,
}) => {
  const router = useRouter();

  const _subscription = activeSubscription;
  // Map subscription to plan from pricingPlans
  const mappedPlan = _subscription
    ? pricingPlans.find(
      (plan) =>
        plan.tier === _subscription.plan_tier
    )
    : null;

  let planColor = "text-gray-900";
  if (mappedPlan?.tier === "basic") planColor = "text-gray-500";
  else if (mappedPlan?.tier === "pro") planColor = "text-indigo-500";
  else if (mappedPlan?.tier === "unlimited") planColor = "text-purple-500";

  const isExportEnabled = _subscription?.usage_limits?.export_enabled ?? false;
  const isZapierExport = _subscription?.usage_limits?.zapier_export ?? false;

  if (!activeSubscription) {
    return (
      <Card className="border-gray-200 bg-white p-8 shadow-sm text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Crown className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Active Plan</h3>
            <p className="text-gray-600 text-sm">You don't have an active subscription plan yet.</p>
          </div>
          <Button
            onClick={() => router.push("/pricing")}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Crown className="mr-2 h-4 w-4 text-yellow-300" />
            Choose a Plan
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Plan & Features Cards */}
      <div className="lg:col-span-1">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">Current Plan</p>
                <p className={`font-bold text-xl text-gray-900`}>{mappedPlan?.name || 'No Plan'}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                <Crown className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">Plan Price</p>
                <p className="font-bold text-xl text-gray-900">
                  ${((mappedPlan?.priceMonthly ?? 0) / 100).toLocaleString()}
                  <span className="text-gray-500 text-base font-medium">/mo</span>
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </Card>
          <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">Export Enabled</p>
                <p className={`font-bold text-xl ${isExportEnabled ? 'text-gray-900' : 'text-gray-400'}`}>{isExportEnabled ? "Enabled" : "Disabled"}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isExportEnabled ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                <CheckCircle className={`h-5 w-5 ${isExportEnabled ? 'text-indigo-600' : 'text-gray-400'}`} />
              </div>
            </div>
          </Card>
          <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-600 text-sm">Zapier Export</p>
                <p className={`font-bold text-xl ${isZapierExport ? 'text-gray-900' : 'text-gray-400'}`}>{isZapierExport ? "Enabled" : "Disabled"}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isZapierExport ? 'bg-orange-50' : 'bg-gray-100'}`}>
                <Zap className={`h-5 w-5 ${isZapierExport ? 'text-orange-400' : 'text-gray-400'}`} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Current Usage Progress */}
      <Card className="border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {new Date(activeSubscription?.period_start ?? "").toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })} - {new Date(activeSubscription?.period_end ?? "").toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div>
            {/* Usage percentage logic */}
            {(() => {
              let usagePercentageDisplay;
              if (activeSubscription?.plan_tier === 'unlimited') {
                usagePercentageDisplay = 'Unlimited';
              } else if (
                activeSubscription?.usage_limits?.max_leads &&
                activeSubscription?.usage_limits?.current_leads !== undefined
              ) {
                usagePercentageDisplay = `${Math.round(((activeSubscription?.usage_limits?.current_leads ?? 0) / activeSubscription?.usage_limits?.max_leads) * 100)}%`;
              } else {
                usagePercentageDisplay = 'Unlimited';
              }
              return (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Leads Used: {activeSubscription?.usage_limits?.current_leads}
                    {(() => {
                      if (activeSubscription?.plan_tier === 'unlimited') {
                        return <></>;
                      } else if (activeSubscription?.usage_limits?.max_leads) {
                        return ` / ${activeSubscription?.usage_limits?.max_leads}`;
                      } else {
                        return <span className="ml-2 px-2 py-0.5 rounded bg-purple-50 text-indigo-700 font-semibold">Unlimited</span>;
                      }
                    })()}
                  </span>
                  <span className={`text-sm font-semibold text-indigo-700`}>
                    {usagePercentageDisplay}
                  </span>
                </div>
              );
            })()}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              {(() => {
                let progressBarClass = 'bg-gradient-to-r from-indigo-400 to-indigo-700';
                let progressBarWidth = '100%';
                if (activeSubscription?.usage_limits?.max_leads && activeSubscription?.plan_tier !== 'unlimited') {
                  progressBarWidth = `${Math.min((activeSubscription.usage_limits.current_leads / activeSubscription?.usage_limits?.max_leads) * 100, 100)}%`;
                }
                return (
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${progressBarClass}`}
                    style={{ width: progressBarWidth }}
                  />
                );
              })()}
            </div>
          </div>
        </div>
        {/* Sources List */}
        <div>
          <div className="flex flex-wrap gap-2">
            {activeSubscription?.usage_limits?.sources?.map((source: string) => (
              <span
                key={source}
                className={`inline-block px-3 py-1 rounded-full border text-xs font-medium shadow-sm transition-colors duration-150 ${leadSourceColorConfig[source]?.badge || 'bg-gray-100 text-gray-600 border-gray-300'}`}
              >
                {leadSourceColorConfig[source]?.label || source}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
