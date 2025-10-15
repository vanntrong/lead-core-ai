// FMCSA Database Service
// Handles querying FMCSA data from Supabase database
// This is the new service that replaces external API calls with database queries

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

interface FMCSASearchParams {
    company_name?: string;
    dot_number?: string;
    mc_number?: string;
    city?: string;
    state?: string;
}

interface FMCSACompanyDB {
    id: string;
    legal_name: string;
    dba_name: string | null;
    dot_number: string | null;
    mc_number: string | null;
    physical_address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    telephone: string | null;
    email_address: string | null;
    entity_type: string | null;
    operating_status: string | null;
    carrier_operation: string | null;
    total_drivers: number | null;
    total_power_units: number | null;
    safety_rating: string | null;
    safety_rating_date: string | null;
    created_at: string;
    updated_at: string;
}

interface FMCSASearchResult {
    title: string;
    desc: string;
    emails: string[];
    phone?: string;
    address?: string;
    dot_number?: string;
    mc_number?: string;
    safety_rating?: string;
    total_drivers?: number;
    total_power_units?: number;
}

interface FMCSASearchMultipleResult {
    results: FMCSASearchResult[];
    totalFound: number;
}

export class FMCSADatabaseService {
    private supabase: SupabaseClient | null = null;

    /**
     * Initialize with Supabase client (for server-side usage)
     */
    async initialize(): Promise<void> {
        if (!this.supabase) {
            this.supabase = await createClient();
        }
    }

    /**
     * Set a custom Supabase client (useful for testing or custom contexts)
     */
    setClient(client: SupabaseClient): void {
        this.supabase = client;
    }

    /**
     * Ensure Supabase client is initialized
     */
    private async ensureClient(): Promise<SupabaseClient> {
        if (!this.supabase) {
            await this.initialize();
        }
        if (!this.supabase) {
            throw new Error("Failed to initialize Supabase client");
        }
        return this.supabase;
    }

    /**
     * Search FMCSA database - returns first result only (legacy compatibility)
     */
    async searchCarrier(params: FMCSASearchParams): Promise<FMCSASearchResult> {
        const results = await this.searchCarrierMultiple(params, 1);
        if (results.results.length === 0) {
            throw new Error("No carrier found with the provided information");
        }
        return results.results[0];
    }

    /**
     * Search FMCSA database - returns multiple results
     */
    async searchCarrierMultiple(
        params: FMCSASearchParams,
        maxResults = 20
    ): Promise<FMCSASearchMultipleResult> {
        const client = await this.ensureClient();

        let query = client.from("fmcsa_companies").select("*");

        // Search by DOT number (exact match, highest priority)
        if (params.dot_number) {
            query = query.eq("dot_number", params.dot_number);
            const { data, error } = await query.limit(maxResults);

            if (error) {
                throw new Error(`Database query failed: ${error.message}`);
            }

            const results = (data || []).map((company) =>
                this.formatCompanyData(company)
            );
            return { results, totalFound: results.length };
        }

        // Search by MC number (exact match, high priority)
        if (params.mc_number) {
            query = query.eq("mc_number", params.mc_number);
            const { data, error } = await query.limit(maxResults);

            if (error) {
                throw new Error(`Database query failed: ${error.message}`);
            }

            const results = (data || []).map((company) =>
                this.formatCompanyData(company)
            );
            return { results, totalFound: results.length };
        }

        // Search by company name (fuzzy text search)
        if (params.company_name) {
            // Use full-text search for better matching
            const searchTerm = params.company_name.trim();

            // Try exact match first
            let { data, error } = await client
                .from("fmcsa_companies")
                .select("*")
                .or(`legal_name.ilike.%${searchTerm}%,dba_name.ilike.%${searchTerm}%`)
                .limit(maxResults);

            if (error) {
                throw new Error(`Database query failed: ${error.message}`);
            }

            // If no results with ilike, try full-text search
            if (!data || data.length === 0) {
                const tsQuery = searchTerm.split(/\s+/).join(" & ");
                const textSearchResult = await client
                    .from("fmcsa_companies")
                    .select("*")
                    .textSearch("legal_name", tsQuery, {
                        type: "websearch",
                        config: "english",
                    })
                    .limit(maxResults);

                if (textSearchResult.error) {
                    throw new Error(
                        `Database query failed: ${textSearchResult.error.message}`
                    );
                }

                data = textSearchResult.data;
            }

            // Filter by state if provided
            if (params.state && data) {
                data = data.filter(
                    (company) =>
                        company.state?.toLowerCase() === params.state?.toLowerCase()
                );
            }

            // Filter by city if provided
            if (params.city && data) {
                data = data.filter(
                    (company) =>
                        company.city?.toLowerCase() === params.city?.toLowerCase()
                );
            }

            const results = (data || []).map((company) =>
                this.formatCompanyData(company)
            );
            return { results, totalFound: results.length };
        }

        // If only location is provided, search by state/city
        if (params.state || params.city) {
            if (params.state) {
                query = query.eq("state", params.state.toUpperCase());
            }
            if (params.city) {
                query = query.ilike("city", `%${params.city}%`);
            }

            const { data, error } = await query.limit(maxResults);

            if (error) {
                throw new Error(`Database query failed: ${error.message}`);
            }

            const results = (data || []).map((company) =>
                this.formatCompanyData(company)
            );
            return { results, totalFound: results.length };
        }

        throw new Error(
            "Please provide DOT number, MC number, company name, or location"
        );
    }

