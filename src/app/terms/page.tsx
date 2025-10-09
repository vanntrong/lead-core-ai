import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
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
						<div className="flex items-center space-x-4">
							<Button asChild size="sm" variant="ghost">
								<Link className="flex items-center text-gray-600" href="/">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Home
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="mb-12 text-center">
					<h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl">
						Terms & Conditions
					</h1>
					<p className="mt-4 text-gray-600 text-lg">
						By accessing and using LeadCore AI, you agree to the following
						terms:
					</p>
					<div className="mt-6 text-gray-500 text-sm">
						Last updated: September 14, 2024
					</div>
				</div>

				<div className="prose prose-lg max-w-none">
					<div className="space-y-8">
						<section>
							<h2 className="mb-4 font-semibold text-2xl text-gray-900">
								1. Use of Service
							</h2>
							<p className="text-gray-700 leading-relaxed">
								LeadCore AI provides scraping, enrichment, and campaign tools on
								a subscription basis. You agree to use the service only for
								lawful purposes and in compliance with all relevant regulations,
								including data protection and email marketing laws.
							</p>
						</section>
						<section>
							<h2 className="mb-4 font-semibold text-2xl text-gray-900">
								2. Subscriptions & Billing
							</h2>
							<p className="text-gray-700 leading-relaxed">
								Subscriptions are billed in advance on a monthly basis. Payments
								are non-refundable except where required by law. Cancelling your
								subscription will stop future billing but will not provide a
								refund for the current billing cycle.
							</p>
						</section>
						<section>
							<h2 className="mb-4 font-semibold text-2xl text-gray-900">
								3. Affiliate Program
							</h2>
							<p className="text-gray-700 leading-relaxed">
								Affiliates are compensated on a recurring 30% commission basis
								through Rewardful. Fraudulent or abusive activity will result in
								immediate removal from the program.
							</p>
						</section>
						<section>
							<h2 className="mb-4 font-semibold text-2xl text-gray-900">
								4. Limitations of Liability
							</h2>
							<p className="text-gray-700 leading-relaxed">
								Bug Hutch Ltd and its directors shall not be liable for any
								indirect, incidental, or consequential damages arising from use
								of this service. Users are solely responsible for compliance
								with GDPR, CAN-SPAM, and all applicable regulations.
							</p>
						</section>
						<section>
							<h2 className="mb-4 font-semibold text-2xl text-gray-900">
								5. Termination
							</h2>
							<p className="text-gray-700 leading-relaxed">
								Bug Hutch Ltd reserves the right to suspend or terminate
								accounts that breach these terms or abuse the platform.
							</p>
						</section>
						<section>
							<h2 className="mb-4 font-semibold text-2xl text-gray-900">
								6. Governing Law
							</h2>
							<p className="text-gray-700 leading-relaxed">
								These terms shall be governed by the laws of the United Kingdom.
							</p>
						</section>
					</div>
				</div>

				{/* Contact Section - moved and styled for clarity */}
				<div className="mt-12 flex justify-center">
					<div className="w-full max-w-md rounded-lg p-6">
						<h2 className="mb-3 text-center font-semibold text-gray-900 text-xl">
							Contact
						</h2>
						<div className="space-y-1 text-center text-base text-gray-700">
							<div>Bug Hutch Ltd</div>
							<div>Lee Caston</div>
							<div>
								WhatsApp:{" "}
								<span className="text-indigo-600">+44 7894 158884</span>
							</div>
							<div>
								Email:{" "}
								<a
									className="text-indigo-600 underline hover:text-indigo-700"
									href="mailto:support@leadcoreai.com"
								>
									support@leadcoreai.com
								</a>
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
