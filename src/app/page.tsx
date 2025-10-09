import "@/app/globals.css";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/utils/helper";
import {
	ArrowRight,
	CheckCircle,
	Globe,
	MessageSquare,
	Play,
	Shield,
	Star,
	Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PricingPlants from "@/components/pricing-plants";
import { DemoDialog } from "@/components/demo-dialog";

export default async function Home() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isAdmin = getAdminEmails().includes(user?.email || "");

	return (
		<div className="min-h-screen bg-white">
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
								className="font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
								href="/pricing"
							>
								Pricing
							</Link>
							<div className="flex items-center gap-x-3">
								{!user ? (
									<>
										<Button
											asChild
											className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm transition-all duration-200 hover:bg-gray-50"
											size="sm"
											variant="outline"
										>
											<Link href="/login">Sign in</Link>
										</Button>
										<Button
											asChild
											className="h-10 rounded-lg bg-indigo-600 px-4 font-medium text-sm text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md"
											size="sm"
										>
											<Link href="/signup">Sign up</Link>
										</Button>
									</>
								) : (
									<Button
										asChild
										className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm transition-all duration-200 hover:bg-gray-50"
										size="sm"
										variant="outline"
									>
										<Link
											href={
												isAdmin ? "/admin/dashboard/scraper-logs" : "/dashboard"
											}
										>
											Dashboard
										</Link>
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
				{/* Background decoration */}
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjNmNGY2IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
				<div className="-translate-y-1/2 absolute top-0 right-0 translate-x-1/2">
					<div className="h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 blur-3xl" />
				</div>
				<div className="-translate-x-1/2 absolute bottom-0 left-0 translate-y-1/2">
					<div
						className="h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 opacity-20 blur-3xl"
						style={{ animationDelay: "1s" }}
					/>
				</div>

				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="pt-16 pb-12 lg:pt-20 lg:pb-16">
						<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
							{/* Content Section */}
							<div className="animate-fade-in-up text-left">
								<h1 className="font-bold text-4xl text-gray-900 leading-tight tracking-tight sm:text-5xl lg:text-6xl">
									AI-powered lead generation made{" "}
									<span className="animate-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
										simple.
									</span>
								</h1>
								<p
									className="mt-6 animate-fade-in-up text-gray-600 text-lg leading-8"
									style={{ animationDelay: "0.2s" }}
								>
									Find, enrich, and export leads from Shopify, G2, Etsy & more —
									in seconds.
								</p>
								<div
									className="mt-8 flex animate-fade-in-up flex-col gap-4 sm:flex-row"
									style={{ animationDelay: "0.4s" }}
								>
									<Button
										asChild
										className="h-12 rounded-xl bg-indigo-600 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
										size="lg"
									>
										<Link
											className="flex items-center justify-center"
											href="/signup"
										>
											Start for $97&nbsp;&rarr;
										</Link>
									</Button>
									<DemoDialog>
										<Button
											className="h-12 rounded-xl border border-gray-300 bg-white px-8 font-semibold text-indigo-600 text-lg shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl"
											size="lg"
										>
											<Play className="mr-2 h-5 w-5" />
											Watch Demo
										</Button>
									</DemoDialog>
								</div>
							</div>

							{/* Dashboard Screenshot Visual */}
							<div
								className="animate-fade-in-up"
								style={{ animationDelay: "0.6s" }}
							>
								<div className="relative">
									{/* Main Dashboard Screenshot */}
									<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
										<div className="border-gray-200 border-b bg-gray-50 px-6 py-4">
											<div className="flex items-center gap-2">
												<div className="h-3 w-3 rounded-full bg-red-400" />
												<div className="h-3 w-3 rounded-full bg-yellow-400" />
												<div className="h-3 w-3 rounded-full bg-green-400" />
												<div className="ml-4 text-gray-600 text-sm">
													LeadCore AI Dashboard
												</div>
											</div>
										</div>
										<div className="relative aspect-16/8 w-full overflow-hidden">
											<Image
												src="/images/dashboard.png"
												alt="LeadCore AI Dashboard showing the complete workflow from scrape to export"
												fill
												className="bg-white object-contain"
												priority
											/>
										</div>
									</div>

									{/* Floating Elements */}
									<div className="-top-4 -right-4 absolute h-8 w-8 animate-bounce rounded-full bg-indigo-500" />
									<div className="-bottom-6 -left-6 absolute h-6 w-6 animate-pulse rounded-full bg-purple-500" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Social Proof Section */}
			<section className="bg-white py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="mb-10 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 font-medium text-indigo-700 text-sm">
							<Star className="h-4 w-4" />
							Trusted by 10,000+ founders & agencies.
						</div>
						<div className="mb-12 flex flex-wrap items-center justify-center gap-8">
							{/* Placeholder logos - increased size */}
							<div className="flex h-14 w-32 items-center justify-center rounded-lg bg-gray-100">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none">
									<rect width="80" height="32" rx="8" fill="#e5e7eb" />
									<text
										x="50%"
										y="50%"
										textAnchor="middle"
										dy=".3em"
										fontSize="16"
										fill="#9ca3af"
									>
										Logo
									</text>
								</svg>
							</div>
							<div className="flex h-14 w-32 items-center justify-center rounded-lg bg-gray-100">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none">
									<rect width="80" height="32" rx="8" fill="#e5e7eb" />
									<text
										x="50%"
										y="50%"
										textAnchor="middle"
										dy=".3em"
										fontSize="16"
										fill="#9ca3af"
									>
										Logo
									</text>
								</svg>
							</div>
							<div className="flex h-14 w-32 items-center justify-center rounded-lg bg-gray-100">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none">
									<rect width="80" height="32" rx="8" fill="#e5e7eb" />
									<text
										x="50%"
										y="50%"
										textAnchor="middle"
										dy=".3em"
										fontSize="16"
										fill="#9ca3af"
									>
										Logo
									</text>
								</svg>
							</div>
							<div className="flex h-14 w-32 items-center justify-center rounded-lg bg-gray-100">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none">
									<rect width="80" height="32" rx="8" fill="#e5e7eb" />
									<text
										x="50%"
										y="50%"
										textAnchor="middle"
										dy=".3em"
										fontSize="16"
										fill="#9ca3af"
									>
										Logo
									</text>
								</svg>
							</div>
							<div className="flex h-14 w-32 items-center justify-center rounded-lg bg-gray-100">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none">
									<rect width="80" height="32" rx="8" fill="#e5e7eb" />
									<text
										x="50%"
										y="50%"
										textAnchor="middle"
										dy=".3em"
										fontSize="16"
										fill="#9ca3af"
									>
										Logo
									</text>
								</svg>
							</div>
						</div>
						<div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
							<div className="text-center">
								<div className="mb-2 font-bold text-3xl text-indigo-600">
									50M+
								</div>
								<div className="text-gray-600 text-sm">Leads generated</div>
							</div>
							<div className="text-center">
								<div className="mb-2 font-bold text-3xl text-green-600">
									95%
								</div>
								<div className="text-gray-600 text-sm">Verified accuracy</div>
							</div>
							<div className="text-center">
								<div className="mb-2 font-bold text-3xl text-purple-600">
									98%
								</div>
								<div className="text-gray-600 text-sm">
									Customer satisfaction
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<div
				className="bg-gradient-to-br from-gray-50 to-gray-100 py-24"
				id="features"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10 text-center">
						<h2 className="mb-4 font-bold text-3xl text-gray-900">Benefits</h2>
						<p className="mx-auto max-w-2xl text-gray-600 text-lg">
							All-in-one platform to find, enrich, and export high-quality
							leads—fast, accurate, and easy for everyone.
						</p>
					</div>
					<div className="flex justify-center">
						<div className="grid max-w-5xl grid-cols-1 items-stretch justify-center gap-8 md:grid-cols-2">
							{/* Scrape Leads in Seconds */}
							<div className="group">
								<div className="hover:-translate-y-1 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
									<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									<div className="relative">
										<div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 transition-transform duration-300 group-hover:scale-110">
											<Globe className="h-7 w-7 text-indigo-600" />
										</div>
										<h3 className="mb-4 text-center font-bold text-gray-900 text-xl">
											Scrape Leads in Seconds
										</h3>
										<p className="mb-4 text-center text-gray-600 leading-relaxed">
											Shopify, G2, Woo, Etsy, and more.
										</p>
									</div>
								</div>
							</div>

							{/* Enrich with AI Precision */}
							<div className="group">
								<div className="hover:-translate-y-1 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
									<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									<div className="relative">
										<div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 transition-transform duration-300 group-hover:scale-110">
											<Zap className="h-7 w-7 text-green-600" />
										</div>
										<h3 className="mb-4 text-center font-bold text-gray-900 text-xl">
											Enrich with AI Precision
										</h3>
										<p className="mb-4 text-center text-gray-600 leading-relaxed">
											Claude enrichment (ICP fit, tech stack, contacts){" "}
										</p>
									</div>
								</div>
							</div>

							{/* Verify Before You Send */}
							<div className="group">
								<div className="hover:-translate-y-1 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
									<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									<div className="relative">
										<div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 transition-transform duration-300 group-hover:scale-110">
											<Shield className="h-7 w-7 text-blue-600" />
										</div>
										<h3 className="mb-4 text-center font-bold text-gray-900 text-xl">
											Verify Before You Send
										</h3>
										<p className="mb-4 text-center text-gray-600 leading-relaxed">
											Real-time email validation
										</p>
									</div>
								</div>
							</div>

							{/* Export Anywhere */}
							<div className="group">
								<div className="hover:-translate-y-1 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
									<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									<div className="relative">
										<div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 transition-transform duration-300 group-hover:scale-110">
											<MessageSquare className="h-7 w-7 text-orange-600" />
										</div>
										<h3 className="mb-4 text-center font-bold text-gray-900 text-xl">
											Export Anywhere
										</h3>
										<p className="mb-4 text-center text-gray-600 leading-relaxed">
											CSV, Google Sheets, Zapier, CRM
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Feature Highlight Section (new session) */}
			<section className="bg-white py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Section Header */}
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-3xl text-gray-900">
							From raw data to qualified leads in 60 seconds
						</h2>
					</div>

					{/* Screenshots Grid */}
					<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
						{/* Lead Table Screenshot */}
						<div className="group">
							<div className="relative">
								{/* Browser Window Frame */}
								<div className="transform overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
									<div className="border-gray-200 border-b bg-gray-50 px-6 py-4">
										<div className="flex items-center gap-2">
											<div className="h-3 w-3 rounded-full bg-red-400" />
											<div className="h-3 w-3 rounded-full bg-yellow-400" />
											<div className="h-3 w-3 rounded-full bg-green-400" />
											<div className="ml-4 text-gray-600 text-sm">
												Lead Dashboard
											</div>
										</div>
									</div>
									<div className="relative aspect-16/8 w-full overflow-hidden">
										<Image
											src="/images/lead-board.png"
											alt="Lead Table Dashboard showing scraped and enriched leads"
											fill
											className="bg-white object-contain"
											priority
										/>
									</div>
								</div>
								{/* Floating Badge */}
								<div className="-top-3 -right-3 absolute rounded-full bg-indigo-600 px-3 py-1 font-medium text-sm text-white shadow-lg">
									Step 1: Scrape & View
								</div>
							</div>
						</div>

						{/* Dossier Screenshot */}
						<div className="group">
							<div className="relative">
								{/* Browser Window Frame */}
								<div className="transform overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
									<div className="border-gray-200 border-b bg-gray-50 px-6 py-4">
										<div className="flex items-center gap-2">
											<div className="h-3 w-3 rounded-full bg-red-400" />
											<div className="h-3 w-3 rounded-full bg-yellow-400" />
											<div className="h-3 w-3 rounded-full bg-green-400" />
											<div className="ml-4 text-gray-600 text-sm">
												Lead Dossier
											</div>
										</div>
									</div>
									<div className="relative aspect-16/8 w-full overflow-hidden">
										<Image
											src="/images/lead-dossier.png"
											alt="Detailed lead dossier with AI-enriched contact information"
											fill
											className="bg-white object-contain"
											priority
										/>
									</div>
								</div>
								{/* Floating Badge */}
								<div className="-top-3 -right-3 absolute rounded-full bg-purple-600 px-3 py-1 font-medium text-sm text-white shadow-lg">
									Step 2: Enrich & Export
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24">
				<div className="px-4">
					<div className="mx-auto max-w-6xl">
						<div className="mb-10 text-center">
							<h2 className="mb-4 font-bold text-3xl text-gray-900">
								Simple, transparent pricing — built for growth
							</h2>
							<p className="mx-auto max-w-2xl text-gray-600 text-lg">
								Start today. Scale when you're ready. Cancel anytime.
							</p>
						</div>
						<PricingPlants />
					</div>
				</div>
			</section>

			{/* Guarantee Section */}
			<section className="bg-green-50 py-16">
				<div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
					<div className="flex flex-col items-center justify-center">
						<div className="mb-3 rounded-full bg-green-100 p-3 shadow-sm">
							<CheckCircle className="h-7 w-7 text-green-700" />
						</div>
						<h2 className="mb-2 font-bold text-2xl text-gray-900">
							30-Day Money-Back Guarantee
						</h2>
						<p className="max-w-xl text-gray-700 text-xl">
							Not sure if LeadCore AI is right for you?{" "}
							<span className="font-medium text-green-600">
								Try it risk-free with our 30-day money-back guarantee.
							</span>
						</p>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="bg-white py-20">
				<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10 text-center">
						<h2 className="mb-2 font-bold text-3xl text-gray-900">
							Frequently Asked Questions
						</h2>
						<p className="mx-auto max-w-2xl text-base text-gray-600">
							Everything you need to know about LeadCore AI plans, payments, and
							support.
						</p>
					</div>
					<div className="space-y-6">
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Can I change plans anytime?
							</h3>
							<p className="text-gray-600 text-sm">
								Yes — upgrades and downgrades take effect immediately.
							</p>
						</div>
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								What payment methods do you accept?
							</h3>
							<p className="text-gray-600 text-sm">
								All major credit cards, PayPal, and bank transfers for annual
								plans.
							</p>
						</div>
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								What happens if I exceed my limits?
							</h3>
							<p className="text-gray-600 text-sm">
								We'll notify you and provide a one-click upgrade path so you
								never miss opportunities.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
				<div className="absolute inset-0 bg-black opacity-20" />
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

				<div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-bold text-3xl text-white sm:text-4xl">
							Ready to grow your pipeline with AI?
						</h2>
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								asChild
								className="h-12 rounded-xl bg-white px-8 font-semibold text-indigo-600 text-lg shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl"
								size="lg"
							>
								<Link className="flex items-center" href="/signup">
									Get Started Now
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<Footer />
		</div>
	);
}
