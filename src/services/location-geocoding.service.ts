/**
 * Location Geocoding Service
 * Uses Geoapify Forward Geocoding API - 3000 requests/day, up to 5 requests/second
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
    confidence: number; // 0-10 scale (converted from Geoapify confidence)
}

interface GeoapifyResponse {
    results: Array<{
        formatted: string;
        lat: number;
        lon: number;
        city?: string;
        state?: string;
        country?: string;
        country_code?: string;
        county?: string;
        municipality?: string;
        suburb?: string;
        district?: string;
        rank: {
            confidence: number; // 0-1 scale
            confidence_city_level?: number;
            confidence_street_level?: number;
            match_type?: string;
        };
    }>;
}

class LocationGeocodingService {
    private readonly baseUrl = "https://api.geoapify.com/v1/geocode/search";
    private readonly apiKey: string;
    private readonly cache = new Map<string, GeocodedLocation>();
    private lastRequestTime = 0;
    private readonly minRequestInterval = 200; // 5 requests per second = 200ms between requests
    private requestCount = 0;
    private requestResetTime = Date.now() + 86_400_000; // Reset after 24 hours

    constructor() {
        // Get API key from environment variables
        this.apiKey = process.env.GEOAPIFY_API_KEY || "";
        if (!this.apiKey) {
            console.warn("⚠️ GEOAPIFY_API_KEY not set in environment variables. Geocoding will use fallback parsing.");
        }
    }

    /**
     * Rate limiting: ensure 5 requests per second and track daily limit (3000/day)
     */
    private async waitForRateLimit(): Promise<void> {
        // Reset daily counter if 24 hours have passed
        const now = Date.now();
        if (now >= this.requestResetTime) {
            this.requestCount = 0;
            this.requestResetTime = now + 86_400_000; // Next 24 hours
        }

        // Check daily limit
        if (this.requestCount >= 3000) {
            const hoursUntilReset = Math.ceil((this.requestResetTime - now) / 3_600_000);
            throw new Error(`Daily Geoapify API limit (3000 requests) reached. Resets in ${hoursUntilReset} hours.`);
        }

        // Rate limiting: 5 requests per second = 200ms between requests
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
        this.requestCount++;
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
            console.log(`📍 Cache hit for: ${query}`);
            return cached;
        }

        // If no API key, use fallback parsing immediately
        if (!this.apiKey) {
            console.warn(`⚠️ No API key - using fallback parsing for: ${query}`);
            return this.fallbackParsing(query);
        }

        try {
            // Apply rate limiting
            await this.waitForRateLimit();

            const url = new URL(this.baseUrl);
            url.searchParams.set("text", query);
            url.searchParams.set("apiKey", this.apiKey);
            url.searchParams.set("format", "json");
            url.searchParams.set("limit", "1");

            console.log(`🌍 Geocoding: ${query} (${this.requestCount}/3000 requests today)`);

            const response = await fetch(url.toString(), {
                signal: AbortSignal.timeout(20_000), // 20 seconds timeout
            });

            if (!response.ok) {
                console.error(`Geoapify API error: ${response.status} - ${response.statusText}`);
                return this.fallbackParsing(query);
            }

            const data: GeoapifyResponse = await response.json();

            if (!data?.results || data.results.length === 0) {
                console.warn(`No geocoding results for: ${query}`);
                return this.fallbackParsing(query);
            }

            const result = data.results[0];

            // Extract city (try multiple fields)
            const city = result.city || result.municipality || result.county || result.suburb || result.district;

            // Extract state code from state name if available
            const stateCode = this.getStateCode(result.state);

            // Convert Geoapify confidence (0-1) to confidence score (0-10)
            const confidence = Math.round((result.rank?.confidence || 0) * 10);

            const geocoded: GeocodedLocation = {
                city,
                state: result.state,
                state_code: stateCode,
                country: result.country,
                country_code: result.country_code?.toUpperCase(),
                formatted: result.formatted,
                latitude: result.lat,
                longitude: result.lon,
                confidence,
            };

            // Cache the result
            this.cache.set(cacheKey, geocoded);

            // Auto-cleanup old cache entries (keep max 1000 cached locations)
            if (this.cache.size > 1000) {
                const firstKey = this.cache.keys().next().value;
                if (firstKey) {
                    this.cache.delete(firstKey);
                }
            }

            console.log(`✅ Geocoded: ${query} → ${geocoded.formatted} (confidence: ${confidence}/10)`);

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
     * Get current API usage statistics
     */
    getUsageStats(): {
        requestsToday: number;
        dailyLimit: number;
        remainingRequests: number;
        cacheSize: number;
        resetsIn: string;
    } {
        const now = Date.now();
        const hoursUntilReset = Math.ceil((this.requestResetTime - now) / 3_600_000);
        const minutesUntilReset = Math.ceil((this.requestResetTime - now) / 60_000);

        return {
            requestsToday: this.requestCount,
            dailyLimit: 3000,
            remainingRequests: Math.max(0, 3000 - this.requestCount),
            cacheSize: this.cache.size,
            resetsIn: hoursUntilReset > 0 ? `${hoursUntilReset}h` : `${minutesUntilReset}m`,
        };
    }

    /**
     * Check if we can make more requests today
     */
    canMakeRequest(): boolean {
        // Reset counter if needed
        const now = Date.now();
        if (now >= this.requestResetTime) {
            this.requestCount = 0;
            this.requestResetTime = now + 86_400_000;
        }

        return this.requestCount < 3000;
    }

    /**
     * Clear cache (useful for testing or memory management)
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Reset usage counters (useful for testing)
     */
    resetUsageCounters(): void {
        this.requestCount = 0;
        this.requestResetTime = Date.now() + 86_400_000;
    }
}

// Export singleton instance
export const locationGeocodingService = new LocationGeocodingService();
