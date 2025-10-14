import { createClient } from "@/lib/supabase/server";
import { normalizeUrl } from "@/lib/utils";
import { leadScoringService } from "@/services/lead-scoring.service";
import { locationGeocodingService } from "@/services/location-geocoding.service";
import type {
	CreateLeadData,
	Lead,
	LeadFilters,
	LeadScrapInfo,
	LeadSource,
	LeadStats,
	PaginatedLeadResponse,
	UpdateLeadData,
} from "@/types/lead";
import {
	extractBusinessType,
	parseLocationBasic,
	parseLocationFromURL,
} from "@/utils/location";
import type { Json } from "../../database.types";
import { scrapeService } from "./scrape.service";
import { scraperLogsService } from "./scraper-logs.service";
import { subscriptionService } from "./subscription.service";
import { usageLimitService } from "./usage-limit.service";

export class LeadService {
	private async getSupabaseClient() {
		return await createClient();
	}

	/**
	 * Generate normalized location search terms for flexible searching
	 * Handles variations like "NY", "New York", "new york", "ny", "United States", "US", "us"
	 */
	private generateLocationSearchTerms(locationData: {
		city?: string;
		state?: string;
		state_code?: string;
		country?: string;
		country_code?: string;
		location_full?: string;
	}): string[] {
		const terms = new Set<string>();

		// Add city variations
		if (locationData.city) {
			terms.add(locationData.city.toLowerCase());
			terms.add(locationData.city.toUpperCase());
			terms.add(locationData.city);
		}

		// Add state variations (both full name and code)
		if (locationData.state) {
			terms.add(locationData.state.toLowerCase());
			terms.add(locationData.state.toUpperCase());
			terms.add(locationData.state);
		}
		if (locationData.state_code) {
			terms.add(locationData.state_code.toLowerCase());
			terms.add(locationData.state_code.toUpperCase());
		}

		// Add country variations
		if (locationData.country) {
			terms.add(locationData.country.toLowerCase());
			terms.add(locationData.country.toUpperCase());
			terms.add(locationData.country);
		}
		if (locationData.country_code) {
			terms.add(locationData.country_code.toLowerCase());
			terms.add(locationData.country_code.toUpperCase());
		}

		// Add full location string variations
		if (locationData.location_full) {
			terms.add(locationData.location_full.toLowerCase());
		}

		// Add combined terms (city + state)
		if (locationData.city && locationData.state) {
			terms.add(`${locationData.city} ${locationData.state}`.toLowerCase());
			terms.add(`${locationData.city}, ${locationData.state}`.toLowerCase());
		}
		if (locationData.city && locationData.state_code) {
			terms.add(`${locationData.city} ${locationData.state_code}`.toLowerCase());
			terms.add(`${locationData.city}, ${locationData.state_code}`.toLowerCase());
		}

		// Add combined terms (city + state + country)
		if (locationData.city && locationData.state && locationData.country) {
			terms.add(`${locationData.city} ${locationData.state} ${locationData.country}`.toLowerCase());
		}

		return Array.from(terms).filter(Boolean);
	}

