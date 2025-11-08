"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./button";

const COOKIE_CONSENT_KEY = "leadcore-cookie-consent";

export function CookieBanner() {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		// Check if user has already accepted cookies
		const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
		if (!consent) {
			setShowBanner(true);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
		setShowBanner(false);
	};

	if (!showBanner) {
		return null;
	}

	return (
		<div className="fixed right-0 bottom-0 left-0 z-50 border-gray-200 border-t bg-white p-4 shadow-lg sm:p-6">
			<div className="mx-auto flex max-w-7xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
						<Cookie className="h-5 w-5 text-indigo-600" />
					</div>
					<div className="flex-1">
						<p className="text-gray-900 text-sm leading-relaxed">
							We use cookies to enhance your experience and analyze site usage.
							By clicking "Accept", you consent to our use of cookies.{" "}
							<Link
								className="text-indigo-600 underline hover:text-indigo-700"
								href="/privacy"
							>
								Learn more
							</Link>
						</p>
					</div>
				</div>
				<div className="flex w-full shrink-0 gap-3 sm:w-auto">
					<Button
						asChild
						className="flex-1 sm:flex-none"
						size="sm"
						variant="outline"
					>
						<Link href="/privacy">Manage</Link>
					</Button>
					<Button
						className="flex-1 sm:flex-none"
						onClick={handleAccept}
						size="sm"
					>
						Accept
					</Button>
				</div>
			</div>
		</div>
	);
}
