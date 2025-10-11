import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const CENT_IN_DOLLAR = 100;
export function toMajorUnit(priceInCents: number) {
	return priceInCents / CENT_IN_DOLLAR;
}

export function toMinorUnit(priceInDollars: number) {
	return Math.round(priceInDollars * CENT_IN_DOLLAR);
}

export function normalizeUrl(url: string): string {
	return url.replace(/\/$/, "");
}

/**
 * Format a URL for display in the UI
 * For new sources (google_places, npi_registry, fmcsa), parse JSON and format nicely
 * For old sources, return the URL as-is
 */
export function formatUrlForDisplay(url: string, source?: string): {
	displayUrl: string;
	actualUrl: string | null;
} {
	// Check if this is a JSON string (for new sources)
	if (source && ["google_places", "npi_registry", "fmcsa"].includes(source)) {
		try {
			const params = JSON.parse(url);
			let displayUrl = "";

			if (source === "google_places") {
				displayUrl = params.keyword
					? `${params.keyword}${params.location ? ` in ${params.location}` : ""}`
					: "Google Places Search";
			} else if (source === "npi_registry") {
				const parts: string[] = [];
				if (params.provider) {
					parts.push(params.provider);
				}
				if (params.taxonomy) {
					parts.push(params.taxonomy);
				}
				if (params.location) {
					parts.push(`in ${params.location}`);
				}
				displayUrl = parts.length > 0 ? parts.join(" - ") : "NPI Registry Search";
			} else if (source === "fmcsa") {
				const parts: string[] = [];
				if (params.company) {
					parts.push(params.company);
				}
				if (params.dot) {
					parts.push(`DOT: ${params.dot}`);
				}
				if (params.mc) {
					parts.push(`MC: ${params.mc}`);
				}
				displayUrl = parts.length > 0 ? parts.join(" - ") : "FMCSA Search";
			}

			return { displayUrl, actualUrl: null }; // No clickable URL for these sources
		} catch {
			// If JSON parsing fails, fall back to displaying the raw string
			return { displayUrl: url, actualUrl: null };
		}
	}

	// For old sources with regular URLs, return the URL as-is
	return { displayUrl: url, actualUrl: url };
}
