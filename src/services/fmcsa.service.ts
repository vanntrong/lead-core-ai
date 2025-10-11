// FMCSA (Federal Motor Carrier Safety Administration) Service
// Handles searching the FMCSA SAFER database for trucking companies

interface FMCSASearchParams {
    company_name?: string;
    dot_number?: string;
    mc_number?: string;
    city?: string;
    state?: string;
}

interface FMCSACompany {
    legalName?: string;
    dbaName?: string;
    dotNumber?: string;
    mcNumber?: string;
    phyStreet?: string;
    phyCity?: string;
    phyState?: string;
    phyZipcode?: string;
    phyCountry?: string;
    telephone?: string;
    emailAddress?: string;
    entityType?: string;
    operatingStatus?: string;
    totalDrivers?: number;
    totalPowerUnits?: number;
    carrierOperation?: string;
    safetyRating?: string;
    safetyRatingDate?: string;
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

export class FMCSAService {
    private readonly baseUrl = "https://mobile.fmcsa.dot.gov/qc/services/carriers";

    /**
     * Search FMCSA database
     * Note: FMCSA API requires at least DOT number or MC number for reliable results
     */
    async searchCarrier(params: FMCSASearchParams): Promise<FMCSASearchResult> {
        let searchUrl = "";

        // Priority: DOT Number > MC Number > Company Name
        if (params.dot_number) {
            searchUrl = `${this.baseUrl}/${params.dot_number}?webKey=FMCSA_API_KEY`;
        } else if (params.mc_number) {
            // Convert MC number to DOT number via docket search
            searchUrl = `${this.baseUrl}/docket-number/${params.mc_number}?webKey=FMCSA_API_KEY`;
        } else if (params.company_name) {
            // Name search is less reliable, but we'll try web scraping as fallback
            return this.searchByName(params);
        } else {
            throw new Error("Please provide DOT number, MC number, or company name");
        }

        try {
            const response = await fetch(searchUrl, {
                headers: {
                    Accept: "application/json",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
                signal: AbortSignal.timeout(15_000), // 15 seconds timeout
            });

            if (!response.ok) {
                // If API fails, try web scraping
                if (params.company_name) {
                    return this.searchByName(params);
                }
                throw new Error(`FMCSA API error: ${response.status}`);
            }

            const data = await response.json();

            if (!(data?.content)) {
                throw new Error("No carrier found with the provided information");
            }

            return this.formatCarrierData(data.content);
        } catch (error: any) {
            if (error.name === "TimeoutError") {
                throw new Error("Request timed out. Please try again.");
            }
            // Try fallback search by name if we have it
            if (params.company_name) {
                return this.searchByName(params);
            }
            throw error;
        }
    }

    /**
     * Search by company name using FMCSA website scraping
     * This is a fallback when API search is not available
     */
    private async searchByName(
        params: FMCSASearchParams
    ): Promise<FMCSASearchResult> {
        const { company_name, city, state } = params;

        if (!company_name) {
            throw new Error("Company name is required for name-based search");
        }

        // Build search URL for FMCSA SAFER website
        const searchParams = new URLSearchParams({
            searchtype: "ANY",
            query_type: "queryCarrierSnapshot",
            query_param: "NAME",
            query_string: company_name,
        });

        if (state) {
            searchParams.append("query_state", state);
        }

        const searchUrl = `https://safer.fmcsa.dot.gov/query.asp?${searchParams.toString()}`;

        try {
            const response = await fetch(searchUrl, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
                signal: AbortSignal.timeout(20_000), // 20 seconds timeout
            });

            if (!response.ok) {
                throw new Error(
                    "Unable to search FMCSA database. Please try with DOT number or MC number."
                );
            }

            const html = await response.text();

            // Parse HTML to extract carrier information
            const carrierData = this.parseCarrierHTML(html, company_name);

            if (!carrierData) {
                throw new Error(`No carrier found with name: ${company_name}`);
            }

            return carrierData;
        } catch (error) {
            throw new Error(
                `FMCSA search failed: ${error instanceof Error ? error.message : "Unknown error"}`
            );
        }
    }

