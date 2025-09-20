import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@latest";
const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")
});
async function sendToClaude(promptContent, { model = "claude-3-7-sonnet-20250219", maxTokens = 2048 } = {}) {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: promptContent
        }
      ]
    });
    const textOutput = response.content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
    return textOutput;
  } catch (error) {
    console.error("Anthropic API Error:", error);
    throw error;
  }
}
async function enrichLead(scrapInfo) {
  console.log("scrapInfo:", scrapInfo);
  const prompt = `
You are an AI enrichment assistant.
Input is scraped raw data from a website.

Data:
${JSON.stringify(scrapInfo, null, 2)}

Task:
1. Write a clear 3–4 sentence **summary** describing what this company/product does.
2. Suggest a short, catchy **title_guess** (max 6 words).

Return ONLY valid JSON. 
Do not include any explanation, commentary, or text outside JSON.
Format strictly as:

{
  "summary": "string",
  "title_guess": "string",
}
`.trim();
  const output = await sendToClaude(prompt);
  console.log(output);
  try {
    return JSON.parse(output.trim());
  } catch {
    throw new Error("Claude did not return valid JSON: " + output);
  }
}
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
async function processJobsForUser(user_id) {
  const { data: job, error } = await supabase.from("leads").select("id, scrap_info").eq("user_id", user_id).eq("status", "scraped").limit(1).maybeSingle();
  if (error && error.code !== "PGRST116") {
    console.error(`Error fetching job for user ${user_id}:`, error);
  }
  if (!job) return;
  const { error: updateError } = await supabase.from("leads").update({
    status: "enriching"
  }).eq("id", job?.id);
  if (updateError) {
    console.error(`Error update job for user ${user_id}:`, updateError);
  }
  let enriched = null;
  let enrichFailed = false;
  if (job.scrap_info) {
    try {
      enriched = await enrichLead(job.scrap_info);
    } catch (err) {
      enrichFailed = true;
      console.error(`Enrichment failed for job ${job.id}:`, err);
    }
  }
  const updateData = enrichFailed ? {
    status: "scraped",
    enrich_info: null
  } // For retry
    : {
      status: "enriched",
      enrich_info: enriched
    };
  const { error: updateEnrichError } = await supabase.from("leads").update(updateData).eq("id", job?.id);
  if (updateEnrichError) {
    console.error(`Error update enrich job for user ${user_id}:`, updateEnrichError);
    return;
  }
  let verifyEmailStatus = "invalid";
  let verifyEmailData = null;
  const emails = job?.scrap_info?.emails ?? [];
  verifyEmailSync(emails[0]);
  if (emails && emails.length > 0) {
    try {
      verifyEmailData = await verifyEmailSync(emails[0]);
      if (verifyEmailData && verifyEmailData.length > 0 && verifyEmailData[0].status === "valid") {
        verifyEmailStatus = "verified";
      }
    } catch (err) {
      verifyEmailStatus = "failed";
      console.error(`Email verification failed for job ${job.id}:`, err);
    }
  }
  const updateVerifyEmailData = {
    verify_email_status: verifyEmailStatus,
    verify_email_info: verifyEmailData
  };
  const { error: updateVerifyEmailError } = await supabase.from("leads").update(updateVerifyEmailData).eq("id", job?.id);
  if (updateVerifyEmailError) {
    console.error(`Error update verify email job for user ${user_id}:`, updateVerifyEmailError);
  }
}
const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
async function verifyEmailSync(email) {
  const url = new URL(`https://api.apify.com/v2/acts/fatihtahta~email-verifier-free-to-use/run-sync-get-dataset-items`);
  url.searchParams.append("token", APIFY_API_TOKEN);
  const resp = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      emails: [
        email
      ],
      checkDeliverability: true,
      allowInternationalized: false
    })
  });
  // 201 = OK, OUTPUT record returned
  // nếu >300s, có thể trả lỗi timeout 408 hoặc trạng thái tương tự
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Apify run-sync error: ${resp.status} ${resp.statusText}: ${text}`);
  }
  const result = await resp.json();
  return result; // result là OUTPUT record từ key-value store
}
Deno.serve(async () => {
  try {
    const { data: users, error } = await supabase.rpc("get_users_with_available_enrich_jobs");
    if (error) {
      console.error("Supabase select error:", error);
      return new Response(JSON.stringify({
        ok: false,
        error
      }), {
        status: 500
      });
    }
    if (!users) {
      return new Response(JSON.stringify({
        ok: true
      }), {
        status: 200
      });
    }
    for (const user of users) {
      processJobsForUser(user.user_id);
    }
    return new Response(JSON.stringify({
      ok: true
    }), {
      status: 200
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      ok: false,
      error: err
    }), {
      status: 500
    });
  }
});
