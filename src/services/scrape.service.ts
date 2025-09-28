import APIFY_ACTORS from '@/constants/apify';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { apifyService } from './apify.service';
import { proxyAdminService } from './proxy-admin.service';
import { proxyLogsService } from './proxy-logs.service';

export class ScrapeService {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  ];

  private getRandomUserAgent(): string {
    const idx = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[idx];
  }

  async processScrape(url: string, source?: string): Promise<{ title: string, desc: string, emails: string[], error?: string }> {
    let proxy = await proxyAdminService.getNextProxy();
    let proxyResult: { status: 'success' | 'failed' | 'banned' | 'timeout'; message: string | null } = { status: 'success', message: null };
    let shouldLogProxy = true;
    const startTime = new Date();
    try {
      // Use proxy if available
      let fetchOptions: any = {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
        },
      };
      if (proxy?.host && proxy?.port) {
        let proxyUrl = `http://${proxy.host}:${proxy.port}`;
        if (proxy.username && proxy.password) {
          // Add basic auth to proxy URL
          proxyUrl = `http://${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@${proxy.host}:${proxy.port}`;
        }
        fetchOptions.agent = new HttpsProxyAgent(proxyUrl);
      }
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      const html = await response.text();
      const validationError = this.getValidationError(url, html, source);
      if (validationError) {
        shouldLogProxy = false;
        return { title: '', desc: '', emails: [], error: validationError, errorType: 'validation' } as any;
      }
      const $ = cheerio.load(html);
      const title = $('title').text() || '';
      const desc = $('meta[name="description"]').attr('content') || '';
      const emails = this.extractEmailsCheerio($, html);
      return { title, desc, emails };
    } catch (error) {
      const scrapError = this.handleScrapeError(error);
      switch (scrapError.errorType) {
        case 'timeout':
          proxyResult.status = 'timeout';
          break;
        case 'forbidden':
        case 'ssl_error':
          proxyResult.status = 'banned';
          break;
        case 'server_error':
        case 'connection_refused':
        case 'unknown':
        case 'not_found':
          proxyResult.status = 'failed';
          break;
        default:
          proxyResult.status = 'failed';
      }
      proxyResult.message = scrapError.error ?? null;
      console.error('Cheerio scrape error:', error);
      // Always return errorType if error
      return { ...scrapError };
    } finally {
      if (shouldLogProxy && proxy?.host && proxy?.port) {
        const endTime = new Date();
        proxyLogsService.logProxyOperation({
          web_source: (source ?? 'shopify') as 'shopify' | 'etsy' | 'g2' | 'woocommerce',
          web_url: url,
          proxy_host: proxy.host,
          proxy_port: proxy.port,
          proxy_ip: null,
          status: proxyResult.status,
          error: proxyResult.message,
          endTime,
          startTime
        }).catch(err => {
          console.error('Failed to log proxy operation:', err);
        });
      }
    }
  }

  private getValidationError(url: string, html: string, source?: string): string | undefined {
    if (source === 'shopify') {
      const shopifyValidation = this.validateShopify(url, html);
      if (!shopifyValidation.valid) {
        return shopifyValidation.error;
      }
    } else if (source === 'woocommerce') {
      const wooValidation = this.validateWooCommerce(html);
      if (!wooValidation.valid) {
        return wooValidation.error;
      }
    }
    return undefined;
  }

  private extractEmailsCheerio($: any, html: string): string[] {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    let emails: string[] = [];
    $('a[href^="mailto:"]').each((_: number, el: any) => {
      const href = $(el).attr('href');
      if (href) {
        const mail = href.replace(/^mailto:/, '').split('?')[0];
        if (emailRegex.test(mail) && /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(mail) && !/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(mail)) {
          emails.push(mail);
        }
      }
    });
    (html.match(emailRegex) || []).forEach((email: string) => {
      if (/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(email) && !/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(email)) {
        if (!emails.includes(email)) emails.push(email);
      }
    });
    return Array.from(new Set(emails));
  }

  private handleScrapeError(error: unknown): { title: string, desc: string, emails: string[], error: string, errorType: string } {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('net::ERR_TIMED_OUT') || errorMessage.includes('timeout')) {
      return { title: '', desc: '', emails: [], error: 'Request timed out - website took too long to respond', errorType: 'timeout' } as any;
    }
    if (errorMessage.includes('net::ERR_NAME_NOT_RESOLVED')) {
      return { title: '', desc: '', emails: [], error: 'Website not found - please check the URL', errorType: 'not_found' } as any;
    }
    if (errorMessage.includes('net::ERR_CONNECTION_REFUSED')) {
      return { title: '', desc: '', emails: [], error: 'Connection refused - website may be down', errorType: 'connection_refused' } as any;
    }
    if (errorMessage.includes('net::ERR_SSL_PROTOCOL_ERROR')) {
      return { title: '', desc: '', emails: [], error: 'SSL certificate error - website security issue', errorType: 'ssl_error' } as any;
    }
    if (errorMessage.includes('403')) {
      return { title: '', desc: '', emails: [], error: 'Access forbidden - website blocked the request', errorType: 'forbidden' } as any;
    }
    if (errorMessage.includes('404')) {
      return { title: '', desc: '', emails: [], error: 'Page not found - please check the URL', errorType: 'not_found' } as any;
    }
    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
      return { title: '', desc: '', emails: [], error: 'Website server error - please try again later', errorType: 'server_error' } as any;
    }
    return { title: '', desc: '', emails: [], error: 'Scrape failed - unable to access website', errorType: 'unknown' } as any;
  }

  async scrape(url: string, source: string): Promise<{ title: string, desc: string, emails: string[], error?: string }> {
    if (!this.validateUrl(url, source)) {
      return { title: '', desc: '', emails: [], error: 'Invalid URL for source: ' + source, errorType: 'validation' } as any;
    }
    if (source === 'etsy') {
      return this.etsyShopScrape(url);
    }
    if (source === 'g2') {
      return this.g2ProductScrape(url);
    }
    return await this.processScrape(url, source);
  }

  validateUrl(url: string, source: string): boolean {
    if (!url || !/^https?:\/\//i.test(url)) return false;

    switch (source) {
      case "g2":
        return /^https?:\/\/(www\.)?g2\.com\/products\/[\w-]+/i.test(url);
      case "etsy":
        return /^https?:\/\/(www\.)?etsy\.com\/shop\/[\w-]+/i.test(url);
      default:
        return true;
    }
  }

  private validateWooCommerce(html: string): { valid: boolean, error?: string } {
    const hasPlugin = html.includes("wp-content/plugins/woocommerce/");
    // Check for WooCommerce API endpoint in HTML (not via fetch)
    const hasApi = html.includes("wp-json/wc/v3/products");
    if (!hasPlugin && !hasApi) {
      return { valid: false, error: "Not a WooCommerce site" };
    }
    return { valid: true };
  }

  private validateShopify(url: string, html: string): { valid: boolean, error?: string } {
    const isShopify = /^https?:\/\/(www\.)?[\w-]+\.myshopify\.com(\/.*)?$/i.test(url) || html.includes("cdn.shopify.com");
    if (!isShopify) {
      return { valid: false, error: "Not a Shopify site" };
    }
    return { valid: true };
  }

  private async etsyShopScrape(url: string): Promise<{ title: string, desc: string, emails: string[], error?: string }> {
    const match = url.match(/^https?:\/\/(www\.)?etsy\.com\/shop\/([\w-]+)/i);
    if (!match || match.length < 3) {
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid Etsy shop URL", errorType: 'validation' } as any);
    }
    let shopName = match[2];
    if (!shopName) {
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid Etsy shop name", errorType: 'validation' } as any);
    }
    // Extract the first word from shopName (split by hyphen or space)
    const firstWord = shopName.split(/[-\s]/)[0];
    try {
      const resp = await apifyService.runActorSyncGetDatasetItems({
        actorId: APIFY_ACTORS.ETSY_SHOP_SCRAPER,
        input: {
          query: firstWord,
          limit: 1,
          max_shop_listings: 1
        },
      })
      if (Array.isArray(resp) && resp?.length > 0) {
        const item = resp[0];
        return { title: `${item?.shop_name} - ${item?.location}`, desc: item?.headline, emails: [] };
      } else {
        return { title: '', desc: '', emails: [], error: 'Scrape failed', errorType: 'scrape_failed' } as any;
      }
    } catch (error) {
      console.error('Etsy scrape error:', error);
      return { title: '', desc: '', emails: [], error: 'Scrape failed', errorType: 'scrape_failed' } as any;
    }
  }
  private async g2ProductScrape(url: string): Promise<{ title: string, desc: string, emails: string[], error?: string }> {
    const match = url.match(/^https?:\/\/(www\.)?g2\.com\/products\/([\w-]+)/i);
    if (!match || match.length < 3) {
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid G2 product URL", errorType: 'validation' } as any);
    }
    let productSlug = match[2];
    if (!productSlug) {
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid G2 product slug", errorType: 'validation' } as any);
    }
    // Extract the first word from productSlug (split by hyphen or space)
    const firstWord = productSlug.split(/[-\s]/)[0];
    try {
      const resp = await apifyService.runActorSyncGetDatasetItems({
        actorId: APIFY_ACTORS.G2_PRODUCT_SCRAPER,
        input: {
          g2ProductUrls: [
            url
          ],
          limit: 1
        },
      });
      if (Array.isArray(resp) && resp.length > 0) {
        const item = resp[0];
        return { title: item?.product_name || '', desc: item?.description || '', emails: [] };
      } else {
        return { title: '', desc: '', emails: [], error: 'Scrape failed', errorType: 'scrape_failed' } as any;
      }
    } catch (error) {
      console.error('G2 scrape error:', error);
      return { title: '', desc: '', emails: [], error: 'Scrape failed', errorType: 'scrape_failed' } as any;
    }
  }
}
export const scrapeService = new ScrapeService();
