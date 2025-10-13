// Location parsing utilities for leads
// Extracts and normalizes location data from various sources

import { locationGeocodingService } from "@/services/location-geocoding.service";

export interface LocationData {
    city?: string;
    state?: string;
    country?: string;
    location_full?: string;
}

/**
 * Enhanced location parsing using geocoding service
 * Falls back to basic parsing if service unavailable
 */
export async function parseLocationWithGeocoding(location: string): Promise<LocationData> {
    if (!location) {
        return {};
    }

    try {
        const geocoded = await locationGeocodingService.geocodeLocation(location);

        if (!geocoded) {
            return parseLocationBasic(location);
        }

        return {
            city: geocoded.city,
            state: geocoded.state_code || geocoded.state,
            country: geocoded.country,
            location_full: geocoded.formatted,
        };
    } catch (error) {
        console.error("Error parsing location with geocoding:", error);
        return parseLocationBasic(location);
    }
}

/**
 * Basic location parsing without API calls
 * Used as fallback when geocoding service unavailable
 */
export function parseLocationBasic(location: string): LocationData {
    const parts = location.split(",").map(p => p.trim());

    let city: string | undefined;
    let state: string | undefined;
    let country: string | undefined;

    if (parts.length === 1) {
        city = normalizeCity(parts[0]);
    } else if (parts.length === 2) {
        city = normalizeCity(parts[0]);
        const second = parts[1];
        if (second.length === 2) {
            state = normalizeState(second);
        } else {
            state = normalizeState(second);
        }
    } else if (parts.length >= 3) {
        city = normalizeCity(parts[0]);
        state = normalizeState(parts[1]);
        country = normalizeCountry(parts[2]);
    }

    return {
        city,
        state,
        country,
        location_full: location,
    };
}

/**
 * Parse location from Google Places address
 * Example: "123 Main St, Austin, TX 78701, USA"
 */
export function parseGooglePlacesLocation(address?: string): LocationData {
    if (!address) {
        return {};
    }

    const parts = address.split(",").map((p) => p.trim());

    // Typical format: [street], [city], [state zip], [country]
    let city: string | undefined;
    let state: string | undefined;
    let country: string | undefined;

    if (parts.length >= 4) {
        // Full address
        city = parts.at(-3);
        const stateZip = parts.at(-2)?.split(" ");
        state = stateZip?.[0];
        country = parts.at(-1);
    } else if (parts.length === 3) {
        // [city], [state zip], [country]
        city = parts[0];
        const stateZip = parts[1].split(" ");
        state = stateZip[0];
        country = parts[2];
    } else if (parts.length === 2) {
        // [city], [state/country]
        city = parts[0];
        // Could be either state or country
        if (parts[1].length === 2) {
            state = parts[1];
        } else {
            country = parts[1];
        }
    }

    return {
        city: normalizeCity(city),
        state: normalizeState(state),
        country: normalizeCountry(country),
        location_full: address,
    };
}

/**
 * Parse location from NPI Registry address
 * Similar format to Google Places
 */
export function parseNPIRegistryLocation(address?: string): LocationData {
    return parseGooglePlacesLocation(address);
}

/**
 * Parse location from FMCSA address
 */
export function parseFMCSALocation(address?: string): LocationData {
    return parseGooglePlacesLocation(address);
}

/**
 * Parse location from URL parameters (for Google Places/NPI/FMCSA)
 * Examples:
 * - "google_places://search?keyword=dentist&location=Austin"
 * - "npi_registry://search?city=Austin&state=TX"
 */
export function parseLocationFromURL(url: string): LocationData {
    try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);

        const city = params.get("city") || undefined;
        const state = params.get("state") || undefined;
        const location = params.get("location") || undefined;

        // Parse location parameter if present
        if (location) {
            const locationParts = location.split(",").map((p) => p.trim());
            if (locationParts.length === 2) {
                // "Austin, TX" format
                return {
                    city: normalizeCity(locationParts[0]),
                    state: normalizeState(locationParts[1]),
                    location_full: location,
                };
            }
            if (locationParts.length === 1) {
                // Just city
                return {
                    city: normalizeCity(locationParts[0]),
                    location_full: location,
                };
            }
        }

        // Use individual parameters
        if (city || state) {
            const locationFull = [city, state].filter(Boolean).join(", ");
            return {
                city: normalizeCity(city),
                state: normalizeState(state),
                location_full: locationFull || undefined,
            };
        }

        return {};
    } catch {
        return {};
    }
}

/**
 * Normalize city name for consistent searching
 * Basic normalization - prefer using geocoding service for full accuracy
 */
