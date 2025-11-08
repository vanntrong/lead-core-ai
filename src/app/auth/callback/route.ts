import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/utils/helper";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") || "/dashboard";
	const error = searchParams.get("error");

	// Handle OAuth error from provider
	if (error) {
		console.error("OAuth error:", error);
		return redirect(`/login?error=oauth_${error}`);
	}

	// If no code, redirect to login with error
	if (!code) {
		return redirect("/login?error=oauth_missing_code");
	}

	try {
		const supabase = await createClient();

		// Exchange authorization code for session
		const { data, error: exchangeError } =
			await supabase.auth.exchangeCodeForSession(code);

		if (exchangeError) {
			console.error("Session exchange error:", exchangeError);
			return redirect("/login?error=oauth_exchange_failed");
		}

		// Check if user is admin and redirect accordingly
		if (data?.user?.email) {
			const isAdmin = getAdminEmails().includes(data.user.email.toLowerCase());
			if (isAdmin) {
				return redirect("/admin/dashboard/scraper-logs");
			}
		}

		// Redirect to requested page or dashboard
		return redirect(next);
	} catch (err) {
		console.error("Unexpected error during OAuth callback:", err);
		if (isRedirectError(err)) {
			throw err;
		}
		return redirect("/login?error=oauth_failed");
	}
}
