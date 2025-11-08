"use client";

import { Globe, Mail, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";

export default function SendPage() {
	const { data: currentUser } = useCurrentUser();

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
			{/* Navigation */}
			<nav className="border-gray-100 border-b bg-white/95 backdrop-blur-sm">
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
						<div className="flex items-center gap-x-3">
							{!currentUser ? (
								<>
									<Button
										asChild
										className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm hover:bg-gray-50"
										size="sm"
										variant="outline"
									>
										<Link href="/login">Sign In</Link>
									</Button>
									<Button
										asChild
										className="h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 font-medium text-sm text-white shadow-sm hover:from-indigo-700 hover:to-purple-700"
										size="sm"
									>
										<Link href="/signup">Get Started</Link>
									</Button>
								</>
							) : (
								<Button
									asChild
									className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm hover:bg-gray-50"
									size="sm"
									variant="outline"
								>
									<Link
										href={
											currentUser.is_admin
												? "/admin/dashboard/scraper-logs"
												: "/dashboard"
										}
									>
										Dashboard
									</Link>
								</Button>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="px-4 py-16">
				<div className="mx-auto max-w-4xl text-center">
					{/* Badge */}
					<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 font-medium text-indigo-600 text-sm">
						<Zap className="h-4 w-4" />
						Early Access
					</div>

					{/* Headline */}
					<h1 className="mb-6 font-bold text-4xl text-gray-900 tracking-tight md:text-5xl lg:text-6xl">
						Send{" "}
						<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
							150 Cold Emails
						</span>{" "}
						Instantly
					</h1>

					{/* Subheadline */}
					<p className="mx-auto mb-8 max-w-2xl text-gray-600 text-xl leading-8">
						TownSend is the fastest way to send personalized cold emails at
						scale. Connect your Gmail, upload your list, and start sending in
						minutes.
					</p>

					{/* CTA */}
					<Button
						asChild
						className="h-12 rounded-xl bg-indigo-600 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
						size="lg"
					>
						<a href="mailto:support@leadcoreai.com?subject=TownSend%20Early%20Access%20Request">
							Request Early Access
						</a>
					</Button>

					<p className="mt-4 text-gray-500 text-sm">
						Send 150 emails free on your first month
					</p>
				</div>

				{/* Features Grid */}
				<div className="mx-auto mt-20 max-w-6xl">
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						{/* Feature 1 */}
						<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
								<Mail className="h-6 w-6 text-indigo-600" />
							</div>
							<h3 className="mb-3 font-semibold text-gray-900 text-xl">
								Gmail Integration
							</h3>
							<p className="text-gray-600 leading-relaxed">
								Connect your Gmail account in seconds. No complex setup, no SMTP
								configuration.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
								<Zap className="h-6 w-6 text-purple-600" />
							</div>
							<h3 className="mb-3 font-semibold text-gray-900 text-xl">
								Personalization
							</h3>
							<p className="text-gray-600 leading-relaxed">
								AI-powered personalization that adapts to each recipient's
								industry and role.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
								<MessageSquare className="h-6 w-6 text-green-600" />
							</div>
							<h3 className="mb-3 font-semibold text-gray-900 text-xl">
								Smart Delivery
							</h3>
							<p className="text-gray-600 leading-relaxed">
								Automated sending schedules that protect your sender reputation.
							</p>
						</div>
					</div>
				</div>

				{/* Bottom CTA */}
				<div className="mx-auto mt-16 max-w-2xl text-center">
					<p className="mb-6 text-gray-600 text-lg">
						Ready to scale your outreach? Join the waitlist today.
					</p>
					<Button
						asChild
						className="h-12 rounded-xl bg-indigo-600 px-8 font-semibold text-lg text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
						size="lg"
					>
						<a href="mailto:support@leadcoreai.com?subject=TownSend%20Early%20Access%20Request">
							Request Early Access
						</a>
					</Button>
				</div>
			</div>

			{/* Footer */}
			<footer className="border-gray-100 border-t bg-white py-8">
				<p className="text-center text-gray-500 text-sm">
					© {new Date().getFullYear()} LeadCore AI. Powered by $TOWN.
				</p>
			</footer>
		</div>
	);
}
