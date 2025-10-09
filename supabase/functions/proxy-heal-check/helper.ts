// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const appUrl = Deno.env.get("APP_URL")!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const processJobsForProxy = async ({ id }: { id: string }) => {
	console.log(`Processing proxy: ${id}`);
	// Kiểm tra proxy bằng fetch
	try {
		const response = await fetch(`${appUrl}/api/heal-check`, {
			method: "POST",
			headers: {
				"User-Agent": "Mozilla/5.0 (LeadCoreAI ProxyCheck)",
			},
			body: JSON.stringify({ proxyId: id }),
		});
		if (response.status === 200) {
			console.log(`Proxy ${id} OK`);
			return { id, status: "active" };
		}
			console.log(`Proxy ${id} failed with status ${response.status}`);
			return { id, status: "error", error: `HTTP ${response.status}` };
	} catch (error) {
		console.log(`Proxy ${id} error:`, error);
		const errMsg =
			error instanceof Error && error.message ? error.message : String(error);
		return { id, status: "error", error: errMsg };
	}
};
