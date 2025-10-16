import type { Lead } from "@/types/lead";

/**
 * Utility functions to format lead data for display based on source type
 * Handles both traditional URL-based sources and API-based sources
 */

export interface LeadDisplayData {
    displayTitle: string;
    displaySubtitle: string;
    actualUrl: string | null;
    websiteUrl: string | null;
    identifier: string;
    searchParams?: Record<string, any>;
}

/**
 * Parse URL field which might be JSON for new sources
 */
function parseLeadUrl(url: string, source: string): {
    isJson: boolean;
    parsedData: any;
    originalUrl: string;
} {
    // For new sources, url might be JSON
    if (
        source === "google_places" ||
        source === "npi_registry" ||
        source === "fmcsa"
    ) {
        try {
            const parsedData = JSON.parse(url);
            return { isJson: true, parsedData, originalUrl: url };
        } catch {
            // If parsing fails, treat as regular URL
            return { isJson: false, parsedData: null, originalUrl: url };
        }
    }

    return { isJson: false, parsedData: null, originalUrl: url };
}

/**
 * Get formatted display data for a lead based on its source
 */
export function getLeadDisplayData(lead: Lead): LeadDisplayData {
    const { isJson, parsedData, originalUrl } = parseLeadUrl(
        lead.url,
        lead.source
    );

    // For Google Places
    if (lead.source === "google_places") {
        const title = lead.scrap_info?.title || "Unknown Business";
        const address = lead.scrap_info?.address || "";
        const website = lead.scrap_info?.website || null;
        const rating = lead.scrap_info?.rating
            ? ` (★ ${lead.scrap_info.rating})`
            : "";

        return {
            displayTitle: title + rating,
            displaySubtitle: address || "Location not available",
            actualUrl: website,
            websiteUrl: website,
            identifier: title,
            searchParams: isJson ? parsedData : undefined,
        };
    }

    // For NPI Registry
    if (lead.source === "npi_registry") {
        const entityName = lead.scrap_info?.title || "Unknown Provider";
        const address = lead.scrap_info?.address || "";
        const businessType = lead.scrap_info?.business_type
            ? ` - ${lead.scrap_info.business_type}`
            : "";

        return {
            displayTitle: entityName + businessType,
            displaySubtitle: address || "Location not available",
            actualUrl: lead.scrap_info?.website || null,
            websiteUrl: lead.scrap_info?.website || null,
            identifier: entityName,
            searchParams: isJson ? parsedData : undefined,
        };
    }

    // For FMCSA
    if (lead.source === "fmcsa") {
        const companyName = lead.scrap_info?.title || "Unknown Company";
        const address = lead.scrap_info?.address || "";
        const dotNumber = parsedData?.dot ? ` (DOT: ${parsedData.dot})` : "";

        return {
            displayTitle: companyName + dotNumber,
            displaySubtitle: address || "Location not available",
            actualUrl: lead.scrap_info?.website || null,
            websiteUrl: lead.scrap_info?.website || null,
            identifier: companyName,
            searchParams: isJson ? parsedData : undefined,
        };
    }

    // For traditional URL-based sources (shopify, etsy, g2, woocommerce)
    const title = lead.scrap_info?.title || "No title available";
    return {
        displayTitle: originalUrl,
        displaySubtitle: title,
        actualUrl: originalUrl,
        websiteUrl: originalUrl,
        identifier: originalUrl,
        searchParams: undefined,
    };
}

/**
 * Get a short display name for a lead (for tables/lists)
 */
export function getLeadShortName(lead: Lead): string {
    const displayData = getLeadDisplayData(lead);
    return displayData.identifier;
}

/**
 * Get the primary contact URL for a lead (email or website)
 */
export function getLeadContactUrl(lead: Lead): string | null {
    if (lead.scrap_info?.emails && lead.scrap_info.emails.length > 0) {
        return `mailto:${lead.scrap_info.emails[0]}`;
    }

    const displayData = getLeadDisplayData(lead);
    return displayData.websiteUrl;
}

/**
 * Format search parameters for display
 */
export function formatSearchParams(params: Record<string, any>): string {
    if (!params) {
        return "";
    }

    const formatted = Object.entries(params)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

    return formatted;
}

