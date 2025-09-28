// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@latest";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
export const supabase = createClient(supabaseUrl, supabaseKey);

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")
});

const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");

async function sendToClaude(promptContent: string, { model = "claude-3-7-sonnet-20250219", maxTokens = 2048 } = {}) {
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

async function enrichLead(scrapInfo: any) {
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

async function verifyEmailSync(email: string) {
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

export async function processJobsForUser(user_id: string) {
  // 1. Lấy job
  const { data: job, error } = await supabase.from("leads").select("id, scrap_info").eq("user_id", user_id).eq("status", "scraped").order("created_at").limit(1).maybeSingle();
  if (error && error.code !== "PGRST116") return console.error(error);
  if (!job) return;

  // 2. Set status enriching
  const { error: updateError } = await supabase.from("leads").update({
    status: "enriching"
  }).eq("id", job.id);
  if (updateError) return console.error(updateError);

  // 3. Enrich
  let enriched = null;
  let enrichFailed = false;
  if (job.scrap_info) {
    try {
      enriched = await enrichLead({ ...job.scrap_info, url: job.url });
    } catch (err) {
      enrichFailed = true;
      console.error(`Enrichment failed for job ${job.id}:`, err);
    }
  }

  // 4. Update enrichment result
  const { error: updateEnrichError } = await supabase.from("leads").update(enrichFailed ? {
    status: "scraped",
    enrich_info: null
  } : {
    status: "enriched",
    enrich_info: enriched
  }).eq("id", job.id);
  if (updateEnrichError) return console.error(updateEnrichError);

  // 5. Verify email
  const emails = job.scrap_info?.emails ?? [];
  let verifyEmailStatus = "invalid";
  let verifyEmailData = null;
  if (emails.length > 0) {
    try {
      verifyEmailData = await verifyEmailSync(emails[0]);
      if (verifyEmailData?.[0]?.status === "valid") verifyEmailStatus = "verified";
    } catch (err) {
      verifyEmailStatus = "failed";
      console.error(`Email verification failed for job ${job.id}:`, err);
      // Nếu verify email lỗi, reset status về scraped
      await supabase.from("leads").update({
        status: "scraped",
        verify_email_status: "pending",
        verify_email_info: null
      }).eq("id", job.id);
      return;
    }
  }

  // 6. Update email verification
  const { error: updateVerifyEmailError } = await supabase.from("leads").update({
    verify_email_status: verifyEmailStatus,
    verify_email_info: verifyEmailData
  }).eq("id", job.id);
  if (updateVerifyEmailError) console.error(updateVerifyEmailError);
}