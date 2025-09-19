import "@/app/globals.css";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
	ArrowRight,
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
								className="font-medium text-gray-600 hover:text-gray-900"
								href="#features"
							>
								Features
							</Link>
							<Link
								className="font-medium text-gray-600 hover:text-gray-900"
								href="/pricing"
							>
								Pricing
							</Link>
							<div className="flex items-center gap-x-3">
								{!user ? (
									<>
										<Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
											<Link href="/login">Sign in</Link>
										</Button>
										<Button asChild className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium rounded-lg shadow-sm" size="sm">
											<Link href="/signup">Sign up</Link>
										</Button>
									</>
								) : (
									<Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
										<Link href="/dashboard/leads">Dashboard</Link>
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="relative bg-white">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="pt-20 pb-16 text-center lg:pt-32">
						<div className="mx-auto max-w-4xl">
							<div className="mb-8">
								<Badge className="border-indigo-200 bg-indigo-50 px-4 py-2 font-medium text-indigo-700 text-sm">
									<Star className="mr-2 h-4 w-4" />
									Trusted by 1000+ marketers & sales teams
								</Badge>
							</div>
							<h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-6xl lg:text-7xl">
								AI-powered lead generation made{" "}
								<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
									simple
								</span>
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-gray-600 text-lg leading-8">
								LeadCore AI finds, enriches, and exports leads from Shopify, Etsy, G2, and more. Automate your workflow and export results instantly.

							</p>
							<div className="mt-10 flex items-center justify-center gap-x-3">
								<Button
									asChild
									className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-lg font-semibold rounded-xl shadow-lg transition-all"
									size="lg"
								>
									<a className="flex items-center" href="/register">
										Get more leads now
										<ArrowRight className="ml-2 h-5 w-5" />
									</a>
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
						<div className="mt-16 max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 justify-center items-stretch">
							{/* Lead Scraping */}
							<div className="flex justify-center">
								<div className="relative flex items-center justify-center max-w-sm w-full h-80">
									<div className="absolute inset-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur" />
									<div className="relative z-10 rounded-2xl border border-gray-200 bg-white p-8 w-full h-77 flex flex-col justify-between shadow-lg">
										<div>
											<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 mx-auto">
												<Globe className="h-6 w-6 text-indigo-600" />
											</div>
											<h3 className="mb-3 font-semibold text-gray-900 text-xl text-center">
												Lead Scraping
											</h3>
											<p className="text-gray-600 leading-relaxed text-center">
												Instantly collect leads from Shopify, Etsy, G2, Capterra, and more—no manual research needed.
											</p>
										</div>
									</div>
								</div>
							</div>
							{/* AI Enrichment */}
							<div className="flex justify-center">
								<div className="relative flex items-center justify-center max-w-sm w-full h-80">
									<div className="absolute inset-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur" />
									<div className="relative z-10 rounded-2xl border border-gray-200 bg-white p-8 w-full h-77 flex flex-col justify-between shadow-lg">
										<div>
											<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 mx-auto">
												<Zap className="h-6 w-6 text-green-600" />
											</div>
											<h3 className="mb-3 font-semibold text-gray-900 text-xl text-center">
												AI Enrichment
											</h3>
											<p className="text-gray-600 leading-relaxed text-center">
												Enrich leads with company info, contacts, and insights using Claude and advanced AI models.
											</p>
										</div>
									</div>
								</div>
							</div>
							{/* Email Verification */}
							<div className="flex justify-center">
								<div className="relative flex items-center justify-center max-w-sm w-full h-80">
									<div className="absolute inset-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur" />
									<div className="relative z-10 rounded-2xl border border-gray-200 bg-white p-8 w-full h-77 flex flex-col justify-between shadow-lg">
										<div>
											<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 mx-auto">
												<Shield className="h-6 w-6 text-blue-600" />
											</div>
											<h3 className="mb-3 font-semibold text-gray-900 text-xl text-center">
												Email Verification
											</h3>
											<p className="text-gray-600 leading-relaxed text-center">
												Verify emails for deliverability and accuracy—no more wasted outreach.
											</p>
										</div>
									</div>
								</div>
							</div>
							{/* Export & Integrations */}
							<div className="flex justify-center">
								<div className="relative flex items-center justify-center max-w-sm w-full h-80">
									<div className="absolute inset-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-20 blur" />
									<div className="relative z-10 rounded-2xl border border-gray-200 bg-white p-8 w-full h-77 flex flex-col justify-between shadow-lg">
										<div>
											<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 mx-auto">
												<MessageSquare className="h-6 w-6 text-orange-600" />
											</div>
											<h3 className="mb-3 font-semibold text-gray-900 text-xl text-center">
												Export & Integrations
											</h3>
											<p className="text-gray-600 leading-relaxed text-center">
												Export leads to CSV, Google Sheets, or Zapier. Integrate with your favorite tools in one click.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>

			{/* CTA Section */}
			<div className="bg-indigo-600">
				<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-bold text-3xl text-white sm:text-4xl">
							Ready to grow your pipeline with AI?
						</h2>
						<p className="mt-4 text-indigo-100 text-lg">
							Join thousands of companies already using LeadCore AI to
							optimize their operations and increase profitability.
						</p>
						<div className="mt-8">
							<Button
								asChild
								className="h-12 bg-white px-8 text-lg font-semibold rounded-xl text-indigo-600 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
								size="lg"
							>
								<a className="flex items-center" href="/register">
									Get started
									<ArrowRight className="ml-2 h-5 w-5" />
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<Footer />
		</div>
	);
}
