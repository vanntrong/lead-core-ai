"use client";
import { useRouter } from "@bprogress/next/app";
import {
	ArrowLeft,
	Check,
	Crown,
	Flame,
	Globe,
	Loader2,
	Shield,
	Star,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "@/components/footer";
import RewardfulScript from "@/components/rewardfull-script";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import pricingPlans from "@/config/pricing-plans";

const SOURCES = [
	{ value: "woocommerce", label: "WooCommerce" },
	{ value: "shopify", label: "Shopify" },
	{ value: "etsy", label: "Etsy" },
	{ value: "g2", label: "G2" },
	{ value: "google_places", label: "Google Places" },
	{ value: "npi_registry", label: "NPI Registry" },
	{ value: "fmcsa", label: "FMCSA" },
];

export default function CheckoutPageClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const planParam = searchParams.get("plan")?.toLowerCase() || "";
	const upgradeParam = searchParams.get("upgrade")?.toLowerCase() || "";
	const plan = pricingPlans.find((p) => p.tier === planParam);
	const [source, setSource] = useState("");
	const [referral, setReferral] = useState(null);
	const [loading, setLoading] = useState(false);

	const getPlanIcon = (tier: string) => {
		switch (tier) {
			case "trial":
				return <Flame className="h-6 w-6" />;
			case "basic":
				return <Star className="h-6 w-6" />;
			case "pro":
				return <Zap className="h-6 w-6" />;
			case "unlimited":
				return <Crown className="h-6 w-6" />;
			default:
				return <Star className="h-6 w-6" />;
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

	useEffect(() => {
		if (!(planParam && plan)) {
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
					source: source ?? null,
					referral,
					upgrade: upgradeParam === "true",
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

	if (!(planParam && plan)) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="rounded-xl bg-white p-8 text-center shadow-lg">
					<div className="mb-2 font-semibold text-lg text-red-500">
						Plan not found
					</div>
					<button
						className="mt-2 rounded bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
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
								<Button
									asChild
									className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm hover:bg-gray-50"
									size="sm"
									variant="outline"
								>
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
			<div className="pt-16 text-center">
				<h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl">
					Complete your{" "}
					<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
						subscription
					</span>
				</h1>
				<p className="mx-auto mt-4 max-w-2xl text-gray-600 text-lg leading-8">
					Just a few more steps to unlock powerful AI-driven lead generation for
					your business
				</p>
			</div>

			{/* Main Content */}
			<div className="mx-auto mb-16 max-w-4xl px-4 py-8">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Plan Details */}
					<div className="rounded-2xl bg-white p-8 shadow-lg">
						<div className="mb-6 flex items-center space-x-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
								{getPlanIcon(plan.tier)}
							</div>
							<div>
								<h2 className="font-bold text-2xl text-gray-900">
									{plan.name}
								</h2>
								<div className="flex items-baseline space-x-1">
									<span className="font-bold text-3xl text-indigo-600">
										${(plan.priceMonthly / 100).toLocaleString()}
									</span>
									{plan.tier === "trial" ? (
										<span className="text-gray-500 text-sm">/one-time</span>
									) : (
										<span className="text-gray-500 text-sm">/month</span>
									)}
								</div>
							</div>
						</div>

						<div className="mb-8 space-y-4">
							<h3 className="font-semibold text-gray-900 text-lg">
								What's included:
							</h3>
							<ul className="space-y-3">
								{plan.features.map((feature) => (
									<li
										className={`flex items-start space-x-3 ${feature.startsWith("Empty") && "invisible"}`}
										key={feature}
									>
										<div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
											<Check className="h-3 w-3 text-green-600" />
										</div>
										<span className="text-gray-600 text-md leading-relaxed">
											{feature}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Configuration */}
					<div className="rounded-2xl bg-white p-8 shadow-lg">
						<h3 className="mb-6 font-bold text-gray-900 text-xl">
							Configuration
						</h3>

						{["basic", "trial"].includes(planParam) && (
							<div className="mb-6">
								<label className="mb-3 block font-medium text-gray-700 text-sm">
									Select your data source{" "}
									<span className="ml-1 text-red-500">*</span>
								</label>
								<Select onValueChange={setSource} value={source}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Choose a source..." />
									</SelectTrigger>
									<SelectContent>
										{SOURCES.map((src) => (
											<SelectItem key={src.value} value={src.value}>
												{src.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="mt-2 text-gray-500 text-sm">
									You can connect additional sources after upgrading to Pro or
									Unlimited.
								</p>
							</div>
						)}

						{/* Order Summary */}
						<div className="mb-6 rounded-xl bg-gray-50 p-6">
							<h4 className="mb-4 font-semibold text-gray-900">
								Order Summary
							</h4>
							<div className="mb-2 flex items-center justify-between">
								<span className="text-gray-600">{plan.name}</span>
								{plan.tier === "trial" ? (
									<span className="font-medium text-gray-900">
										${(plan.priceMonthly / 100).toLocaleString()}/one-time
									</span>
								) : (
									<span className="font-medium text-gray-900">
										${(plan.priceMonthly / 100).toLocaleString()}/month
									</span>
								)}
							</div>
							{["basic", "trial"].includes(planParam) && source && (
								<div className="mb-2 flex items-center justify-between text-sm">
									<span className="text-gray-600">
										Data Source:{" "}
										{SOURCES.find((s) => s.value === source)?.label}
									</span>
									<span className="text-green-600">Included</span>
								</div>
							)}
							<div className="mt-3 border-gray-200 border-t pt-3">
								<div className="flex items-center justify-between font-semibold">
									<span className="text-gray-900">Total</span>
									{plan.tier === "trial" ? (
										<span className="text-indigo-600 text-xl">
											${(plan.priceMonthly / 100).toLocaleString()}/one-time
										</span>
									) : (
										<span className="text-indigo-600 text-xl">
											${(plan.priceMonthly / 100).toLocaleString()}/month
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Trust Indicators */}
						<div className="mb-6 flex items-center justify-center space-x-4 text-gray-500 text-sm">
							<div className="flex items-center space-x-1">
								<Shield className="h-4 w-4" />
								<span>Secure Payment</span>
							</div>
							<div className="flex items-center space-x-1">
								<Shield className="h-4 w-4" />
								{plan.tier === "trial" ? (
									<span>Upgrade anytime</span>
								) : (
									<span>30-day Guarantee</span>
								)}
							</div>
						</div>

						{/* Checkout Button */}
						<Button
							className="h-12 w-full transform bg-indigo-600 font-semibold text-lg text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
							disabled={(planParam === "basic" && !source) || loading}
							onClick={handleCheckout}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Processing...
								</>
							) : (
								buttonText
							)}
						</Button>

						<p className="mt-4 text-center text-gray-500 text-xs">
							By proceeding, you agree to our Terms of Service and Privacy
							Policy.
						</p>
					</div>
				</div>
			</div>
			{/* Footer */}
			<Footer />
		</div>
	);
}
