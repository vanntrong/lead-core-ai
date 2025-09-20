import { createClient } from "@/lib/supabase/server";
import { normalizeUrl } from '@/lib/utils';
import { leadScoringService } from '@/services/lead-scoring.service';
import { CreateLeadData, Lead, LeadFilters, LeadScrapInfo, LeadStats, PaginatedLeadResponse, UpdateLeadData } from '@/types/lead';
import { Json } from '../../database.types';
import { playwrightScrapeService } from "./playwright-scrape.service";
import { subscriptionService } from "./subscription.service";


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

    // Build count query (head:true for faster count)
    let countQuery = supabase.from('leads').select('*', { count: 'exact', head: true });

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

    const scrapInfo = await playwrightScrapeService.scrape(data.url, data.source);
    if (scrapInfo?.error) {
      throw new Error(scrapInfo?.error || "Failed to scrape URL");
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
      .select("*");

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

    return {
      total,
      verified_email,
      enriched,
      score_70_plus,
      score_90_plus,
      error: errorCount,
    };
  }

  async generateMockLeads() {
    const supabase = await this.getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      throw new Error("User not found");
    }

    // First mock record
    const scrap_info_1 = {
      raw: {
        h: ["Chúng tôi là ai?", "Tại sao hợp tác với VAC", "Đăng ký trở thành đối tác của chúng tôi"],
        desc: "",
        about: "",
        title: "Trang chủ - VAC",
        emails: ["info@vac.com.vn", "info@vac.com.vn", "info@vac.com.vn", "info@vac.com.vn"],
        features: ["Gạo An Nam", "Gạo Bếp Ăn"],
      },
      url: "https://vac.com.vn/",
      points: ["Focus: Trang chủ - VAC", "Key offering: Chúng tôi là ai?", "Key features: Gạo An Nam, Gạo Bếp Ăn"],
    };
    const enrich_info_1 = {
      score: 45,
      summary:
        "VAC appears to be a Vietnamese company specializing in rice products, particularly Gạo An Nam and Gạo Bếp Ăn varieties. They seem to be seeking partners or distributors for their rice products, as indicated by their call for partnership registration.",
      title_guess: "Vietnamese Rice Supplier and Distribution",
    };
    const verify_email_info_1 = [
      {
        status: "valid",
        details: {
          mx: [[0, "vac-com-vn.mail.protection.outlook.com"]],
          domain: "vac.com.vn",
          original: "info@vac.com.vn",
          smtputf8: false,
          local_part: "info",
          normalized: "info@vac.com.vn",
          ascii_email: "info@vac.com.vn",
          ascii_domain: "vac.com.vn",
          display_name: null,
          ascii_local_part: "info",
          mx_fallback_type: null,
        },
        input_email: "info@vac.com.vn",
      },
    ];

    // Second mock record (from user)
    const scrap_info_2 = {
      raw: {
        h: ["THE TREND REPORT", "Shop By Brand"],
        desc: "Fashion Nova is the top online fashion store for women. Shop sexy club dresses, jeans, shoes, bodysuits, skirts and more. Affordable fashion online!",
        about: "SHOP FASTER WITH THE APPGet HelpHelp CenterTrack OrderShipping InfoReturnsContact UsCompanyCareersAboutStoresWant to Collab?Quick LinksSize GuideSitemapGift CardsCheck Gift Card BalanceGet HelpHelp CenterTrack OrderShipping InfoReturnsContact UsCompanyCareersAboutStoresWant to Collab?Quick LinksSize GuideSitemapGift CardsCheck Gift Card BalanceLEGALPromo T&CsPrivacy PolicyTerms of ServiceCA Supply Chains ActSIGN UP FOR DISCOUNTS + UPDATESEmail Address© 2025 Fashion Nova, LLC All Rights ReservedPromo T&CsPrivacy PolicyTerms of ServiceCA Supply Chains Act",
        title: "Fashion Nova | Fashion Online For Women | Affordable Women's Clothing | Fashion Nova",
        emails: [
          "e7c5d00f7ff26a82791e5ece4cbfb27c@o4504566675341312.ingest.sentry.io",
          "e7c5d00f7ff26a82791e5ece4cbfb27c@o4504566675341312.ingest.sentry.io",
        ],
        features: [],
      },
      url: "https://www.fashionnova.com/",
      points: [
        "Focus: Fashion Nova | Fashion Online For Women | Affordable Women's Clothing | Fashion Nova",
        "Key offering: THE TREND REPORT",
        "Positioning: Fashion Nova is the top online fashion store for women. Shop sexy club dresses, jeans, shoes, bodysuits, and skirts. Affordable fashion…",
        "What they do: SHOP FASTER WITH THE APPGet HelpHelp CenterTrack OrderShipping InfoReturnsContact UsCompanyCareersAboutStoresWant to Collab?Quick LinksSize …",
      ],
    };
    const enrich_info_2 = {
      score: 55,
      summary:
        "Fashion Nova is an online fashion retailer offering affordable women's clothing including dresses, jeans, shoes, bodysuits, and skirts. The company positions itself as the top online fashion destination for women, emphasizing trendy styles and accessible pricing.",
      title_guess: "Affordable Women's Fashion Online",
    };
    const verify_email_info_2 = [
      {
        status: "valid",
        details: {
          mx: [[0, "o4504566675341312.ingest.sentry.io"]],
          domain: "o4504566675341312.ingest.sentry.io",
          original: "e7c5d00f7ff26a82791e5ece4cbfb27c@o4504566675341312.ingest.sentry.io",
          smtputf8: false,
          local_part: "e7c5d00f7ff26a82791e5ece4cbfb27c",
          normalized: "e7c5d00f7ff26a82791e5ece4cbfb27c@o4504566675341312.ingest.sentry.io",
          ascii_email: "e7c5d00f7ff26a82791e5ece4cbfb27c@o4504566675341312.ingest.sentry.io",
          ascii_domain: "o4504566675341312.ingest.sentry.io",
          display_name: null,
          ascii_local_part: "e7c5d00f7ff26a82791e5ece4cbfb27c",
          mx_fallback_type: "A",
        },
        input_email: "e7c5d00f7ff26a82791e5ece4cbfb27c@o4504566675341312.ingest.sentry.io",
      },
    ];

    const { error } = await supabase
      .from('leads')
      .insert([
        {
          id: "cbabac60-fd6a-44bf-b340-8d1edc304c8d",
          created_at: "2025-09-16 10:25:46.308016+00",
          updated_at: "2025-09-16 10:25:46.308016+00",
          user_id: userData.user.id,
          source: "woocommerce",
          url: "https://vac.com.vn",
          status: "enriched",
          verify_email_status: "verified",
          scrap_info: scrap_info_1,
          enrich_info: enrich_info_1,
          total_score: 75,
        },
        {
          id: "b15ac779-3c3d-49b5-b11e-add23e025a50",
          created_at: "2025-09-16 09:49:49.348765+00",
          updated_at: "2025-09-16 09:49:49.348765+00",
          user_id: userData.user.id,
          source: "shopify",
          url: "https://www.fashionnova.com",
          status: "enriched",
          verify_email_status: "verified",
          scrap_info: scrap_info_2,
          enrich_info: enrich_info_2,
          total_score: 88,
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
