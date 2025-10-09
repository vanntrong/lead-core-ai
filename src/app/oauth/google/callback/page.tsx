"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CallbackContent() {
	const searchParams = useSearchParams();

	useEffect(() => {
		const code = searchParams.get("code");
		const error = searchParams.get("error");

		if (error) {
			// Send error back to parent window
			if (window.opener) {
				window.opener.postMessage({ error }, window.location.origin);
				window.close();
			}
			return;
		}

		if (code) {
			// Send code back to parent window
			if (window.opener) {
				window.opener.postMessage({ code }, window.location.origin);
				window.close();
			}
		}
	}, [searchParams]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="mx-auto h-8 w-8 animate-spin rounded-full border-indigo-600 border-b-2" />
				<p className="mt-4 text-gray-600">Processing authentication...</p>
			</div>
		</div>
	);
}

export default function OAuthCallback() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CallbackContent />
		</Suspense>
	);
}
