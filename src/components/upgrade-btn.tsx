import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import pricingPlans from "@/config/pricing-plans.json" with { type: "json" };
import type { PlanTier } from "@/types/subscription";
import { Crown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RewardfulScript from "./rewardfull-script";

interface UpgradeButtonProps {
	currentPlan: PlanTier;
	title?: string;
	className?: string;
}

export function UpgradeButton({
	currentPlan,
	title,
	className,
}: UpgradeButtonProps) {
	const [open, setOpen] = useState(false);
	const [isLoading, seIstLoading] = useState(false);
	const [referral, setReferral] = useState(null);

	const getNextPlan = (plan: PlanTier): PlanTier | null => {
		if (plan === "basic" || plan === "trial") { return "pro"; }
		if (plan === "pro") { return "unlimited"; }
		return null;
	};

	// Determine next plan tier
	const nextPlan = getNextPlan(currentPlan);

	// Get features for next plan from pricingPlans
	const nextPlanFeatures =
		pricingPlans
			.find((p) => p.tier === nextPlan)
			?.features?.filter((f) => !f.startsWith("Empty")) || [];
	const plan = pricingPlans.find((p) => p.tier === nextPlan);

	const handleCheckout = async () => {
		seIstLoading(true);
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
			seIstLoading(false);
		}
	};

	useEffect(() => {
		const checkRewardful = () => {
			if (window.Rewardful && typeof window.Rewardful === "function") {
				window.rewardful("ready", () => {
					setReferral(window.Rewardful.referral);
					console.log("Rewardful.referral", window.Rewardful.referral);
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
			<Button
				className={`h-9 from-indigo-600 to-purple-600 ${className}`}
				onClick={() => setOpen(true)}
				size="sm"
				type="button"
			>
				<Crown className="mr-2 h-4 w-4 text-yellow-300" />
				{title || "Upgrade to add leads"}
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent onInteractOutside={(e) => e.preventDefault()}>
					<DialogHeader>
						<DialogTitle>Confirm Upgrade</DialogTitle>
						<DialogDescription asChild>
							<div className="mt-4 rounded-xl border border-indigo-10 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-4">
								<div className="mb-4 flex items-center gap-2">
									<Crown className="h-4 w-4 text-indigo-600" />
									<span className="font-semibold text-gray-900 text-sm">
										Upgrade to{" "}
										{pricingPlans.find((p) => p.tier === nextPlan)?.name}
									</span>
								</div>
								<div className="space-y-3">
									{nextPlanFeatures.map((feature) => (
										<div key={feature} className="group flex items-start gap-3">
											<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
												<svg
													className="h-2.5 w-2.5 text-white"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											<span className="text-gray-700 text-sm leading-relaxed transition-colors group-hover:text-gray-900">
												{feature}
											</span>
										</div>
									))}
								</div>
								<div className="mt-4 border-indigo-100 border-t pt-3">
									<div className="flex items-center justify-between">
										<span className="text-gray-500 text-xs">Starting at</span>
										<span className="font-bold text-gray-900 text-lg">
											$
											{(pricingPlans.find((p) => p.tier === nextPlan)
												?.priceMonthly || 0) / 100}
											/mo
										</span>
									</div>
								</div>
							</div>
						</DialogDescription>
					</DialogHeader>
					<div className="mt-2 flex space-x-3 border-gray-200 border-t pt-6">
						<DialogClose asChild>
							<Button
								className="flex-1"
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
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
								"Confirm Upgrade"
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
