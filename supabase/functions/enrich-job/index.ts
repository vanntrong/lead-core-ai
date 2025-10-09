// @ts-nocheck
import { supabase, processJobsForUser } from "./helper.ts";
Deno.serve(async () => {
	try {
		const { data: users, error } = await supabase.rpc(
			"get_users_with_available_enrich_jobs"
		);
		if (error) {
			console.error("Supabase select error:", error);
			return new Response(
				JSON.stringify({
					ok: false,
					error,
				}),
				{
					status: 500,
				}
			);
		}
		if (!users) {
			return new Response(
				JSON.stringify({
					ok: true,
				}),
				{
					status: 200,
				}
			);
		}
		for (const user of users) {
			processJobsForUser(user.user_id);
		}
		return new Response(
			JSON.stringify({
				ok: true,
			}),
			{
				status: 200,
			}
		);
	} catch (err) {
		console.error("Unexpected error:", err);
		return new Response(
			JSON.stringify({
				ok: false,
				error: err,
			}),
			{
				status: 500,
			}
		);
	}
});
