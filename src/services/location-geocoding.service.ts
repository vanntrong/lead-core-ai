/**
 * Location Geocoding Service
 * Uses OpenCage Geocoding API (Free tier: 2,500 requests/day)
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
    confidence: number; // 0-10 scale from OpenCage
}

interface OpenCageResponse {
    results: Array<{
        components: {
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            state_code?: string;
            country?: string;
            country_code?: string;
            county?: string;
        };
        formatted: string;
        geometry: {
            lat: number;
            lng: number;
        };
        confidence: number;
    }>;
    status: {
        code: number;
        message: string;
    };
    rate: {
        limit: number;
        remaining: number;
        reset: number;
    };
}

class LocationGeocodingService {
    private readonly baseUrl = "https://api.opencagedata.com/geocode/v1/json";
    private readonly apiKey: string;
    private readonly cache = new Map<string, GeocodedLocation>();

    constructor() {
        this.apiKey = process.env.OPENCAGE_API_KEY || "";
        if (!this.apiKey) {
            console.warn("OPENCAGE_API_KEY not configured - location geocoding will be limited");
        }
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

        // If no API key, return basic parsing
        if (!this.apiKey) {
            return this.fallbackParsing(query);
        }

        try {
            const url = new URL(this.baseUrl);
            url.searchParams.set("q", query);
            url.searchParams.set("key", this.apiKey);
            url.searchParams.set("limit", "1");
            url.searchParams.set("no_annotations", "1");
            url.searchParams.set("language", "en");

            const response = await fetch(url.toString());

            if (!response.ok) {
                console.error(`OpenCage API error: ${response.status}`);
                return this.fallbackParsing(query);
            }

            const data: OpenCageResponse = await response.json();

            // Log rate limit info for monitoring
            if (data.rate) {
                console.log(`OpenCage rate limit: ${data.rate.remaining}/${data.rate.limit} remaining`);
            }

            if (data.results.length === 0) {
                console.warn(`No geocoding results for: ${query}`);
                return this.fallbackParsing(query);
            }

            const result = data.results[0];
            const components = result.components;

            // Extract city (try multiple fields)
            const city = components.city || components.town || components.village || components.county;

            const geocoded: GeocodedLocation = {
                city,
                state: components.state,
                state_code: components.state_code,
                country: components.country,
                country_code: components.country_code,
                formatted: result.formatted,
                latitude: result.geometry.lat,
                longitude: result.geometry.lng,
                confidence: result.confidence,
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
     */
    async geocodeLocations(queries: string[]): Promise<Map<string, GeocodedLocation | null>> {
        const results = new Map<string, GeocodedLocation | null>();

        // Process in small batches to avoid rate limiting
        const batchSize = 10;
        const delay = 100; // 100ms between requests

        for (let i = 0; i < queries.length; i += batchSize) {
            const batch = queries.slice(i, i + batchSize);

            const batchResults = await Promise.all(
                batch.map(async (query) => {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return {
                        query,
                        result: await this.geocodeLocation(query),
                    };
                })
            );

            for (const { query, result } of batchResults) {
                results.set(query, result);
            }
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
