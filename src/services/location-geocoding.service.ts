/**
 * Location Geocoding Service
 * Uses Nominatim API (OpenStreetMap) - Free with rate limit of 1 request/second
 * Provides location normalization and validation
 */

export interface GeocodedLocation {
    city?: string;
    state?: string;
    state_code?: string;
    country?: string;
    country_code?: string;
    formatted: string;
    latitude?: number;
    longitude?: number;
    confidence: number; // 0-10 scale (converted from Nominatim importance)
}

interface NominatimResponse {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
        country_code?: string;
        county?: string;
        municipality?: string;
    };
    importance: number; // 0-1 scale
}

class LocationGeocodingService {
    private readonly baseUrl = "https://nominatim.openstreetmap.org/search";
    private readonly userAgent = "lead-core-ai/1.0 (contact: admin@lead-core-ai.com)";
    private readonly cache = new Map<string, GeocodedLocation>();
    private lastRequestTime = 0;
    private readonly minRequestInterval = 1000; // 1 second between requests

    /**
     * Rate limiting: ensure 1 second between requests
     */
    private async waitForRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Geocode a location string (e.g., "Austin, TX" or "Los Angeles")
     * Returns normalized location data with confidence score
     */
    async geocodeLocation(query: string): Promise<GeocodedLocation | null> {
        if (!query || query.trim().length === 0) {
            return null;
        }

        // Check cache first
        const cacheKey = query.toLowerCase().trim();
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            // Apply rate limiting
            await this.waitForRateLimit();

            const url = new URL(this.baseUrl);
            url.searchParams.set("q", query);
            url.searchParams.set("format", "json");
            url.searchParams.set("limit", "1");
            url.searchParams.set("addressdetails", "1");

            const response = await fetch(url.toString(), {
                headers: {
                    "User-Agent": this.userAgent,
                },
                signal: AbortSignal.timeout(10_000), // 10 seconds timeout
            });

            if (!response.ok) {
                console.error(`Nominatim API error: ${response.status}`);
                return this.fallbackParsing(query);
            }

            const data: NominatimResponse[] = await response.json();

            if (!data || data.length === 0) {
                console.warn(`No geocoding results for: ${query}`);
                return this.fallbackParsing(query);
            }

            const result = data[0];
            const address = result.address;

            // Extract city (try multiple fields)
            const city = address.city || address.town || address.village || address.municipality || address.county;

            // Extract state code from state name if available
            const stateCode = this.getStateCode(address.state);

            // Convert Nominatim importance (0-1) to confidence score (0-10)
            const confidence = Math.round(result.importance * 10);

            const geocoded: GeocodedLocation = {
                city,
                state: address.state,
                state_code: stateCode,
                country: address.country,
                country_code: address.country_code?.toUpperCase(),
                formatted: result.display_name,
                latitude: Number.parseFloat(result.lat),
                longitude: Number.parseFloat(result.lon),
                confidence,
            };

            // Cache the result
            this.cache.set(cacheKey, geocoded);

            // Auto-cleanup old cache entries
            if (this.cache.size > 1000) {
                const firstKey = this.cache.keys().next().value;
                if (firstKey) {
                    this.cache.delete(firstKey);
                }
            }

            return geocoded;
        } catch (error) {
            console.error("Error geocoding location:", error);
            return this.fallbackParsing(query);
        }
    }

    /**
     * Extract state code from state name (US states only)
     */
    private getStateCode(stateName?: string): string | undefined {
        if (!stateName) {
            return;
        }

        const stateMap: Record<string, string> = {
            alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
            colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
            hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
            kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
            massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
            montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
            "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
            oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
            "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
            virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY"
        };

        const normalized = stateName.toLowerCase().trim();
        return stateMap[normalized] || (stateName.length === 2 ? stateName.toUpperCase() : undefined);
    }

    /**
     * Fallback parsing when API is unavailable or fails
     * Uses basic string parsing for common formats
     */
    private fallbackParsing(query: string): GeocodedLocation {
        const parts = query.split(",").map(p => p.trim());

        let city: string | undefined;
        let state: string | undefined;
        let country: string | undefined;

        if (parts.length === 1) {
            // Just city or state
            city = parts[0];
        } else if (parts.length === 2) {
            // "City, State" or "City, Country"
            city = parts[0];
            const second = parts[1];
            // If 2 letters, likely state code
            if (second.length === 2) {
                state = second.toUpperCase();
            } else {
                state = second;
            }
        } else if (parts.length >= 3) {
            // "City, State, Country"
            city = parts[0];
            state = parts[1];
            country = parts[2];
        }

        return {
            city,
            state,
            state_code: state,
            country,
            formatted: query,
            confidence: 1, // Low confidence for fallback
        };
    }

    /**
     * Batch geocode multiple locations (respects rate limits)
     * Processes one at a time to respect 1 request/second limit
     */
    async geocodeLocations(queries: string[]): Promise<Map<string, GeocodedLocation | null>> {
        const results = new Map<string, GeocodedLocation | null>();

        // Process sequentially to respect rate limit (1 req/sec)
        for (const query of queries) {
            const result = await this.geocodeLocation(query);
            results.set(query, result);
        }

        return results;
    }

    /**
     * Validate if a location string is real and properly formatted
     */
    async validateLocation(query: string): Promise<{
        valid: boolean;
        confidence: number;
        normalized?: GeocodedLocation;
        suggestion?: string;
    }> {
        const result = await this.geocodeLocation(query);

        if (!result) {
            return { valid: false, confidence: 0 };
        }

        // Consider valid if confidence >= 5 (out of 10)
        const valid = result.confidence >= 5;

        return {
            valid,
            confidence: result.confidence,
            normalized: result,
            suggestion: result.formatted,
        };
    }

    /**
     * Clear cache (useful for testing or memory management)
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// Export singleton instance
export const locationGeocodingService = new LocationGeocodingService();
