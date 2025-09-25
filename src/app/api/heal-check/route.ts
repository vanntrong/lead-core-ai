import { proxyAdminService } from "@/services/proxy-admin.service";
import { proxyHealCheckLogsAdminService } from "@/services/proxy-heal-check-logs-admin.service";
import { HttpsProxyAgent } from 'https-proxy-agent';
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST(req: NextRequest) {
  const { proxyId } = await req.json();

  try {
    const proxy = await proxyAdminService.getProxyById(proxyId);
    if (!proxy) {
      return NextResponse.json({ error: 'Proxy not found' }, { status: 404 });
    }
    const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    const startTime = new Date();
    let checkStatus: 'success' | 'failed' = 'failed';
    let errorMsg = '';
    try {
      const resp = await fetch('https://ip.oxylabs.io/location', {
        agent,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (LeadCoreAI ProxyCheck)'
        }
      });
      if (resp.ok) {
        checkStatus = 'success';
      } else {
        errorMsg = `Proxy response error: HTTP ${resp.status} - ${resp.statusText || 'Unknown error'}`;
      }
    } catch (err) {
      errorMsg = String(err);
    }

    const endTime = new Date();
    await proxyHealCheckLogsAdminService.logProxyHealCheckOperation({
      proxy_host: proxy.host,
      proxy_port: proxy.port,
      startTime,
      endTime,
      status: checkStatus,
      error: errorMsg || null,
    });

    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const logs = await proxyHealCheckLogsAdminService.getLogs({
      proxy_host: proxy.host,
      proxy_port: proxy.port,
      date_range: { start: since24h, end: now.toISOString() },
    });
    const error_count_24h = logs.filter(l => l.status === 'failed').length;
    const avg_response_ms = logs.length > 0
      ? Math.round(
        logs
          .filter(l => typeof l.duration === 'number')
          .reduce((sum, l) => sum + (l.duration || 0), 0) /
        logs.filter(l => typeof l.duration === 'number').length
      )
      : null;

    await proxyAdminService.updateProxy({
      id: proxy.id,
      status: checkStatus === "failed" ? "error" : "active",
      last_checked_at: endTime.toISOString(),
      error_count_24h,
      total_count_24h: logs.length,
      avg_response_ms
    });

    return NextResponse.json({
      proxyId,
      status: checkStatus,
      error: errorMsg,
      avg_response_ms,
      error_count_24h,
      total_count_24h: logs.length,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy check failed', details: String(error) }, { status: 500 });
  }
}