    /**
     * Parse HTML response from FMCSA website
     */
    private parseCarrierHTML(
        html: string,
        searchName: string
    ): FMCSASearchResult | null {
        // Basic HTML parsing for carrier information
        // This is a simplified version - in production, you'd use a proper HTML parser

        // Extract DOT number
        const dotMatch = html.match(/U\.S\. DOT Number:\s*<\/b>\s*(\d+)/i);
        const dotNumber = dotMatch ? dotMatch[1] : undefined;

        // Extract MC number
        const mcMatch = html.match(/MC\/MX\/FF Number:\s*<\/b>\s*(\d+)/i);
        const mcNumber = mcMatch ? mcMatch[1] : undefined;

        // Extract company name
        const nameMatch = html.match(/Legal Name:\s*<\/b>\s*([^<]+)/i);
        const companyName = nameMatch ? nameMatch[1].trim() : searchName;

        // Extract address
        const addressMatch = html.match(
            /Physical Address:\s*<\/b>\s*([^<]+(?:<br[^>]*>[^<]+)*)/i
        );
        let addressString = "";
        if (addressMatch) {
            addressString = addressMatch[1].replace(/<br[^>]*>/gi, ", ").trim();
        }

        // Extract phone
        const phoneMatch = html.match(/Phone:\s*<\/b>\s*([^<]+)/i);
        const phone = phoneMatch ? phoneMatch[1].trim() : undefined;

        // Extract safety rating
        const safetyMatch = html.match(/Safety Rating:\s*<\/b>\s*([^<]+)/i);
        const safetyRating = safetyMatch ? safetyMatch[1].trim() : undefined;

        // Extract fleet size
        const driversMatch = html.match(/Total Drivers:\s*<\/b>\s*(\d+)/i);
        const totalDrivers = driversMatch
            ? Number.parseInt(driversMatch[1], 10)
            : undefined;

        const vehiclesMatch = html.match(/Total Power Units:\s*<\/b>\s*(\d+)/i);
        const totalPowerUnits = vehiclesMatch
            ? Number.parseInt(vehiclesMatch[1], 10)
            : undefined;

        if (!(dotNumber || mcNumber)) {
            return null;
        }

        // Build description
        const descParts: string[] = [];
        if (dotNumber) { descParts.push(`DOT #${dotNumber}`); }
        if (mcNumber) { descParts.push(`MC #${mcNumber}`); }
        if (addressString) { descParts.push(`Located at ${addressString}`); }
        if (safetyRating) { descParts.push(`Safety Rating: ${safetyRating}`); }
        if (totalDrivers) { descParts.push(`${totalDrivers} drivers`); }
        if (totalPowerUnits) { descParts.push(`${totalPowerUnits} vehicles`); }

        return {
            title: companyName,
            desc: `${descParts.join(". ")}.`,
            emails: [], // Extract from website if available
            phone,
            address: addressString,
            dot_number: dotNumber,
            mc_number: mcNumber,
            safety_rating: safetyRating,
            total_drivers: totalDrivers,
            total_power_units: totalPowerUnits,
        };
    }

    /**
     * Format carrier data from API response
     */
    private formatCarrierData(carrier: FMCSACompany): FMCSASearchResult {
        const companyName =
            carrier.legalName || carrier.dbaName || "Unknown Carrier";

        // Build address string
        const addressParts = [
            carrier.phyStreet,
            carrier.phyCity,
            carrier.phyState,
            carrier.phyZipcode,
        ].filter(Boolean);
        const addressString = addressParts.join(", ");

        // Build description
        const descParts: string[] = [];
        if (carrier.dotNumber) { descParts.push(`DOT #${carrier.dotNumber}`); }
        if (carrier.mcNumber) { descParts.push(`MC #${carrier.mcNumber}`); }
        if (carrier.operatingStatus) {
            descParts.push(`Status: ${carrier.operatingStatus}`);
        }
        if (addressString) { descParts.push(`Located at ${addressString}`); }
        if (carrier.safetyRating) {
            descParts.push(`Safety Rating: ${carrier.safetyRating}`);
        }
        if (carrier.totalDrivers) { descParts.push(`${carrier.totalDrivers} drivers`); }
        if (carrier.totalPowerUnits) {
            descParts.push(`${carrier.totalPowerUnits} vehicles`);
        }

        const emails: string[] = [];
        if (carrier.emailAddress) {
            emails.push(carrier.emailAddress);
        }

        return {
            title: companyName,
            desc: `${descParts.join(". ")}.`,
            emails,
            phone: carrier.telephone,
            address: addressString,
            dot_number: carrier.dotNumber,
            mc_number: carrier.mcNumber,
            safety_rating: carrier.safetyRating,
            total_drivers: carrier.totalDrivers,
            total_power_units: carrier.totalPowerUnits,
        };
    }

    /**
     * Format search parameters for URL (used as lead URL)
     */
    static formatSearchUrl(params: FMCSASearchParams): string {
        const query = new URLSearchParams();
        if (params.company_name) { query.append("name", params.company_name); }
        if (params.dot_number) { query.append("dot", params.dot_number); }
        if (params.mc_number) { query.append("mc", params.mc_number); }
        if (params.city) { query.append("city", params.city); }
        if (params.state) { query.append("state", params.state); }
        return `fmcsa://search?${query.toString()}`;
    }
}

export const fmcsaService = new FMCSAService();
