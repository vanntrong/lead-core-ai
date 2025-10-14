// Google Places API Service
// Handles searching and fetching business data from Google Places API

interface GooglePlacesSearchParams {
    keyword: string;
    location: string;
    radius?: number; // in meters, default 50000 (50km)
}

interface GooglePlaceDetails {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    business_status?: string;
    types?: string[];
}

interface GooglePlacesSearchResult {
    title: string;
    desc: string;
    emails: string[];
    phone?: string;
    address?: string;
    website?: string;
    rating?: number;
    place_id?: string;
}

interface GooglePlacesSearchMultipleResult {
    results: GooglePlacesSearchResult[];
    totalFound: number;
}

export class GooglePlacesService {
    private readonly apiKey: string;
    private readonly baseUrl = "https://maps.googleapis.com/maps/api";

    constructor() {
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY || "";
        if (!this.apiKey) {
            console.warn("GOOGLE_PLACES_API_KEY not configured");
        }
    }

    /**
     * Search for places using Text Search API - returns first result only (legacy)
     */
    async searchPlaces(
        params: GooglePlacesSearchParams
    ): Promise<GooglePlacesSearchResult> {
        const results = await this.searchPlacesMultiple(params);
        if (results.results.length === 0) {
            throw new Error(`No results found for "${params.keyword}" in ${params.location}`);
        }
        return results.results[0];
    }

    /**
     * Search for places using Text Search API - returns multiple results
     */
    async searchPlacesMultiple(
        params: GooglePlacesSearchParams,
        maxResults = 20
    ): Promise<GooglePlacesSearchMultipleResult> {
        if (!this.apiKey) {
            throw new Error("Google Places API key not configured");
        }

        const { keyword, location, radius = 50_000 } = params;
        const query = `${keyword} in ${location}`;

        // Step 1: Search for places
        const searchUrl = `${this.baseUrl}/place/textsearch/json?query=${encodeURIComponent(query)}&radius=${radius}&key=${this.apiKey}`;

        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            throw new Error(`Google Places API error: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
            throw new Error(
                `Google Places API error: ${searchData.status} - ${searchData.error_message || "Unknown error"}`
            );
        }

        if (!searchData.results || searchData.results.length === 0) {
            return { results: [], totalFound: 0 };
        }

        // Get up to maxResults places
        const placesToFetch = searchData.results.slice(0, maxResults);
        const totalFound = searchData.results.length;

        // Step 2: Get place details for each result
        const detailsPromises = placesToFetch.map((place: any) =>
            this.getPlaceDetails(place.place_id).catch((error) => {
                console.error(`Error fetching details for place ${place.place_id}:`, error);
                return null;
            })
        );

        const allDetails = await Promise.all(detailsPromises);
        const validDetails = allDetails.filter((d) => d !== null) as GooglePlaceDetails[];

        // Step 3: Build results array
        const results: GooglePlacesSearchResult[] = [];

        for (const details of validDetails) {
            // Extract email from website (if available)
            let emails: string[] = [];
            if (details.website) {
                try {
                    emails = await this.extractEmailsFromWebsite(details.website);
                } catch (error) {
                    console.error("Error extracting emails from website:", error);
                }
            }

            // Build description from place data
            const descParts: string[] = [];
            if (details.formatted_address) {
                descParts.push(`Located at ${details.formatted_address}`);
            }
            if (details.rating && details.user_ratings_total) {
                descParts.push(
                    `Rated ${details.rating}/5 from ${details.user_ratings_total} reviews`
                );
            }
            if (details.types && details.types.length > 0) {
                const businessType = details.types[0].replace(/_/g, " ");
                descParts.push(`Business type: ${businessType}`);
            }

            results.push({
                title: details.name,
                desc: `${descParts.join(". ")}.`,
                emails,
                phone: details.formatted_phone_number,
                address: details.formatted_address,
                website: details.website,
                rating: details.rating,
                place_id: details.place_id,
            });
        }

        return { results, totalFound };
    }

    /**
     * Get detailed information about a place
     */
    private async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails> {
        const fields = [
            "place_id",
            "name",
            "formatted_address",
            "formatted_phone_number",
            "website",
            "rating",
            "user_ratings_total",
            "business_status",
            "types",
        ].join(",");

        const detailsUrl = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;

        const response = await fetch(detailsUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch place details: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== "OK") {
            throw new Error(`Place details API error: ${data.status}`);
        }

        return data.result;
    }

    /**
     * Extract emails from a website URL
     */
    private async extractEmailsFromWebsite(
        websiteUrl: string
    ): Promise<string[]> {
        try {
            // Basic email extraction from website
            const response = await fetch(websiteUrl, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
                signal: AbortSignal.timeout(10_000), // 10 seconds timeout
            });

            if (!response.ok) {
                return [];
            }

            const html = await response.text();

            // Extract emails using regex
            const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
            const matches = html.match(emailRegex) || [];

            // Filter out common false positives and image files
            const validEmails = matches.filter(
                (email) =>
                    /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(email) &&
                    !/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(email)
            );

            return Array.from(new Set(validEmails));
        } catch (error) {
            console.error("Error extracting emails:", error);
            return [];
        }
    }

    /**
     * Format search parameters for URL (used as lead URL)
     */
    static formatSearchUrl(params: GooglePlacesSearchParams): string {
        const query = new URLSearchParams({
            keyword: params.keyword,
            location: params.location,
        });
        return `google_places://search?${query.toString()}`;
    }
}

export const googlePlacesService = new GooglePlacesService();
