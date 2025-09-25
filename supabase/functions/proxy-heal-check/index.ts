
import { processJobsForProxy, supabase } from './helper.ts';

Deno.serve(async () => {
  try {
    const { data: proxies, error } = await supabase
      .from('proxies')
      .select('*')
      .in('status', ['active', 'error'])
      .order('updated_at', { ascending: false })
    if (error) {
      console.error("Supabase select error:", error);
      return new Response(JSON.stringify({
        ok: false,
        error
      }), {
        status: 500
      });
    }
    if (!proxies) {
      return new Response(JSON.stringify({
        ok: true
      }), {
        status: 200
      });
    }
    for (const proxy of proxies) {
      processJobsForProxy({
        id: proxy.id,
        host: proxy.host,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password
      });
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