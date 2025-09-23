import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { Subscription } from '@/types/subscription';


export async function POST(req: NextRequest) {
  const { webhookUrl, data } = await req.json();

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: subscription, error: subError }: { data: Subscription | null, error: Error | null } = await supabase
      .from("subscriptions")
      .select("*, usage_limits(*)")
      .eq("subscription_status", "active")
      .single();

    if (subError) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 403 });
    }

    if (!subscription?.usage_limits?.zapier_export) {
      return NextResponse.json({ error: 'No usage limits found for active subscription' }, { status: 403 });
    }

    if (!webhookUrl || !data) {
      return new Response(JSON.stringify({ error: 'Missing webhookUrl or data' }), { status: 400 });
    }

    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      body: JSON.stringify(data),
    });

    const result = await resp.text();
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Forwarding failed', details: String(error) }, { status: 500 });
  }
}