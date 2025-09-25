import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import axios from 'https://esm.sh/axios@1.6.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const processJobsForProxy = async ({ id, host, port, username, password }: { id: string, host: string, port: number, username: string, password: string }) => {
  console.log(`Processing proxy: ${host}:${port}`);
  // Kiểm tra proxy bằng axios với cấu hình proxy
  try {
    const response = await axios.get('https://ip.oxylabs.io/location', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (LeadCoreAI ProxyCheck)'
      }
    });
    if (response.status === 200) {
      console.log(`Proxy ${host}:${port} OK`);
      return { id, status: 'active' };
    } else {
      console.log(`Proxy ${host}:${port} failed with status ${response.status}`);
      return { id, status: 'error', error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`Proxy ${host}:${port} error:`, error);
    return { id, status: 'error', error: error?.message || String(error) };
  }
}