    /**
     * Get a company by ID
     */
    async getCompanyById(id: string): Promise<FMCSASearchResult | null> {
        const client = await this.ensureClient();

        const { data, error } = await client
            .from("fmcsa_companies")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                // Not found
                return null;
            }
            throw new Error(`Database query failed: ${error.message}`);
        }

        return this.formatCompanyData(data);
    }

    /**
     * Get companies by state (for bulk operations)
     */
    async getCompaniesByState(
        state: string,
        limit = 100
    ): Promise<FMCSASearchResult[]> {
        const client = await this.ensureClient();

        const { data, error } = await client
            .from("fmcsa_companies")
            .select("*")
            .eq("state", state.toUpperCase())
            .limit(limit);

        if (error) {
            throw new Error(`Database query failed: ${error.message}`);
        }

        return (data || []).map((company) => this.formatCompanyData(company));
    }

    /**
     * Format database company data into standardized result format
     */
    private formatCompanyData(company: FMCSACompanyDB): FMCSASearchResult {
        const companyName =
            company.legal_name || company.dba_name || "Unknown Carrier";

        // Build address string
        const addressParts = [
            company.physical_address,
            company.city,
            company.state,
            company.zip_code,
        ].filter(Boolean);
        const addressString = addressParts.join(", ");

        // Build description
        const descParts: string[] = [];
        if (company.dot_number) {
            descParts.push(`DOT #${company.dot_number}`);
        }
        if (company.mc_number) {
            descParts.push(`MC #${company.mc_number}`);
        }
        if (company.operating_status) {
            descParts.push(`Status: ${company.operating_status}`);
        }
        if (addressString) {
            descParts.push(`Located at ${addressString}`);
        }
        if (company.safety_rating) {
            descParts.push(`Safety Rating: ${company.safety_rating}`);
        }
        if (company.total_drivers) {
            descParts.push(`${company.total_drivers} drivers`);
        }
        if (company.total_power_units) {
            descParts.push(`${company.total_power_units} vehicles`);
        }

        const emails: string[] = [];
        if (company.email_address) {
            emails.push(company.email_address);
        }

        return {
            title: companyName,
            desc: `${descParts.join(". ")}.`,
            emails,
            phone: company.telephone || undefined,
            address: addressString || undefined,
            dot_number: company.dot_number || undefined,
            mc_number: company.mc_number || undefined,
            safety_rating: company.safety_rating || undefined,
            total_drivers: company.total_drivers || undefined,
            total_power_units: company.total_power_units || undefined,
        };
    }

    /**
     * Format search parameters for URL (used as lead URL)
     */
    static formatSearchUrl(params: FMCSASearchParams): string {
        const query = new URLSearchParams();
        if (params.company_name) {
            query.append("name", params.company_name);
        }
        if (params.dot_number) {
            query.append("dot", params.dot_number);
        }
        if (params.mc_number) {
            query.append("mc", params.mc_number);
        }
        if (params.city) {
            query.append("city", params.city);
        }
        if (params.state) {
            query.append("state", params.state);
        }
        return `fmcsa://search?${query.toString()}`;
    }
}

// Export singleton instance
export const fmcsaDatabaseService = new FMCSADatabaseService();
