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
