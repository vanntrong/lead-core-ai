// NPI Registry API Service
// Handles searching the NPPES NPI Registry for healthcare providers

interface NPISearchParams {
    provider_name?: string;
    first_name?: string;
    last_name?: string;
    taxonomy_description?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    limit?: number;
}

interface NPIResult {
    number: string; // NPI number
    basic: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        credential?: string;
        sole_proprietor?: string;
        gender?: string;
        enumeration_date?: string;
        last_updated?: string;
        status?: string;
        name?: string; // Organization name
        organization_name?: string;
    };
    taxonomies?: Array<{
        code: string;
        taxonomy_group?: string;
        desc?: string;
        state?: string;
        license?: string;
        primary?: boolean;
    }>;
    addresses?: Array<{
        country_code?: string;
        country_name?: string;
        address_purpose?: string;
        address_type?: string;
        address_1?: string;
        address_2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        telephone_number?: string;
        fax_number?: string;
    }>;
    other_names?: Array<{
        type?: string;
        code?: string;
        credential?: string;
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        prefix?: string;
        suffix?: string;
    }>;
}

export interface NPISearchResult {
    title: string;
    desc: string;
    emails: string[];
    phone?: string;
    address?: string;
    npi_number?: string;
    taxonomy?: string;
    credential?: string;
}

export interface NPISearchMultipleResult {
    results: NPISearchResult[];
    totalFound: number;
}

export class NPIRegistryService {
    private readonly baseUrl = "https://npiregistry.cms.hhs.gov/api";

    /**
     * Search NPI Registry - returns first result only (legacy)
     */
    async searchProvider(params: NPISearchParams): Promise<NPISearchResult> {
        const results = await this.searchProviderMultiple(params);
        if (results.results.length === 0) {
            throw new Error(
                "No healthcare providers found matching your search criteria"
            );
        }
        return results.results[0];
    }

    /**
     * Search NPI Registry - returns multiple results
     */
    async searchProviderMultiple(
        params: NPISearchParams,
        maxResults = 20
    ): Promise<NPISearchMultipleResult> {
        const queryParams = new URLSearchParams();

        // Add search parameters
        if (params.provider_name) {
            // Split full name into first and last if provided as single string
            const nameParts = params.provider_name.trim().split(" ");
            if (nameParts.length >= 2) {
                queryParams.append("first_name", nameParts[0]);
                queryParams.append("last_name", nameParts.slice(1).join(" "));
            }
        }

        if (params.first_name) { queryParams.append("first_name", params.first_name); }
        if (params.last_name) { queryParams.append("last_name", params.last_name); }
        if (params.taxonomy_description) {
            queryParams.append("taxonomy_description", params.taxonomy_description);
        }
        if (params.city) { queryParams.append("city", params.city); }
        if (params.state) { queryParams.append("state", params.state); }
        if (params.postal_code) {
            queryParams.append("postal_code", params.postal_code);
        }

        queryParams.append("limit", String(Math.min(params.limit || 200, 200))); // NPI API max is 200
        queryParams.append("version", "2.1");

        const url = `${this.baseUrl}/?${queryParams.toString()}`;

        try {
            const response = await fetch(url, {
                headers: {
                    Accept: "application/json",
                },
                signal: AbortSignal.timeout(15_000), // 15 seconds timeout
            });

            if (!response.ok) {
                throw new Error(`NPI Registry API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                return { results: [], totalFound: 0 };
            }

            const totalFound = data.result_count || data.results.length;
            const providersToProcess = data.results.slice(0, maxResults);

            // Format all results
            const formattedResults = providersToProcess.map((provider: NPIResult) =>
                this.formatProviderData(provider)
            );

            return { results: formattedResults, totalFound };
        } catch (error: any) {
            if (error.name === "TimeoutError") {
                throw new Error("Request timed out. Please try again.");
            }
            throw error;
        }
    }

    /**
     * Format provider data into our standard format
     */
    private formatProviderData(provider: NPIResult): NPISearchResult {
        const { basic, number, taxonomies, addresses } = provider;

        // Build provider name
        let providerName = "";
        if (basic.organization_name) {
            providerName = basic.organization_name;
        } else if (basic.first_name && basic.last_name) {
            providerName = `${basic.first_name} ${basic.last_name}`;
            if (basic.credential) {
                providerName += `, ${basic.credential}`;
            }
        } else if (basic.name) {
            providerName = basic.name;
        } else {
            providerName = `Provider #${number}`;
        }

        // Get primary taxonomy
        const primaryTaxonomy =
            taxonomies?.find((t) => t.primary) || taxonomies?.[0];
        const taxonomyDesc = primaryTaxonomy?.desc || "Healthcare Provider";

        // Get primary address
        const primaryAddress =
            addresses?.find((a) => a.address_purpose === "LOCATION") ||
            addresses?.[0];

        let addressString = "";
        if (primaryAddress) {
            const parts = [
                primaryAddress.address_1,
                primaryAddress.address_2,
                primaryAddress.city,
                primaryAddress.state,
                primaryAddress.postal_code,
            ].filter(Boolean);
            addressString = parts.join(", ");
        }

        // Build description
        const descParts: string[] = [];
        descParts.push(`NPI: ${number}`);
        descParts.push(`Specialty: ${taxonomyDesc}`);
        if (addressString) {
            descParts.push(`Location: ${addressString}`);
        }
        if (basic.status) {
            descParts.push(`Status: ${basic.status}`);
        }

        return {
            title: providerName,
            desc: `${descParts.join(". ")}.`,
            emails: [], // NPI Registry doesn't provide emails
            phone: primaryAddress?.telephone_number,
            address: addressString,
            npi_number: number,
            taxonomy: taxonomyDesc,
            credential: basic.credential,
        };
    }

    /**
     * Format search parameters for URL (used as lead URL)
     */
    static formatSearchUrl(params: NPISearchParams): string {
        const query = new URLSearchParams();
        if (params.provider_name) { query.append("name", params.provider_name); }
        if (params.first_name) { query.append("first_name", params.first_name); }
        if (params.last_name) { query.append("last_name", params.last_name); }
        if (params.taxonomy_description) {
            query.append("taxonomy", params.taxonomy_description);
        }
        if (params.city) { query.append("city", params.city); }
        if (params.state) { query.append("state", params.state); }
        return `npi_registry://search?${query.toString()}`;
    }
}

export const npiRegistryService = new NPIRegistryService();
