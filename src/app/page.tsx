import "@/app/globals.css";
import {
	ChevronDown,
	DollarSign,
	Globe,
	MessageSquare,
	Play,
	Shield,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DemoDialog } from "@/components/demo-dialog";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EcosystemLinks } from "@/constants/links";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/utils/helper";

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
							<Link className="font-bold text-gray-900 text-xl" href="/">
								LeadCore AI
							</Link>
						</div>
						<div className="hidden items-center space-x-8 md:flex">
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center gap-1 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground">
									Ecosystem
									<ChevronDown className="h-4 w-4" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="w-64">
									{EcosystemLinks.map((link) => (
										<DropdownMenuItem asChild key={link.name}>
											<Link
												className="cursor-pointer"
												href={link.href}
												rel="noopener noreferrer"
												target={link.target}
											>
												<div className="flex items-center gap-3">
													<div className="rounded-md bg-indigo-600 p-2">
														{link.icon}
													</div>
													<div>
														<p className="font-semibold">{link.name}</p>
														<p className="text-muted-foreground text-sm">
															{link.description}
														</p>
													</div>
												</div>
											</Link>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
							<Link
								className="font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
								href="/pricing"
							>
								Pricing
							</Link>
							<Link
								className="font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
								href="/contact"
							>
								Contact
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
									AI-powered lead generation for{" "}
									<span className="animate-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
										every kind of business.
									</span>
								</h1>
								<p
									className="mt-6 animate-fade-in-up text-gray-600 text-lg leading-8"
									style={{ animationDelay: "0.2s" }}
								>
									Find, enrich, and verify high-quality leads — from B2B
									companies and agencies to SaaS startups and Shopify stores —
									all in one platform.
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
											Try 25 Leads for $7&nbsp;&rarr;
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
								<p
									className="mt-4 animate-fade-in-up text-center text-gray-500 text-sm sm:text-left"
									style={{ animationDelay: "0.6s" }}
								>
									One platform that scrapes the entire business landscape.
								</p>
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
												alt="LeadCore AI Dashboard showing the complete workflow from scrape to export"
												className="bg-white object-contain"
												fill
												priority
												src="/images/dashboard.png"
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

			{/* How It Works Section */}
			<section className="bg-white py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-3xl text-gray-900">
							How It Works
						</h2>
						<p className="mx-auto max-w-2xl text-gray-600 text-lg">
							From raw data to qualified prospects in under 60 seconds.
						</p>
					</div>

					{/* 3-Step Timeline */}
					<div className="relative mx-auto max-w-5xl">
						{/* Connection Line */}
						<div className="absolute top-20 left-0 hidden h-0.5 w-full bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 md:block" />

						<div className="grid grid-cols-1 gap-12 md:grid-cols-3">
							{/* Step 1: Scrape */}
							<div className="group relative text-center">
								<div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
									<Globe className="h-8 w-8 text-white" />
									<div className="-top-2 -right-2 absolute flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 text-sm">
										1
									</div>
								</div>
								<h3 className="mb-3 font-bold text-gray-900 text-xl">Scrape</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									Pull fresh business data from Google, G2, Shopify,
									WooCommerce, Etsy, Yelp, NPI, FMCSA, and more.
								</p>
							</div>

							{/* Step 2: Enrich */}
							<div className="group relative text-center">
								<div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
									<Zap className="h-8 w-8 text-white" />
									<div className="-top-2 -right-2 absolute flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600 text-sm">
										2
									</div>
								</div>
								<h3 className="mb-3 font-bold text-gray-900 text-xl">Enrich</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									AI fills the blanks — contact names, job roles, tech stack,
									ICP fit, and buyer intent.
								</p>
							</div>

							{/* Step 3: Verify & Export */}
							<div className="group relative text-center">
								<div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
									<MessageSquare className="h-8 w-8 text-white" />
									<div className="-top-2 -right-2 absolute flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-600 text-sm">
										3
									</div>
								</div>
								<h3 className="mb-3 font-bold text-gray-900 text-xl">
									Verify & Export
								</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									Real-time email validation and one-click export to CSV, Google
									Sheets, Zapier, or your CRM.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Why Businesses Choose LeadCore */}
			<div
				className="bg-gradient-to-br from-gray-50 to-gray-100 py-24"
				id="features"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl text-gray-900">
							Why Businesses Choose LeadCore
						</h2>
					</div>
					<div className="mx-auto max-w-4xl space-y-6">
						{/* All-industry reach */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="flex items-start gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
									<Globe className="h-6 w-6 text-indigo-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold text-gray-900 text-lg">
										All-industry reach
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										B2B, SaaS, local service, or e-commerce—scrape them all.
									</p>
								</div>
							</div>
						</div>

						{/* AI enrichment */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="flex items-start gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
									<Zap className="h-6 w-6 text-purple-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold text-gray-900 text-lg">
										AI enrichment
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										Claude-powered enrichment turns cold data into
										ready-to-contact leads.
									</p>
								</div>
							</div>
						</div>

						{/* Real-time verification */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="flex items-start gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
									<Shield className="h-6 w-6 text-green-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold text-gray-900 text-lg">
										Real-time verification
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										Never burn a domain on dead emails again.
									</p>
								</div>
							</div>
						</div>

						{/* Plug & play */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="flex items-start gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
									<MessageSquare className="h-6 w-6 text-blue-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold text-gray-900 text-lg">
										Plug & play
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										Export anywhere: CSV • Sheets • Zapier • CRM.
									</p>
								</div>
							</div>
						</div>

						{/* Simple pricing */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="flex items-start gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
									<DollarSign className="h-6 w-6 text-orange-600" />
								</div>
								<div>
									<h3 className="mb-2 font-semibold text-gray-900 text-lg">
										Simple pricing
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										Flat monthly plans. Cancel anytime.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* CTA */}
					<div className="mt-12 text-center">
						<Button
							asChild
							className="h-12 rounded-xl bg-indigo-600 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
							size="lg"
						>
							<Link href="/signup">Try 25 Leads for $7&nbsp;&rarr;</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Pricing Section */}
			<section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24">
				<div className="px-4">
					<div className="mx-auto max-w-6xl">
						<div className="mb-10 text-center">
							<h2 className="mb-4 font-bold text-3xl text-gray-900">
								Pricing — Built for Every Business
							</h2>
							<p className="mx-auto max-w-2xl text-gray-600 text-lg">
								Start small. Scale big. Stop guessing.
							</p>
						</div>

						{/* Pricing Table */}
						<div className="overflow-x-auto">
							<div className="inline-block min-w-full align-middle">
								<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
													Plan
												</th>
												<th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
													Price
												</th>
												<th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
													Leads
												</th>
												<th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">
													Includes
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200 bg-white">
											<tr className="transition-colors hover:bg-gray-50">
												<td className="px-6 py-4 font-medium text-gray-900 text-sm">
													Trial
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">
													<span className="font-semibold">$7</span>
													<span className="text-gray-500 text-xs">
														{" "}
														(one-time)
													</span>
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">25</td>
												<td className="px-6 py-4 text-gray-600 text-sm">
													Scrape & enrich from any source — Google, Shopify, G2,
													Woo, Etsy, Yelp, NPI, FMCSA • Real-time verification •
													CSV export • Preview every industry
												</td>
											</tr>
											<tr className="transition-colors hover:bg-gray-50">
												<td className="px-6 py-4 font-medium text-gray-900 text-sm">
													Starter
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">
													<span className="font-semibold">$97</span>
													<span className="text-gray-500 text-xs"> / mo</span>
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">150</td>
												<td className="px-6 py-4 text-gray-600 text-sm">
													Access all connectors • AI enrichment • CSV export •
													Priority support
												</td>
											</tr>
											<tr className="transition-colors hover:bg-gray-50">
												<td className="px-6 py-4 font-medium text-gray-900 text-sm">
													Pro
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">
													<span className="font-semibold">$297</span>
													<span className="text-gray-500 text-xs"> / mo</span>
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">500</td>
												<td className="px-6 py-4 text-gray-600 text-sm">
													Bulk scraping • Advanced enrichment (ICP, contacts,
													stack) • Zapier + multi-user access
												</td>
											</tr>
											<tr className="transition-colors hover:bg-gray-50">
												<td className="px-6 py-4 font-medium text-gray-900 text-sm">
													Unlimited
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">
													<span className="font-semibold">$497</span>
													<span className="text-gray-500 text-xs"> / mo</span>
												</td>
												<td className="px-6 py-4 text-gray-900 text-sm">
													Unlimited
												</td>
												<td className="px-6 py-4 text-gray-600 text-sm">
													All sources + webhooks + CRM integrations + dedicated
													support
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>

						<p className="mt-6 text-center text-gray-500 text-sm">
							Cancel anytime · No contracts
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
					</div>
					<div className="space-y-6">
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Can I cancel anytime?
							</h3>
							<p className="text-gray-600 text-sm">
								Yes — cancel directly from your dashboard; no hidden terms.
							</p>
						</div>
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Is data verified?
							</h3>
							<p className="text-gray-600 text-sm">
								Every lead is validated in real-time before export.
							</p>
						</div>
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								What industries does LeadCore cover?
							</h3>
							<p className="text-gray-600 text-sm">
								All of them — local businesses, SaaS, agencies, e-commerce
								brands, and everything in between.
							</p>
						</div>
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Can I get a refund?
							</h3>
							<p className="text-gray-600 text-sm">
								Because leads are delivered instantly, all sales are final. You
								can cancel anytime to stop future renewals.
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
							From B2B to Shopify — LeadCore is your unfair advantage.
						</h2>
						<p className="mt-4 text-indigo-100 text-lg">
							Stop paying for outdated databases. Build fresh, verified lists on
							demand.
						</p>
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								asChild
								className="h-12 rounded-xl bg-white px-8 font-semibold text-indigo-600 text-lg shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl"
								size="lg"
							>
								<Link className="flex items-center" href="/signup">
									Try 25 Leads for $7&nbsp;&rarr;
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
