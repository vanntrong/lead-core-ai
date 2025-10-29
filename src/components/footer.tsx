import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-gray-200 border-t bg-white">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="text-center">
					<p className="text-gray-500 text-sm">
						© {new Date().getFullYear()} • Powered by{" "}
						<a
							className="text-indigo-600 transition-colors hover:text-indigo-700"
							href="https://www.emailtown.io"
							rel="noopener noreferrer"
							target="_blank"
						>
							$Town
						</a>
					</p>
					<div className="mt-3 flex flex-wrap items-center justify-center gap-4">
						<Link
							className="text-gray-500 text-sm hover:text-gray-900"
							href="/terms"
						>
							Terms
						</Link>
						<span className="text-gray-300">|</span>
						<Link
							className="text-gray-500 text-sm hover:text-gray-900"
							href="/privacy"
						>
							Privacy
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
							className="text-gray-500 text-sm hover:text-gray-900"
							href="mailto:support@leadcore.ai"
						>
							support@leadcore.ai
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
