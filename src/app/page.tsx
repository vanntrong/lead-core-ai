import "@/app/globals.css";
import Footer from "@/components/footer";
import ExportGoogleSheetButton from "@/components/leads/export-google-sheet";
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
					<div className="pt-20 pb-16 text-center lg:pt-32">
						<div className="mx-auto max-w-4xl">
							<div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
								<Star className="mr-2 h-4 w-4 fill-current" />
								Trusted by 1000+ marketers & sales teams
							</div>
							<h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-6xl lg:text-7xl leading-tight animate-fade-in-up">
								AI-powered lead generation made{" "}
								<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
									simple
								</span>
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-gray-600 text-lg leading-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
								LeadCore AI finds, enriches, and exports leads from Shopify, Etsy, G2, and more. Automate your workflow and export results instantly.
							</p>
							<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
								<Button
									asChild
									className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
									size="lg"
								>
									<Link className="flex items-center" href="/signup">
										Get more leads now
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="bg-white py-24" id="features">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="font-bold text-3xl text-gray-900 tracking-tight sm:text-4xl">
							Everything you need to grow your pipeline
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-gray-600 text-lg">
							LeadCore AI automates lead generation, enrichment, verification, and export—so you can focus on closing deals.
						</p>
					</div>

					<div className="flex justify-center">
						<div className="mt-16 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-stretch">
							{/* Lead Scraping */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<Globe className="h-7 w-7 text-indigo-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											Lead Scraping
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											Instantly collect leads from Shopify, Etsy, G2, Capterra, and more—no manual research needed.
										</p>
										<div className="flex items-center justify-center">
											<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
											<span className="text-sm text-gray-500">10,000+ sources supported</span>
										</div>
									</div>
								</div>
							</div>

							{/* AI Enrichment */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<Zap className="h-7 w-7 text-green-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											AI Enrichment
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											Enrich leads with company info, contacts, and insights using Claude and advanced AI models.
										</p>
										<div className="flex items-center justify-center">
											<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
											<span className="text-sm text-gray-500">95% accuracy rate</span>
										</div>
									</div>
								</div>
							</div>

							{/* Email Verification */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<Shield className="h-7 w-7 text-blue-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											Email Verification
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											Verify emails for deliverability and accuracy—no more wasted outreach.
										</p>
										<div className="flex items-center justify-center">
											<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
											<span className="text-sm text-gray-500">Real-time verification</span>
										</div>
									</div>
								</div>
							</div>

							{/* Export & Integrations */}
							<div className="group">
								<div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
									<div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="relative">
										<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 mx-auto group-hover:scale-110 transition-transform duration-300">
											<MessageSquare className="h-7 w-7 text-orange-600" />
										</div>
										<h3 className="mb-4 font-bold text-gray-900 text-xl text-center">
											Export & Integrations
										</h3>
										<p className="text-gray-600 leading-relaxed text-center mb-4">
											Export leads to CSV, Google Sheets, or Zapier. Integrate with your favorite tools in one click.
										</p>
										<div className="flex items-center justify-center">
											<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
											<span className="text-sm text-gray-500">50+ integrations</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden">
				<div className="absolute inset-0 bg-black opacity-20" />
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

				<div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-bold text-3xl text-white sm:text-4xl">
							Ready to grow your pipeline with AI?
						</h2>
						<p className="mt-4 text-indigo-100 text-lg">
							Join thousands of companies already using LeadCore AI to
							optimize their operations and increase profitability.
						</p>
						<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
							<Button
								asChild
								className="h-12 bg-white px-8 text-lg font-semibold rounded-xl text-indigo-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:scale-105"
								size="lg"
							>
								<Link className="flex items-center" href="/signup">
									Get started now
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
						</div>

						{/* Trust indicators */}
						<div className="mt-12 grid grid-cols-3 gap-6 text-center">
							<div>
								<div className="text-2xl font-bold text-white">10K+</div>
								<div className="text-indigo-200 text-sm">Happy customers</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-white">50M+</div>
								<div className="text-indigo-200 text-sm">Leads generated</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-white">98%</div>
								<div className="text-indigo-200 text-sm">Customer satisfaction</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<Footer />
		</div>
	);
}
