import { ArrowLeft, Globe, } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function LegalDisclaimerPage() {
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
						Legal Disclaimer
					</h1>
					<p className="mt-4 text-gray-600 text-lg">
						Please review the terms, disclaimers, and contact information for
						LeadCore AI below.
					</p>
					<div className="mt-6 text-gray-500 text-sm">
						Last updated: September 14, 2025
					</div>
				</div>
				<div className="prose prose-lg max-w-none">
					<div className="mb-8 rounded-lg bg-gray-50 p-6">
						<p className="text-gray-700 leading-relaxed">
							LeadCore AI is provided on an "as-is" and "as-available" basis
							without warranties of any kind, either express or implied.
						</p>
						<hr className="my-4 border-gray-200" />
						<p className="text-gray-700 leading-relaxed">
							While every effort has been made to ensure accuracy, we cannot
							guarantee that all data, enrichment, scoring, or campaign
							recommendations will be error-free or yield specific results. Use
							of this software is at your own risk.
						</p>
						<hr className="my-4 border-gray-200" />
						<p className="text-gray-700 leading-relaxed">
							Bug Hutch Ltd and its directors accept no liability for any loss,
							damages, or business impact arising from use of this platform.
						</p>
						<hr className="my-4 border-gray-200" />
						<p className="text-gray-700 leading-relaxed">
							Users remain fully responsible for verifying leads, campaigns,
							compliance, and for meeting all applicable advertising and data
							protection regulations (including GDPR, CAN-SPAM, and local laws).
						</p>
						<hr className="my-4 border-gray-200" />
						<p className="text-gray-700 leading-relaxed">
							By using this site and product, you accept these terms in full.
						</p>
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
