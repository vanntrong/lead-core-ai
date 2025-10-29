import "@/app/globals.css";
import {
	BarChart3,
	Check,
	ChevronDown,
	Globe,
	Mail,
	Shield,
	Target,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
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

export default async function TownSendPage() {
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
								<Mail className="h-6 w-6 text-white" />
							</div>
							<Link
								className="font-bold text-gray-900 text-xl"
								href="/townsend"
							>
								TownSend
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
						<div className="text-center">
							<h1 className="font-bold text-4xl text-gray-900 leading-tight tracking-tight sm:text-5xl lg:text-6xl">
								Send emails that{" "}
								<span className="animate-gradient bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
									actually get delivered.
								</span>
							</h1>
							<p className="mx-auto mt-6 max-w-2xl text-gray-600 text-lg leading-8">
								TownSend is a secure, reliable email delivery platform built for
								businesses that value deliverability and compliance.
							</p>
							<div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
								<Button
									asChild
									className="h-12 rounded-xl bg-indigo-600 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
									size="lg"
								>
									<a
										href="https://www.mailtown.io"
										rel="noopener noreferrer"
										target="_blank"
									>
										Get Started &rarr;
									</a>
								</Button>
								<Button
									asChild
									className="h-12 rounded-xl border border-gray-300 bg-white px-8 font-semibold text-indigo-600 text-lg shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl"
									size="lg"
								>
									<Link href="/contact">Contact Sales</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<section className="bg-white py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-16 text-center">
						<h2 className="mb-4 font-bold text-3xl text-gray-900">
							Everything you need to send emails safely
						</h2>
						<p className="mx-auto max-w-2xl text-gray-600 text-lg">
							Built-in features that protect your sender reputation and maximize
							deliverability.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						{/* Feature 1 */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
								<Shield className="h-6 w-6 text-indigo-600" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Secure & Compliant
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Built-in compliance with CAN-SPAM, GDPR, and industry best
								practices. Your emails are protected end-to-end.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
								<Zap className="h-6 w-6 text-purple-600" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Lightning Fast
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Send thousands of emails per second with our optimized delivery
								infrastructure. No delays, no throttling.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
								<Target className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Audience Targeting
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Segment your audiences and send personalized campaigns. Track
								engagement and optimize for better results.
							</p>
						</div>

						{/* Feature 4 */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
								<Users className="h-6 w-6 text-blue-600" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Contact Management
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Import, organize, and manage your contacts with ease. Keep your
								lists clean and up-to-date.
							</p>
						</div>

						{/* Feature 5 */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
								<BarChart3 className="h-6 w-6 text-orange-600" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Analytics & Insights
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Track opens, clicks, and conversions in real-time. Make
								data-driven decisions to improve your campaigns.
							</p>
						</div>

						{/* Feature 6 */}
						<div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
								<Globe className="h-6 w-6 text-pink-600" />
							</div>
							<h3 className="mb-2 font-semibold text-gray-900 text-lg">
								Global Delivery
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Reach audiences worldwide with our global email infrastructure.
								Optimized routes for maximum deliverability.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Integration with LeadCore */}
			<div className="bg-gradient-to-br from-gray-50 to-gray-100 py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg md:p-12">
						<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
							<div>
								<h2 className="mb-4 font-bold text-3xl text-gray-900">
									Seamlessly integrate with LeadCore AI
								</h2>
								<p className="mb-6 text-gray-600 text-lg leading-relaxed">
									Export your leads directly from LeadCore AI to TownSend
									audiences. No manual CSV imports, no copy-pasting. Just
									one-click export and you're ready to send.
								</p>
								<ul className="mb-8 space-y-3">
									<li className="flex items-start">
										<Check className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-green-600" />
										<span className="text-gray-700">
											One-click export from LeadCore AI to TownSend
										</span>
									</li>
									<li className="flex items-start">
										<Check className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-green-600" />
										<span className="text-gray-700">
											Automatic audience creation and management
										</span>
									</li>
									<li className="flex items-start">
										<Check className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-green-600" />
										<span className="text-gray-700">
											Only verified emails are exported for safety
										</span>
									</li>
									<li className="flex items-start">
										<Check className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-green-600" />
										<span className="text-gray-700">
											Secure API integration with your data
										</span>
									</li>
								</ul>
								<Button
									asChild
									className="h-12 rounded-xl bg-indigo-600 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
									size="lg"
								>
									<Link href="/dashboard">Try it with your leads &rarr;</Link>
								</Button>
							</div>
							<div className="relative">
								<div className="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-100 to-purple-100 p-8 shadow-xl">
									<div className="space-y-4">
										<div className="flex items-center space-x-3 rounded-lg border border-indigo-200 bg-white p-4 shadow-sm">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
												<Globe className="h-5 w-5 text-indigo-600" />
											</div>
											<div className="flex-1">
												<div className="font-semibold text-gray-900 text-sm">
													LeadCore AI
												</div>
												<div className="text-gray-600 text-xs">
													Scrape & enrich leads
												</div>
											</div>
										</div>
										<div className="flex justify-center">
											<div className="h-12 w-0.5 bg-gradient-to-b from-indigo-400 to-purple-400" />
										</div>
										<div className="flex items-center space-x-3 rounded-lg border border-purple-200 bg-white p-4 shadow-sm">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
												<Mail className="h-5 w-5 text-purple-600" />
											</div>
											<div className="flex-1">
												<div className="font-semibold text-gray-900 text-sm">
													TownSend
												</div>
												<div className="text-gray-600 text-xs">
													Send targeted campaigns
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="-top-4 -right-4 absolute h-8 w-8 animate-bounce rounded-full bg-indigo-500" />
								<div className="-bottom-6 -left-6 absolute h-6 w-6 animate-pulse rounded-full bg-purple-500" />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Pricing Section */}
			<section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10 text-center">
						<h2 className="mb-4 font-bold text-3xl text-gray-900">
							Simple, Transparent Pricing
						</h2>
						<p className="mx-auto max-w-2xl text-gray-600 text-lg">
							Choose the plan that fits your sending needs. All plans include
							bonus credits on signup.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						{/* Starter Plan */}
						<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<h3 className="mb-2 font-bold text-gray-900 text-xl">Starter</h3>
							<p className="mb-4 text-gray-600 text-sm">
								Perfect for 25/day warm-up users
							</p>
							<div className="mb-6">
								<span className="font-bold text-4xl text-gray-900">$97</span>
								<span className="text-gray-600 text-sm">/month</span>
							</div>
							<ul className="mb-8 space-y-3">
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">1 Domain</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">3 Audiences</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Up to 25 emails/day
									</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										150 bonus credits on signup
									</span>
								</li>
							</ul>
							<Button asChild className="w-full rounded-lg" variant="outline">
								<a
									href="https://www.mailtown.io"
									rel="noopener noreferrer"
									target="_blank"
								>
									Get Started
								</a>
							</Button>
						</div>

						{/* Pro Plan */}
						<div className="relative rounded-2xl border-2 border-indigo-600 bg-white p-6 shadow-lg">
							<div className="-top-4 -translate-x-1/2 absolute left-1/2 transform">
								<span className="rounded-full bg-indigo-600 px-4 py-1 font-semibold text-sm text-white">
									Most Popular
								</span>
							</div>
							<h3 className="mb-2 font-bold text-gray-900 text-xl">Pro</h3>
							<p className="mb-4 text-gray-600 text-sm">
								Perfect for small businesses getting started with email
								marketing
							</p>
							<div className="mb-6">
								<span className="font-bold text-4xl text-gray-900">$197</span>
								<span className="text-gray-600 text-sm">/month</span>
							</div>
							<ul className="mb-8 space-y-3">
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Everything in Starter, plus:
									</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">2 Domains</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">10 Audiences</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Up to 100 emails/day
									</span>
								</li>
							</ul>
							<Button
								asChild
								className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700"
							>
								<a
									href="https://www.mailtown.io"
									rel="noopener noreferrer"
									target="_blank"
								>
									Get Started
								</a>
							</Button>
						</div>

						{/* Elite Plan */}
						<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<h3 className="mb-2 font-bold text-gray-900 text-xl">Elite</h3>
							<p className="mb-4 text-gray-600 text-sm">
								For growing companies with higher sending volumes
							</p>
							<div className="mb-6">
								<span className="font-bold text-4xl text-gray-900">$297</span>
								<span className="text-gray-600 text-sm">/month</span>
							</div>
							<ul className="mb-8 space-y-3">
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Everything in Pro, plus:
									</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">3 Domains</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Unlimited Audiences
									</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Up to 150 emails/day
									</span>
								</li>
							</ul>
							<Button asChild className="w-full rounded-lg" variant="outline">
								<a
									href="https://www.mailtown.io"
									rel="noopener noreferrer"
									target="_blank"
								>
									Get Started
								</a>
							</Button>
						</div>

						{/* Agency White-Label Plan */}
						<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
							<h3 className="mb-2 font-bold text-gray-900 text-xl">
								Agency White-Label
							</h3>
							<p className="mb-4 text-gray-600 text-sm">
								Tenant-level control; per-client cap 1–2 recommended
							</p>
							<div className="mb-6">
								<span className="font-bold text-4xl text-gray-900">$997</span>
								<span className="text-gray-600 text-sm">/month</span>
							</div>
							<ul className="mb-8 space-y-3">
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Everything in Elite, plus:
									</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Unlimited Domains
									</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Unlimited Audiences
									</span>
								</li>
								<li className="flex items-start">
									<Check className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-600" />
									<span className="text-gray-700 text-sm">
										Tenant-level control
									</span>
								</li>
							</ul>
							<Button asChild className="w-full rounded-lg" variant="outline">
								<a
									href="https://www.mailtown.io"
									rel="noopener noreferrer"
									target="_blank"
								>
									Get Started
								</a>
							</Button>
						</div>
					</div>

					<p className="mt-8 text-center text-gray-600 text-sm">
						All plans include bonus credits on signup that never expire
					</p>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
				<div className="absolute inset-0 bg-black opacity-20" />
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

				<div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="font-bold text-3xl text-white sm:text-4xl">
							Ready to send emails that get delivered?
						</h2>
						<p className="mt-4 text-indigo-100 text-lg">
							Join businesses that trust TownSend for reliable email delivery.
						</p>
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								asChild
								className="h-12 rounded-xl bg-white px-8 font-semibold text-indigo-600 text-lg shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-xl"
								size="lg"
							>
								<a
									href="https://www.mailtown.io"
									rel="noopener noreferrer"
									target="_blank"
								>
									Start Sending &rarr;
								</a>
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
