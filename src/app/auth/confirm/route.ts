import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAdminEmails } from "@/utils/helper";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;

	if (token_hash && type) {
		const supabase = await createClient();
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		});
		if (!error) {
			// Get user info
			const {
				data: { user },
			} = await supabase.auth.getUser();
			const isAdmin = getAdminEmails().includes(user?.email || "");
			// Redirect admin to /admin, others to /dashboard
			if (isAdmin) {
				redirect("/admin/dashboard/scraper-logs");
			} else {
				redirect("/dashboard");
			}
		}
	}
	// redirect the user to an error page with some instructions
	redirect("/");
}