	/**
	 * Extract location data from scraping results
	 * Uses geocoding service for accurate normalization and address from scrape results
	 */
	private async extractLocationData(
		url: string,
		source: string,
		scrapInfo: any
	): Promise<{
		city?: string;
		state?: string;
		country?: string;
		location_full?: string;
		business_type?: string;
		location_search?: string[];
	}> {
		let locationData: {
			city?: string;
			state?: string;
			state_code?: string;
			country?: string;
			country_code?: string;
			location_full?: string;
		} = {};

		let locationQuery = "";

		// Priority 1: Use address from scrape results (available for google_places, npi_registry, fmcsa)
		if (scrapInfo?.address) {
			locationQuery = scrapInfo.address;
		}

		// Priority 2: Try to parse location from URL (for google_places, npi_registry, fmcsa)
		if (!locationQuery && (
			source === "google_places" ||
			source === "npi_registry" ||
			source === "fmcsa"
		)) {
			const urlLocation = parseLocationFromURL(url);
			if (urlLocation.location_full) {
				locationQuery = urlLocation.location_full;
			}
		}

		// Use geocoding service for accurate location parsing
		if (locationQuery) {
			try {
				const geocoded = await locationGeocodingService.geocodeLocation(locationQuery);
				if (geocoded) {
					locationData = {
						city: geocoded.city,
						state: geocoded.state,
						state_code: geocoded.state_code,
						country: geocoded.country,
						country_code: geocoded.country_code,
						location_full: geocoded.formatted,
					};
				} else {
					// Fallback to basic parsing
					const basicParsed = parseLocationBasic(locationQuery);
					locationData = {
						...basicParsed,
						state_code: basicParsed.state,
						country_code: undefined,
					};
				}
			} catch (error) {
				console.error("Error geocoding location:", error);
				// Fallback to basic parsing
				if (locationQuery) {
					const basicParsed = parseLocationBasic(locationQuery);
					locationData = {
						...basicParsed,
						state_code: basicParsed.state,
						country_code: undefined,
					};
				}
			}
		}

		// Extract business type
		const businessType = extractBusinessType(source, scrapInfo);

		// Generate location search terms for flexible searching
		const locationSearch = this.generateLocationSearchTerms(locationData);

		return {
			city: locationData.city || "",
			state: locationData.state_code || locationData.state || "",
			country: locationData.country || "",
			location_full: locationData.location_full || "",
			business_type: businessType || "",
			location_search: locationSearch.length > 0 ? locationSearch : undefined,
		};
	}

