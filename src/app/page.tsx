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
	Shield,
	Star,
	Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
								className="font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
								href="/pricing"
							>
								Pricing
							</Link>
							<div className="flex items-center gap-x-3">
								{!user ? (
									<>
										<Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-all duration-200" size="sm" variant="outline">
											<Link href="/login">Sign in</Link>
										</Button>
										<Button asChild className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md" size="sm">
											<Link href="/signup">Sign up</Link>
										</Button>
									</>
								) : (
									<Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-all duration-200" size="sm" variant="outline">
										<Link href={isAdmin ? `/admin/dashboard/scraper-logs` : `/dashboard`}>Dashboard</Link>
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjNmNGY2IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
				<div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
					<div className="w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-pulse" />
				</div>
				<div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2">
					<div className="w-96 h-96 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
				</div>

				<div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="pt-20 pb-16 text-center lg:pt-32 flex flex-col items-center justify-center gap-12">
						<div className="mx-auto max-w-5xl">
							<h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-6xl lg:text-7xl leading-tight animate-fade-in-up">
								AI-powered lead generation made <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">simple.</span>
							</h1>
							<p className="mx-auto mt-6 max-w-xl text-gray-600 text-lg leading-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
								Find, enrich, and export leads from Shopify, G2, Etsy & more — in seconds.
							</p>
							<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
								<Button
									asChild
									className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
									size="lg"
								>
									<Link className="flex items-center" href="/signup">
										Start for $97&nbsp;&rarr;
									</Link>
								</Button>
								<Button
									asChild
									className="h-12 bg-white border border-gray-300 text-indigo-600 px-8 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:scale-105"
									size="lg"
								>
									<Link className="flex items-center" href="#demo">
										Watch Demo
									</Link>
								</Button>
							</div>

							{/* Dashboard Screenshot Visual */}
							<div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
								<div className="relative mx-auto max-w-4xl">
									{/* Main Dashboard Screenshot */}
									<div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
										<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
											<div className="flex items-center gap-2">
												<div className="w-3 h-3 bg-red-400 rounded-full"></div>
												<div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
												<div className="w-3 h-3 bg-green-400 rounded-full"></div>
												<div className="ml-4 text-sm text-gray-600">LeadCore AI Dashboard</div>
											</div>
										</div>
										<div className="relative aspect-16/8 w-full overflow-hidden">
											<Image
												src="/images/dashboard.png"
												alt="LeadCore AI Dashboard showing the complete workflow from scrape to export"
												fill
												className="object-contain bg-white"
												priority
											/>
										</div>
									</div>

									{/* Floating Elements */}
									<div className="absolute -top-4 -right-4 w-8 h-8 bg-indigo-500 rounded-full animate-bounce"></div>
									<div className="absolute -bottom-6 -left-6 w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{ /* Social Proof Section */}
			<section className="bg-white py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-10">
							<Star className="h-4 w-4" />
							Trusted by 10,000+ founders & agencies.
						</div>
						<div className="flex flex-wrap justify-center items-center gap-8 mb-12">
							{/* Placeholder logos - increased size */}
							<div className="w-32 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none"><rect width="80" height="32" rx="8" fill="#e5e7eb" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="16" fill="#9ca3af">Logo</text></svg>
							</div>
							<div className="w-32 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none"><rect width="80" height="32" rx="8" fill="#e5e7eb" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="16" fill="#9ca3af">Logo</text></svg>
							</div>
							<div className="w-32 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none"><rect width="80" height="32" rx="8" fill="#e5e7eb" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="16" fill="#9ca3af">Logo</text></svg>
							</div>
							<div className="w-32 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none"><rect width="80" height="32" rx="8" fill="#e5e7eb" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="16" fill="#9ca3af">Logo</text></svg>
							</div>
							<div className="w-32 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
								<svg width="80" height="32" viewBox="0 0 80 32" fill="none"><rect width="80" height="32" rx="8" fill="#e5e7eb" /><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="16" fill="#9ca3af">Logo</text></svg>
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
							<div className="text-center">
								<div className="text-3xl font-bold text-indigo-600 mb-2">50M+</div>
								<div className="text-gray-600 text-sm">Leads generated</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-green-600 mb-2">95%</div>
								<div className="text-gray-600 text-sm">Verified accuracy</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
								<div className="text-gray-600 text-sm">Customer satisfaction</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Feature Highlight Section (new session) */}
			<section className="bg-gradient-to-br from-gray-50 to-gray-100 py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					{/* Section Header */}
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							From raw data to qualified leads in 60 seconds
						</h2>
					</div>

					{/* Screenshots Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Lead Table Screenshot */}
						<div className="group">
							<div className="relative">
								{/* Browser Window Frame */}
								<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform group-hover:scale-[1.02] transition-all duration-300">
									<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 bg-red-400 rounded-full"></div>
											<div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
											<div className="w-3 h-3 bg-green-400 rounded-full"></div>
											<div className="ml-4 text-sm text-gray-600">Lead Dashboard</div>
										</div>
									</div>
									<div className="relative aspect-16/8 w-full overflow-hidden">
										<Image
											src="/images/lead-board.png"
											alt="Lead Table Dashboard showing scraped and enriched leads"
											fill
											className="object-contain bg-white"
											priority
										/>
									</div>
								</div>
								{/* Floating Badge */}
								<div className="absolute -top-3 -right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
									Step 1: Scrape & View
								</div>
							</div>
						</div>

						{/* Dossier Screenshot */}
						<div className="group">
							<div className="relative">
								{/* Browser Window Frame */}
								<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform group-hover:scale-[1.02] transition-all duration-300">
									<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 bg-red-400 rounded-full"></div>
											<div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
											<div className="w-3 h-3 bg-green-400 rounded-full"></div>
											<div className="ml-4 text-sm text-gray-600">Lead Dossier</div>
										</div>
									</div>
									<div className="relative aspect-16/8 w-full overflow-hidden">
										<Image
											src="/images/lead-dossier.png"
											alt="Detailed lead dossier with AI-enriched contact information"
											fill
											className="object-contain bg-white"
											priority
										/>
									</div>
								</div>
								{/* Floating Badge */}
								<div className="absolute -top-3 -right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
									Step 2: Enrich & Export
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{ /* Benefits Section */}
			<div className="bg-white py-24" id="features" >
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex justify-center">
						<div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-stretch">
							{/* Scrape Leads in Seconds */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<Globe className="h-7 w-7 text-indigo-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											Scrape Leads in Seconds
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											Shopify, G2, Woo, Etsy, and more.
										</p>
									</div>
								</div>
							</div>

							{/* Enrich with AI Precision */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<Zap className="h-7 w-7 text-green-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											Enrich with AI Precision
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											Claude enrichment (ICP fit, tech stack, contacts)										</p>
									</div>
								</div>
							</div>

							{/* Verify Before You Send */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<Shield className="h-7 w-7 text-blue-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											Verify Before You Send
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											Real-time email validation
										</p>
									</div>
								</div>
							</div>

							{/* Export Anywhere */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<MessageSquare className="h-7 w-7 text-orange-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											Export Anywhere
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											CSV, Google Sheets, Zapier, CRM
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div >

			{/* Guarantee Section */}
			<section className="bg-green-50 py-16" >
				<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div className="flex flex-col items-center justify-center gap-4">
						<div className="bg-green-100 rounded-full p-3 shadow-sm mb-3">
							<CheckCircle className="h-7 w-7 text-green-600" />
						</div>
						<p className="text-gray-800 text-lg max-w-xl">
							Not sure if LeadCore AI is right for you? Try it risk-free with our 30-day money-back guarantee.
						</p>
					</div>
				</div>
			</section >

			{/* FAQ Section */}
			<section className="bg-white py-20" >
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="space-y-6">
						<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Can I change plans anytime?
							</h3>
							<p className="text-sm text-gray-600">
								Yes — upgrades and downgrades take effect immediately.
							</p>
						</div>
						<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								What payment methods do you accept?
							</h3>
							<p className="text-sm text-gray-600">
								All major credit cards, PayPal, and bank transfers for annual plans.
							</p>
						</div>
						<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								What happens if I exceed my limits?
							</h3>
							<p className="text-sm text-gray-600">
								We'll notify you and provide a one-click upgrade path so you never miss opportunities.
							</p>
						</div>
					</div>
				</div>
			</section >

			{/* Final CTA Section */}
			<section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden" >
				<div className="absolute inset-0 bg-black opacity-20" />
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

				<div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-bold text-3xl text-white sm:text-4xl">
							Ready to grow your pipeline with AI?
						</h2>
						<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
							<Button
								asChild
								className="h-12 bg-white px-8 text-lg font-semibold rounded-xl text-indigo-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:scale-105"
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
			</section >

			{/* Footer */}
			< Footer />
		</div >
	);
}
