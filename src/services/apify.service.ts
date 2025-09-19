// ApifyService: Call Apify API using fetch
// Usage: apifyService.runActor({ actorId, input })

import { APIFY_TOKEN } from "@/constants/apify";

export interface ApifyRunActorOptions {
  actorId: string;
  input?: Record<string, any>;
}

export class ApifyService {
  /**
   * Run Apify actor synchronously and get dataset items
   * @param {object} params
   * @param {string} params.actorId - Actor ID (e.g. 'axlymxp~etsy-shop-scraper')
   * @param {object} [params.input] - Input for actor
   * @returns {Promise<any[]>} - Array of dataset items
   */
  async runActorSyncGetDatasetItems({ actorId, input }: {
    actorId: string;
    input?: Record<string, any>;
  }): Promise<any[]> {
    const apiToken = APIFY_TOKEN
    if (!apiToken) throw new Error('Missing Apify API token');
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${apiToken}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: input ? JSON.stringify({ ...input }) : undefined,
    });
    if (!res.ok) {
      throw new Error(`Apify API error: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    // Apify returns { items: [...] }
    return data;
  }
}

export const apifyService = new ApifyService();