	async getLeadById(id: string): Promise<Lead | null> {
		const supabase = await this.getSupabaseClient();
		const { data, error } = await supabase
			.from("leads")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // Load not found
			}
			console.error("Error fetching load:", error);
			throw new Error(`Failed to fetch load: ${error.message}`);
		}

		if (!data) { return null; }

		return {
			...data,
			scrap_info:
				typeof data.scrap_info === "string"
					? JSON.parse(data.scrap_info)
					: (data.scrap_info as LeadScrapInfo | null),
		};
	}

	async getLeadsPaginated(
		filters: LeadFilters = {}
	): Promise<PaginatedLeadResponse> {
		const supabase = await this.getSupabaseClient();

		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;

		// Build data query
		let query = supabase.from("leads").select("*");

		query = query.eq("flagged", false);

		// Build count query (head:true for faster count)
		let countQuery = supabase
			.from("leads")
			.select("*", { count: "exact", head: true });

		countQuery = countQuery.eq("flagged", false);

		// Apply filters to both queries
		if (filters.status) {
			query = query.eq("status", filters.status);
			countQuery = countQuery.eq("status", filters.status);
		}
		if (filters.source) {
			query = query.eq("source", filters.source);
			countQuery = countQuery.eq("source", filters.source);
		}
		if (filters.verify_email_status) {
			query = query.eq("verify_email_status", filters.verify_email_status);
			countQuery = countQuery.eq(
				"verify_email_status",
				filters.verify_email_status
			);
		}
		if (filters.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			const searchFilter = `url.ilike.${searchTerm}`;
			query = query.or(searchFilter);
			countQuery = countQuery.or(searchFilter);
		}

		if (filters.date_range?.start) {
			query = query.gte("created_at", filters.date_range.start);
			countQuery = countQuery.gte("created_at", filters.date_range.start);
		}

		if (filters.date_range?.end) {
			query = query.lte("created_at", filters.date_range.end);
			countQuery = countQuery.lte("created_at", filters.date_range.end);
		}

		// Location filters
		if (filters.city) {
			const cityTerm = `%${filters.city.toLowerCase()}%`;
			query = query.ilike("city", cityTerm);
			countQuery = countQuery.ilike("city", cityTerm);
		}
		if (filters.state) {
			const stateTerm = `%${filters.state.toUpperCase()}%`;
			query = query.ilike("state", stateTerm);
			countQuery = countQuery.ilike("state", stateTerm);
		}
		if (filters.country) {
			const countryTerm = `%${filters.country.toLowerCase()}%`;
			query = query.ilike("country", countryTerm);
			countQuery = countQuery.ilike("country", countryTerm);
		}
		if (filters.location) {
			// search by location_search array for flexible matching
			query = query.contains("location_search", [filters.location.toLowerCase()]);
			countQuery = countQuery.contains("location_search", [filters.location.toLowerCase()]);
		}
		if (filters.business_type) {
			const businessTypeTerm = `%${filters.business_type.toLowerCase()}%`;
			query = query.ilike("business_type", businessTypeTerm);
			countQuery = countQuery.ilike("business_type", businessTypeTerm);
		}

		// Apply pagination and ordering
		query = query
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

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
				scrap_info:
					typeof lead.scrap_info === "string"
						? JSON.parse(lead.scrap_info)
						: (lead.scrap_info as LeadScrapInfo | null),
			})),
			totalCount,
			currentPage: page,
			totalPages,
			itemsPerPage: limit,
		};
	}

	async getLeads(filters?: LeadFilters): Promise<Lead[]> {
		const supabase = await this.getSupabaseClient();

		let query = supabase.from("leads").select("*");

		query = query.eq("flagged", false);

		if (filters?.status) {
			query = query.eq("status", filters.status);
		}
		if (filters?.source) {
			query = query.eq("source", filters.source);
		}
		if (filters?.verify_email_status) {
			query = query.eq("verify_email_status", filters.verify_email_status);
		}
		if (filters?.search) {
			const searchTerm = `%${filters.search.toLowerCase()}%`;
			query = query.or(
				`url.ilike.${searchTerm},source.ilike.${searchTerm},status.ilike.${searchTerm}`
			);
		}
		if (filters?.date_range) {
			query = query
				.gte("created_at", filters.date_range.start)
				.lte("created_at", filters.date_range.end);
		}
		// Location filters
		if (filters?.city) {
			const cityTerm = `%${filters.city.toLowerCase()}%`;
			query = query.ilike("city", cityTerm);
		}
		if (filters?.state) {
			const stateTerm = `%${filters.state.toUpperCase()}%`;
			query = query.ilike("state", stateTerm);
		}
		if (filters?.country) {
			const countryTerm = `%${filters.country.toLowerCase()}%`;
			query = query.ilike("country", countryTerm);
		}
		if (filters?.location) {
			const locationTerm = `%${filters.location.toLowerCase()}%`;
			query = query.ilike("location_full", locationTerm);
		}
		if (filters?.business_type) {
			const businessTypeTerm = `%${filters.business_type.toLowerCase()}%`;
			query = query.ilike("business_type", businessTypeTerm);
		}
		const { data, error } = await query.order("created_at", {
			ascending: false,
		});

		if (error) {
			console.error("Error fetching leads:", error);
			throw new Error(`Failed to fetch leads: ${error.message}`);
		}
		return (data ?? []).map((lead) => ({
			...lead,
			scrap_info:
				typeof lead.scrap_info === "string"
					? JSON.parse(lead.scrap_info)
					: (lead.scrap_info as LeadScrapInfo | null),
		}));
	}

	async updateLead(data: UpdateLeadData) {
		const supabase = await this.getSupabaseClient();
		const { id, ...updateData } = data;

		const { data: updatedLead, error } = await supabase
			.from("leads")
			.update(updateData)
			.eq("id", id)
			.select("*")
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

		const activeSubscription =
			await subscriptionService.getUserActiveSubscription();
		if (!activeSubscription) {
			throw new Error(
				"No active subscription found. Please subscribe to a plan to add leads."
			);
		}

		if (
			activeSubscription.usage_limits &&
			typeof activeSubscription.usage_limits.current_leads === "number" &&
			typeof activeSubscription.usage_limits.max_leads === "number" &&
			activeSubscription.usage_limits.max_leads !== null &&
			activeSubscription.usage_limits.current_leads >=
			activeSubscription.usage_limits.max_leads
		) {
			throw new Error("Lead limit exceeded");
		}

		if (
			activeSubscription.usage_limits?.sources?.includes(data.source) === false
		) {
			throw new Error(
				"Selected source is not available in your current plan. Please choose a different source or upgrade your plan."
			);
		}

		// Track scraping operation
		const startTime = new Date();
		let scrapInfo: any;
		let scrapingSuccess = false;
		let scrapingError: string | undefined;

		try {
			scrapInfo = await scrapeService.scrape(data.url, data.source);
			if (scrapInfo?.error) {
				scrapingError = scrapInfo.error;
				const errorType = (scrapInfo as any)?.errorType || "scrape_failed";
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
			scraperLogsService
				.logScrapingOperation({
					source: data.source,
					url: data.url,
					startTime,
					endTime,
					success: scrapingSuccess,
					error: scrapingError,
				})
				.catch((err) => {
					console.error("Error logging scraping operation:", err);
				});
		}

		// Extract location data from scrapInfo (now async with geocoding and address)
		const locationData = await this.extractLocationData(data.url, data.source, scrapInfo);

		const { data: newLead, error } = await supabase
			.from("leads")
			.insert({
				url: normalizeUrl(data.url),
				source: data.source,
				scrap_info: scrapInfo as Json | undefined,
				user_id: userData?.user?.id,
				status: scrapInfo?.title ? "scraped" : "scrap_failed",
				city: locationData.city,
				state: locationData.state,
				country: locationData.country,
				location_full: locationData.location_full,
				business_type: locationData.business_type,
				location_search: locationData.location_search as any,
			})
			.select("*")
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

	/**
	 * Scrape multiple leads without saving them
	 */
	async scrapeLeads(data: CreateLeadData): Promise<Array<{
		url: string;
		title: string;
		desc: string;
		emails: string[];
		phone?: string;
		address?: string;
		website?: string;
		rating?: number;
		error?: string;
	}>> {
		const supabase = await this.getSupabaseClient();
		const { data: userData } = await supabase.auth.getUser();

		if (!userData.user) {
			throw new Error("User not found");
		}

		const activeSubscription =
			await subscriptionService.getUserActiveSubscription();
		if (!activeSubscription) {
			throw new Error(
				"No active subscription found. Please subscribe to a plan to add leads."
			);
		}

		if (
			activeSubscription.usage_limits?.sources?.includes(data.source) === false
		) {
			throw new Error(
				"Selected source is not available in your current plan. Please choose a different source or upgrade your plan."
			);
		}

		// Track scraping operation
		const startTime = new Date();
		let scrapingSuccess = false;
		let scrapingError: string | undefined;

		try {
			const scrapeResults = await scrapeService.scrapeMultiple(data.url, data.source, 20);

			if (scrapeResults.results.length === 0) {
				throw new Error("No results found");
			}

			// Check if first result has error
			const firstResult = scrapeResults.results[0];
			if (firstResult?.error) {
				scrapingError = firstResult.error;
				const errorType = (firstResult as any)?.errorType || "scrape_failed";
				const errorMessage = `[${errorType}] ${firstResult.error || "Failed to scrape URL"}`;
				throw new Error(errorMessage);
			}

			scrapingSuccess = true;

			// Format results for the frontend - generate unique URLs for each result
			return scrapeResults.results.map((result, index) => ({
				url: result.website || `${data.url}#${index}`, // Use website if available, otherwise add index
				title: result.title,
				desc: result.desc,
				emails: result.emails,
				phone: result.phone,
				address: result.address,
				website: result.website,
				rating: result.rating,
			}));
		} catch (error: any) {
			scrapingError = error.message || "Failed to scrape URL";
			throw error;
		} finally {
			// Log scraping operation regardless of success or failure
			const endTime = new Date();
			scraperLogsService
				.logScrapingOperation({
					source: data.source,
					url: data.url,
					startTime,
					endTime,
					success: scrapingSuccess,
					error: scrapingError,
				})
				.catch((err) => {
					console.error("Error logging scraping operation:", err);
				});
		}
	}

	/**
	 * Bulk create leads from scraped data
	 */
	async bulkCreateLeads(
		leads: Array<{ url: string; source: LeadSource; scrapInfo: any }>
	): Promise<any[]> {
		const supabase = await this.getSupabaseClient();
		const { data: userData } = await supabase.auth.getUser();

		if (!userData.user) {
			throw new Error("User not found");
		}

		const activeSubscription =
			await subscriptionService.getUserActiveSubscription();
		if (!activeSubscription) {
			throw new Error(
				"No active subscription found. Please subscribe to a plan to add leads."
			);
		}

		// Check if adding these leads would exceed the limit
		const currentLeads = activeSubscription.usage_limits?.current_leads || 0;
		const maxLeads = activeSubscription.usage_limits?.max_leads;
		const leadsToAdd = leads.length;

		if (
			typeof maxLeads === "number" &&
			maxLeads !== null &&
			currentLeads + leadsToAdd > maxLeads
		) {
			throw new Error(
				`Adding ${leadsToAdd} leads would exceed your limit. Current: ${currentLeads}, Max: ${maxLeads}`
			);
		}

		// Prepare lead data for bulk insert
		const leadsToInsert = await Promise.all(
			leads.map(async (lead) => {
				// Extract location data from scrapInfo
				const locationData = await this.extractLocationData(
					lead.url,
					lead.source,
					lead.scrapInfo
				);

				return {
					url: normalizeUrl(lead.url),
					source: lead.source,
					scrap_info: lead.scrapInfo as Json | undefined,
					user_id: userData.user.id,
					status: lead.scrapInfo?.title ? "scraped" : "scrap_failed",
					city: locationData.city,
					state: locationData.state,
					country: locationData.country,
					location_full: locationData.location_full,
					business_type: locationData.business_type,
					location_search: locationData.location_search as any,
				};
			})
		);

		const { data: createdLeads, error } = await supabase
			.from("leads")
			.insert(leadsToInsert)
			.select("*");

		if (error) {
			console.error("Error creating leads:", error);
			throw new Error(`Failed to create leads: ${error.message}`);
		}

		// Update usage limit
		usageLimitService.increCurrentLeadsByCount(leadsToAdd).catch((err: any) => {
			console.error("Error updating usage limit:", err);
		});

		return createdLeads || [];
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
			.eq("flagged", false);

		if (supabaseError) {
			console.error("Error fetching lead stats:", supabaseError);
			throw new Error(`Failed to fetch lead stats: ${supabaseError.message}`);
		}

		// Type assertion for Supabase result
		const typedLeads = (leads ?? []) as Array<
			Lead & { enrich_info: Lead["enrich_info"] | string }
		>;

		const total = typedLeads.length;
		const verified_email = typedLeads.filter(
			(l) => l.verify_email_status === "verified"
		).length;
		const enriched = typedLeads.filter((l) => l.status === "enriched").length;
		const errorCount = typedLeads.filter(
			(l) => l.status === "scrap_failed"
		).length;

		const score_70_plus = leadScoringService
			.scoreLeads(typedLeads)
			.filter((score) => {
				return typeof score === "number" && score >= 70;
			}).length;

		const score_90_plus = leadScoringService
			.scoreLeads(typedLeads)
			.filter((score) => {
				return typeof score === "number" && score >= 90;
			}).length;

		// Calculate breakdown by source
		const sourceMap: Record<string, number> = {};
		typedLeads.forEach((lead) => {
			if (lead.source) {
				sourceMap[lead.source] = (sourceMap[lead.source] || 0) + 1;
			}
		});
		const source_breakdown = Object.entries(sourceMap).map(
			([source, count]) => ({ source, count })
		);

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
		const { error } = await supabase.from("leads").insert([
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
					summary:
						"Creative Web Designs specializes in creating modern, branded Shopify websites for businesses in Auckland. They focus on developing sites that are easy to manage while being designed to drive conversions. Their expertise as Shopify specialists positions them to build scalable e-commerce solutions that can grow alongside their clients' businesses.",
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
					summary:
						"Astrid & Miyu is a London-based jewelry brand offering contemporary pieces designed to be stacked and styled together. Their collection includes necklaces, rings, and earrings that customers can curate to create personalized looks. The brand emphasizes modern, stylish designs that allow for individual expression through jewelry layering and combination.",
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
