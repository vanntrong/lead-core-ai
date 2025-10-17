import { Globe } from "lucide-react";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-gray-200 border-t bg-white">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div className="col-span-1 md:col-span-2">
						<div className="mb-4 flex items-center space-x-3">
							<div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
								<Globe className="h-6 w-6 text-white" />
							</div>
							<span className="font-bold text-gray-900 text-xl">
								LeadCore AI
							</span>
						</div>
						<p className="max-w-md text-gray-600">
							LeadCore AI finds, enriches, and exports leads from top
							sources—fast and automated.
						</p>
					</div>

					<div>
						<h3 className="mb-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
							Product
						</h3>
						<ul className="space-y-3">
							<li>
								<Link
									className="text-gray-600 hover:text-gray-900"
									href="/pricing"
								>
									Pricing
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
							Company
						</h3>
						<ul className="space-y-3">
							<li>
								<Link
									className="text-gray-600 hover:text-gray-900"
									href="/legal"
								>
									Disclaimer
								</Link>
							</li>
							<li>
								<Link
									className="text-gray-600 hover:text-gray-900"
									href="/about"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									className="text-gray-600 hover:text-gray-900"
									href="/contact"
								>
									Contact Support
								</Link>
							</li>
							<li>
								<Link
									className="text-gray-600 hover:text-gray-900"
									href="/terms"
								>
									Terms & Conditions
								</Link>
							</li>
							<li>
								<Link
									className="text-gray-600 hover:text-gray-900"
									href="/privacy"
								>
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-8 border-gray-200 border-t pt-8">
					<p className="text-center text-gray-500 text-sm">
						© {new Date().getFullYear()} LeadCore AI. Powered by $TOWN.
					</p>
				</div>
			</div>
		</footer>
	);
}
