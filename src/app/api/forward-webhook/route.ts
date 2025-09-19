import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, data } = await req.json();
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