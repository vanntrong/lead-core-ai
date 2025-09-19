import APIFY_ACTORS from '@/constants/apify';
import { Browser, chromium, Page } from 'playwright';
import { apifyService } from './apify.service';

export class PlaywrightScrapeService {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  ];

  private proxies = [
    undefined, // direct connection
    // Example: 'http://dc.oxylabs.io:8001',
    // Add more proxies here
  ];

  private getRandomUserAgent(): string {
    const idx = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[idx];
  }

  private getRandomProxy(): string | undefined {
    const idx = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[idx];
  }

  async processScrape(url: string, source?: string): Promise<{ title: string, desc: string, emails: string[], error?: string }> {
    let browser: Browser | undefined;
    let page: Page | undefined;
    const proxy = this.getRandomProxy();
    try {
      browser = await chromium.launch({
        proxy: proxy ? { server: proxy } : undefined,
      });
      page = await browser.newPage({
        userAgent: this.getRandomUserAgent(),
        viewport: { width: 1280, height: 800 },
      });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const html = await page.content();

      if (source === 'shopify') {
        const shopifyValidation = this.validateShopify(url, html);
        if (!shopifyValidation.valid) {
          return { title: '', desc: '', emails: [], error: shopifyValidation.error };
        }
      } else if (source === 'woocommerce') {
        const wooValidation = this.validateWooCommerce(html);
        if (!wooValidation.valid) {
          return { title: '', desc: '', emails: [], error: wooValidation.error };
        }
      }

      // Email extraction directly from HTML
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?!\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp|\.ico|\.css|\.js)/g;
      let emails: string[] = [];
      // Also extract from mailto links
      const mailtos = await page.$$eval('a[href^="mailto:"]', els => els.map(el => el.getAttribute('href')));
      mailtos.forEach(href => {
        if (href) {
          const mail = href.replace(/^mailto:/, '').split('?')[0];
          if (emailRegex.test(mail)) emails.push(mail);
        }
      });
      emails = emails.filter(e => !/(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(e));
      emails = Array.from(new Set(emails));
      (html.match(emailRegex) || []).forEach(email => { if (!emails.includes(email)) emails.push(email); });
      // Title and description extraction
      const title = await page.title();
      const desc = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => '') ?? '';
      return { title, desc, emails };
    } catch (error) {
      console.error('Playwright scrape error:', error);
      return { title: '', desc: '', emails: [], error: 'Scrape failed' };
    } finally {
      if (browser) await browser.close();
    }
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
    return await this.processScrape(url);
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
