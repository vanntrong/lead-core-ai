import { createClient } from "@/lib/supabase/server";
import { normalizeUrl } from '@/lib/utils';
import { leadScoringService } from '@/services/lead-scoring.service';
import { CreateLeadData, Lead, LeadFilters, LeadScrapInfo, LeadStats, PaginatedLeadResponse, UpdateLeadData } from '@/types/lead';
import { Json } from '../../database.types';
import { scrapeService } from "./scrape.service";
import { scraperLogsService } from "./scraper-logs.service";
import { subscriptionService } from "./subscription.service";
import { usageLimitService } from "./usage-limit.service";

export class LeadService {
  private async getSupabaseClient() {
    return await createClient();
  }

  async getLeadById(id: string): Promise<Lead | null> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Load not found
      }
      console.error("Error fetching load:", error);
      throw new Error(`Failed to fetch load: ${error.message}`);
    }

    if (!data) return null;

    return {
      ...data,
      scrap_info: typeof data.scrap_info === "string" ? JSON.parse(data.scrap_info) : data.scrap_info as LeadScrapInfo | null,
    };
  }

  async getLeadsPaginated(filters: LeadFilters = {}): Promise<PaginatedLeadResponse> {
    const supabase = await this.getSupabaseClient();

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build data query
    let query = supabase.from('leads').select('*');

    query = query.eq('flagged', false);

    // Build count query (head:true for faster count)
    let countQuery = supabase.from('leads').select('*', { count: 'exact', head: true });

    countQuery = countQuery.eq('flagged', false);

    // Apply filters to both queries
    if (filters.status) {
      query = query.eq('status', filters.status);
      countQuery = countQuery.eq('status', filters.status);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
      countQuery = countQuery.eq('source', filters.source);
    }
    if (filters.verify_email_status) {
      query = query.eq('verify_email_status', filters.verify_email_status);
      countQuery = countQuery.eq('verify_email_status', filters.verify_email_status);
    }
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      const searchFilter = `url.ilike.${searchTerm}`;
      query = query.or(searchFilter);
      countQuery = countQuery.or(searchFilter);
    }

    if (filters.date_range?.start) {
      query = query
        .gte('created_at', filters.date_range.start)
      countQuery = countQuery
        .gte('created_at', filters.date_range.start)
    }

    if (filters.date_range?.end) {
      query = query
        .lte('created_at', filters.date_range.end);
      countQuery = countQuery
        .lte('created_at', filters.date_range.end);
    }

    // Apply pagination and ordering
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      query,
      countQuery,
    ]);

    if (error) {
      console.error("Error fetching paginated leads:", error);
      throw new Error(`Failed to fetch paginated leads: ${error.message}`);
    }

    if (countError) {
      console.error("Error fetching leads count:", countError);
      throw new Error(`Failed to fetch leads count: ${countError.message}`);
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: (data ?? []).map((lead) => ({
        ...lead,
        scrap_info: typeof lead.scrap_info === "string" ? JSON.parse(lead.scrap_info) : lead.scrap_info as LeadScrapInfo | null,
      })),
      totalCount,
      currentPage: page,
      totalPages,
      itemsPerPage: limit,
    };
  }

  async getLeads(filters?: LeadFilters): Promise<Lead[]> {
    const supabase = await this.getSupabaseClient();

    let query = supabase.from('leads').select('*');

    query = query.eq('flagged', false);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.verify_email_status) {
      query = query.eq('verify_email_status', filters.verify_email_status);
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      query = query.or(
        `url.ilike.${searchTerm},source.ilike.${searchTerm},status.ilike.${searchTerm}`
      );
    }
    if (filters?.date_range) {
      query = query.gte('created_at', filters.date_range.start).lte('created_at', filters.date_range.end);
    }
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }
    return (data ?? []).map((lead) => ({
      ...lead,
      scrap_info: typeof lead.scrap_info === "string" ? JSON.parse(lead.scrap_info) : lead.scrap_info as LeadScrapInfo | null,
    }));
  }

  async updateLead(data: UpdateLeadData) {
    const supabase = await this.getSupabaseClient();
    const { id, ...updateData } = data;

    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Error updating lead:", error);
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    return updatedLead;
  }

  async createLead(data: CreateLeadData) {
    const supabase = await this.getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      throw new Error("User not found");
    }

    const activeSubscription = await subscriptionService.getUserActiveSubscription();
    if (!activeSubscription) {
      throw new Error("No active subscription found. Please subscribe to a plan to add leads.");
    }

    if (
      activeSubscription.usage_limits &&
      typeof activeSubscription.usage_limits.current_leads === "number" &&
      typeof activeSubscription.usage_limits.max_leads === "number" &&
      activeSubscription.usage_limits.max_leads !== null &&
      activeSubscription.usage_limits.current_leads >= activeSubscription.usage_limits.max_leads
    ) {
      throw new Error("Lead limit exceeded. Please upgrade your plan.");
    }

    if (activeSubscription.usage_limits?.sources?.includes(data.source) === false) {
      throw new Error(`Selected source is not available in your current plan. Please choose a different source or upgrade your plan.`);
    }

    // Track scraping operation
    const startTime = new Date();
    let scrapInfo;
    let scrapingSuccess = false;
    let scrapingError: string | undefined;

    try {
      scrapInfo = await scrapeService.scrape(data.url, data.source);
      if (scrapInfo?.error) {
        scrapingError = scrapInfo.error;
        const errorType = (scrapInfo as any)?.errorType || 'scrape_failed';
        const errorMessage = `[${errorType}] ${scrapInfo.error || "Failed to scrape URL"}`;
        const error = new Error(errorMessage);
        throw error;
      }
      scrapingSuccess = true;
    } catch (error: any) {
      scrapingError = error.message || "Failed to scrape URL";
      throw error;
    } finally {
      // Log scraping operation regardless of success or failure
      const endTime = new Date();
      scraperLogsService.logScrapingOperation({
        source: data.source,
        url: data.url,
        startTime,
        endTime,
        success: scrapingSuccess,
        error: scrapingError
      }).catch((err) => {
        console.error("Error logging scraping operation:", err);
      });
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        url: normalizeUrl(data.url),
        source: data.source,
        scrap_info: scrapInfo as Json | undefined,
        user_id: userData?.user?.id,
        status: scrapInfo?.title ? "scraped" : "scrap_failed",
      })
      .select('*')
      .single();

    if (error) {
      console.error("Error creating lead:", error);
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    usageLimitService.increCurrentLeads().catch((err) => {
      console.error("Error updating usage limit:", err);
    });

    return newLead;
  }

  async deleteLead(id: string): Promise<void> {
    const supabase = await this.getSupabaseClient();

    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", id)
      .single();

    if (!lead) {
      throw new Error("Lead not found");
    }

    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      console.error("Error deleting lead:", error);
      throw new Error(`Failed to delete lead: ${error.message}`);
    }
  }

  async getLeadStats(): Promise<LeadStats> {
    const supabase = await this.getSupabaseClient();

    const { data: leads, error: supabaseError } = await supabase
      .from("leads")
      .select("*")
      .eq('flagged', false);

    if (supabaseError) {
      console.error("Error fetching lead stats:", supabaseError);
      throw new Error(`Failed to fetch lead stats: ${supabaseError.message}`);
    }

    // Type assertion for Supabase result
    const typedLeads = (leads ?? []) as Array<Lead & { enrich_info: Lead["enrich_info"] | string }>;

    const total = typedLeads.length;
    const verified_email = typedLeads.filter((l) => l.verify_email_status === "verified").length;
    const enriched = typedLeads.filter((l) => l.status === "enriched").length;
    const errorCount = typedLeads.filter((l) => l.status === "scrap_failed").length;

    const score_70_plus = leadScoringService.scoreLeads(typedLeads).filter((score) => {
      return typeof score === "number" && score >= 70;
    }).length;

    const score_90_plus = leadScoringService.scoreLeads(typedLeads).filter((score) => {
      return typeof score === "number" && score >= 90;
    }).length;

    // Calculate breakdown by source
    const sourceMap: Record<string, number> = {};
    typedLeads.forEach((lead) => {
      if (lead.source) {
        sourceMap[lead.source] = (sourceMap[lead.source] || 0) + 1;
      }
    });
    const source_breakdown = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));

    return {
      total,
      verified_email,
      enriched,
      score_70_plus,
      score_90_plus,
      error: errorCount,
      source_breakdown,
    };
  }

  async generateMockLeads() {
    const supabase = await this.getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      throw new Error("User not found");
    }

    // Lead 1: Creative Web Designs
    const { error } = await supabase
      .from('leads')
      .insert([
        {
          user_id: userData.user.id,
          source: "shopify",
          url: "https://www.creativewebdesigns.co.nz/pages/contact-creative-web-designs",
          status: "enriched",
          verify_email_status: "verified",
          scrap_info: {
            desc: "Modern, on-brand Shopify websites that are easy to manage, designed to convert, and ready to grow with your business. Get in touch.",
            title: "Contact Creative Web Designs | Shopify Experts Auckland",
            emails: ["jeanine@creativewebdesigns.co.nz"],
          },
          enrich_info: {
            summary: "Creative Web Designs specializes in creating modern, branded Shopify websites for businesses in Auckland. They focus on developing sites that are easy to manage while being designed to drive conversions. Their expertise as Shopify specialists positions them to build scalable e-commerce solutions that can grow alongside their clients' businesses.",
            title_guess: "Auckland Shopify Experts",
          },
          verify_email_info: [
            {
              status: "valid",
              details: {
                mx: [
                  [10, "aspmx.l.google.com"],
                  [20, "alt1.aspmx.l.google.com"],
                  [30, "alt2.aspmx.l.google.com"],
                  [40, "alt3.aspmx.l.google.com"],
                  [50, "alt4.aspmx.l.google.com"],
                ],
                domain: "creativewebdesigns.co.nz",
                original: "jeanine@creativewebdesigns.co.nz",
                smtputf8: false,
                local_part: "jeanine",
                normalized: "jeanine@creativewebdesigns.co.nz",
                ascii_email: "jeanine@creativewebdesigns.co.nz",
                ascii_domain: "creativewebdesigns.co.nz",
                display_name: null,
                ascii_local_part: "jeanine",
                mx_fallback_type: null,
              },
              input_email: "jeanine@creativewebdesigns.co.nz",
            },
          ],
        },
        // Lead 2: Astrid & Miyu
        {
          user_id: userData.user.id,
          source: "shopify",
          url: "https://www.astridandmiyu.com",
          status: "enriched",
          verify_email_status: "verified",
          scrap_info: {
            desc: "Discover Astrid & Miyu's jewellery, designed in London and curated by you. Shop necklaces, rings and earrings today.",
            title: "Shop Contemporary Jewellery to Stack & Style | Astrid & Miyu",
            emails: ["customercare@astridandmiyu.com", "hey@craftpip.com"],
          },
          enrich_info: {
            summary: "Astrid & Miyu is a London-based jewelry brand offering contemporary pieces designed to be stacked and styled together. Their collection includes necklaces, rings, and earrings that customers can curate to create personalized looks. The brand emphasizes modern, stylish designs that allow for individual expression through jewelry layering and combination.",
            title_guess: "London's Stackable Jewelry Designer",
          },
          verify_email_info: [
            {
              status: "valid",
              details: {
                mx: [
                  [1, "aspmx.l.google.com"],
                  [5, "alt1.aspmx.l.google.com"],
                  [5, "alt2.aspmx.l.google.com"],
                  [10, "alt3.aspmx.l.google.com"],
                  [10, "alt4.aspmx.l.google.com"],
                ],
                domain: "astridandmiyu.com",
                original: "customercare@astridandmiyu.com",
                smtputf8: false,
                local_part: "customercare",
                normalized: "customercare@astridandmiyu.com",
                ascii_email: "customercare@astridandmiyu.com",
                ascii_domain: "astridandmiyu.com",
                display_name: null,
                ascii_local_part: "customercare",
                mx_fallback_type: null,
              },
              input_email: "customercare@astridandmiyu.com",
            },
          ],
        },
      ]);

    if (error) {
      console.error("Error creating mock leads:", error);
      throw new Error(`Failed to create mock leads: ${error.message}`);
    }

    return true;
  }
}

export const leadService = new LeadService();
