import { Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-gray-200 border-t bg-white">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="text-center">
					{/* Social Links */}
					<div className="mb-4 flex items-center justify-center gap-4">
						<a
							aria-label="Follow us on X (Twitter)"
							className="text-gray-500 transition-colors hover:text-gray-900"
							href="https://twitter.com/leadcoreai"
							rel="noopener noreferrer"
							target="_blank"
						>
							<svg
								className="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</a>
						<a
							aria-label="Follow us on LinkedIn"
							className="text-gray-500 transition-colors hover:text-gray-900"
							href="https://linkedin.com/company/leadcore-ai"
							rel="noopener noreferrer"
							target="_blank"
						>
							<svg
								className="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
							</svg>
						</a>
						<a
							aria-label="Email us"
							className="text-gray-500 transition-colors hover:text-gray-900"
							href="mailto:support@leadcoreai.com"
						>
							<Mail className="h-5 w-5" />
						</a>
					</div>

					{/* Footer Links */}
					<div className="mb-3 flex flex-wrap items-center justify-center gap-4">
						<Link
							className="text-gray-500 text-sm hover:text-gray-900"
							href="/privacy"
						>
							Privacy
						</Link>
						<span className="text-gray-300">|</span>
						<Link
							className="text-gray-500 text-sm hover:text-gray-900"
							href="/terms"
						>
							Terms
						</Link>
						<span className="text-gray-300">|</span>
						<Link
							className="text-gray-500 text-sm hover:text-gray-900"
							href="/legal"
						>
							Disclaimer
						</Link>
						<span className="text-gray-300">|</span>
						<Link
							className="text-gray-500 text-sm hover:text-gray-900"
							href="/about"
						>
							About
						</Link>
						<span className="text-gray-300">|</span>
						<Link
							className="text-gray-500 text-sm hover:text-gray-900"
							href="/contact"
						>
							Contact
						</Link>
						<span className="text-gray-300">|</span>
						<a
							className="font-medium text-indigo-600 text-sm hover:text-indigo-700"
							href="https://bug-hutch-media.getrewardful.com/signup?campaign=leadcoreai"
							rel="noopener noreferrer"
							target="_blank"
						>
							Affiliate Program – Earn 30% Recurring
						</a>
					</div>

					{/* Copyright */}
					<p className="text-gray-500 text-sm">
						© {new Date().getFullYear()} LeadCore AI &middot;{" "}
						<a
							className="text-gray-500 hover:text-gray-900"
							href="mailto:support@leadcoreai.com"
						>
							support@leadcoreai.com
						</a>{" "}
						&middot; Powered by{" "}
						<a
							className="text-indigo-600 transition-colors hover:text-indigo-700"
							href="https://www.emailtown.io"
							rel="noopener noreferrer"
							target="_blank"
						>
							$TOWN
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
