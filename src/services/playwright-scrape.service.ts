import APIFY_ACTORS from '@/constants/apify';
import { LeadSource } from '@/types/lead';
import { Browser, chromium, Page } from 'playwright';
import { apifyService } from './apify.service';
import { proxyAdminService } from './proxy-admin.service';
import { proxyLogsService } from './proxy-logs.service';

export class PlaywrightScrapeService {
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
    let browser: Browser | undefined;
    let page: Page | undefined;
    const proxy = await proxyAdminService.getNextProxy();
    let proxyResult: { status: 'success' | 'failed' | 'banned' | 'timeout'; message: string | null } = { status: 'success', message: null };
    let shouldLogProxy = true;
    const startTime = new Date();
    try {
      browser = await chromium.launch();
      page = await browser.newPage({
        userAgent: this.getRandomUserAgent(),
        viewport: { width: 1280, height: 800 },
      });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const html = await page.content();

      const validationError = this.getValidationError(url, html, source);
      if (validationError) {
        shouldLogProxy = false;
        return { title: '', desc: '', emails: [], error: validationError };
      }

      const emails = await this.extractEmails(page, html);
      const title = await page.title();
      const desc = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => '') ?? '';
      return { title, desc, emails };
    } catch (error) {
      const scrapError = this.handleScrapeError(error);
      // Classify status based on errorType
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
      proxyResult.message = scrapError.error;
      console.error('Playwright scrape error:', error);
      return scrapError;
    } finally {
      if (shouldLogProxy && proxy?.host && proxy?.port) {
        const endTime = new Date();
        // Log the proxy operation
        proxyLogsService.logProxyOperation({
          web_source: source as LeadSource,
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
      if (browser) await browser.close();
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

  private async extractEmails(page: Page, html: string): Promise<string[]> {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    let emails: string[] = [];
    const mailtos = await page.$$eval('a[href^="mailto:"]', els => els.map(el => el.getAttribute('href')));
    mailtos.forEach(href => {
      if (href) {
        const mail = href.replace(/^mailto:/, '').split('?')[0];
        if (emailRegex.test(mail) && /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(mail) && !/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(mail)) {
          emails.push(mail);
        }
      }
    });
    (html.match(emailRegex) || []).forEach(email => {
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
      return { title: '', desc: '', emails: [], error: 'Invalid URL for source: ' + source };
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
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid Etsy shop URL" });
    }
    let shopName = match[2];
    if (!shopName) {
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid Etsy shop name" });
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
        return { title: '', desc: '', emails: [], error: 'Scrape failed' };
      }
    } catch (error) {
      console.error('Etsy scrape error:', error);
      return { title: '', desc: '', emails: [], error: 'Scrape failed' };
    }
  }
  private async g2ProductScrape(url: string): Promise<{ title: string, desc: string, emails: string[], error?: string }> {
    const match = url.match(/^https?:\/\/(www\.)?g2\.com\/products\/([\w-]+)/i);
    if (!match || match.length < 3) {
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid G2 product URL" });
    }
    let productSlug = match[2];
    if (!productSlug) {
      return Promise.resolve({ title: '', desc: '', emails: [], error: "Invalid G2 product slug" });
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
        return { title: '', desc: '', emails: [], error: 'Scrape failed' };
      }
    } catch (error) {
      console.error('G2 scrape error:', error);
      return { title: '', desc: '', emails: [], error: 'Scrape failed' };
    }
  }
}
export const playwrightScrapeService = new PlaywrightScrapeService();