export function normalizeCity(city?: string): string {
    if (!city) { return ""; }

    const normalized = city.trim();

    // Only handle most common abbreviations
    // For full normalization, use the geocoding service
    const cityAliases: Record<string, string> = {
        la: "Los Angeles",
        nyc: "New York",
        sf: "San Francisco",
        dc: "Washington",
    };

    const lowerCity = normalized.toLowerCase();
    return cityAliases[lowerCity] || normalized;
}

/**
 * Normalize state name for consistent searching
 * Returns state code (e.g., "TX" for "Texas")
 * Prefer using geocoding service for full accuracy
 */
export function normalizeState(state?: string): string {
    if (!state) { return ""; }

    const normalized = state.trim().toUpperCase();

    // US State abbreviations - kept for backward compatibility
    const stateAbbreviations: Record<string, string> = {
        AL: "Alabama",
        AK: "Alaska",
        AZ: "Arizona",
        AR: "Arkansas",
        CA: "California",
        CO: "Colorado",
        CT: "Connecticut",
        DE: "Delaware",
        FL: "Florida",
        GA: "Georgia",
        HI: "Hawaii",
        ID: "Idaho",
        IL: "Illinois",
        IN: "Indiana",
        IA: "Iowa",
        KS: "Kansas",
        KY: "Kentucky",
        LA: "Louisiana",
        ME: "Maine",
        MD: "Maryland",
        MA: "Massachusetts",
        MI: "Michigan",
        MN: "Minnesota",
        MS: "Mississippi",
        MO: "Missouri",
        MT: "Montana",
        NE: "Nebraska",
        NV: "Nevada",
        NH: "New Hampshire",
        NJ: "New Jersey",
        NM: "New Mexico",
        NY: "New York",
        NC: "North Carolina",
        ND: "North Dakota",
        OH: "Ohio",
        OK: "Oklahoma",
        OR: "Oregon",
        PA: "Pennsylvania",
        RI: "Rhode Island",
        SC: "South Carolina",
        SD: "South Dakota",
        TN: "Tennessee",
        TX: "Texas",
        UT: "Utah",
        VT: "Vermont",
        VA: "Virginia",
        WA: "Washington",
        WV: "West Virginia",
        WI: "Wisconsin",
        WY: "Wyoming",
    };

    // If it's a 2-letter code, return the abbreviation (already normalized)
    if (normalized.length === 2 && stateAbbreviations[normalized]) {
        return normalized;
    }

    // If it's a full state name, try to find the abbreviation
    const stateEntry = Object.entries(stateAbbreviations).find(
        ([, fullName]) => fullName.toLowerCase() === state.toLowerCase()
    );

    return stateEntry ? stateEntry[0] : normalized;
}

/**
 * Normalize country name
 */
export function normalizeCountry(country?: string): string {
    if (!country) { return ""; }

    const normalized = country.trim();

    // Country aliases
    const countryAliases: Record<string, string> = {
        usa: "United States",
        us: "United States",
        "united states of america": "United States",
        uk: "United Kingdom",
        "great britain": "United Kingdom",
    };

    const lowerCountry = normalized.toLowerCase();
    return countryAliases[lowerCountry] || normalized;
}

/**
 * Extract business type from various sources
 */
export function extractBusinessType(
    source: string,
    scrapInfo: any
): string | undefined {
    // Try to extract from title or description
    const text = `${scrapInfo?.title || ""} ${scrapInfo?.desc || ""}`.toLowerCase();

    // Common business type keywords
    const businessTypes: Record<string, string[]> = {
        clinic: ["clinic", "medical center", "health center"],
        dentist: ["dentist", "dental", "orthodontist"],
        doctor: ["doctor", "physician", "md", "healthcare provider"],
        plumber: ["plumber", "plumbing"],
        electrician: ["electrician", "electrical"],
        "trucking company": ["trucking", "carrier", "transportation", "logistics"],
        restaurant: ["restaurant", "cafe", "diner", "eatery"],
        retail: ["store", "shop", "retail"],
        "law firm": ["attorney", "lawyer", "law firm"],
        accountant: ["accountant", "accounting", "cpa"],
    };

    for (const [type, keywords] of Object.entries(businessTypes)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return type;
            }
        }
    }

    // Fallback to source-based business type
    if (source === "google_places" && scrapInfo?.business_type) {
        return scrapInfo.business_type;
    }
    if (source === "npi_registry") {
        return "healthcare provider";
    }
    if (source === "fmcsa") {
        return "trucking company";
    }

    return "";
}
