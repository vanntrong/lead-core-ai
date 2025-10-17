/**
 * Rewardful Service
 * Handles integration with Rewardful affiliate tracking platform
 * https://www.getrewardful.com/docs
 */

export interface RewardfulConfig {
	apiKey: string;
	companyId: string;
}

export interface RewardfulAffiliate {
	id: string;
	email: string;
	first_name?: string;
	last_name?: string;
	token: string; // Referral token
	state: "pending" | "approved" | "suspended";
	created_at: string;
	links: Array<{
		id: string;
		link: string;
		token: string;
		created_at: string;
		updated_at: string;
	}>;
}

export interface RewardfulReferral {
	id: string;
	affiliate_id: string;
	email?: string;
	state: "pending" | "converted" | "cancelled";
	conversion_id?: string;
	created_at: string;
	converted_at?: string;
}

export interface RewardfulCommission {
	id: string;
	affiliate_id: string;
	referral_id: string;
	amount_cents: number;
	state: "due" | "approved" | "paid" | "cancelled";
	created_at: string;
	paid_at?: string;
}

export interface RewardfulStats {
	total_referrals: number;
	successful_conversions: number;
	total_commission_cents: number;
	pending_commission_cents: number;
}

class RewardfulService {
	private readonly apiKey: string;
	private readonly baseUrl = "https://api.getrewardful.com/v1";

	constructor() {
		this.apiKey = process.env.REWARDFUL_API_KEY || "";
	}

	/**
	 * Check if Rewardful is configured
	 */
	isConfigured(): boolean {
		return !!this.apiKey && !!process.env.NEXT_PUBLIC_REWARDFUL_COMPANY_ID;
	}

	/**
	 * Safely check if configured (logs warning instead of throwing)
	 */
	private ensureConfigured(): boolean {
		if (!this.isConfigured()) {
			console.warn(
				"Rewardful is not configured. Set REWARDFUL_API_KEY and NEXT_PUBLIC_REWARDFUL_COMPANY_ID to enable affiliate features."
			);
			return false;
		}
		return true;
	}

	/**
	 * Get Rewardful company ID
	 */
	getCompanyId(): string {
		return process.env.NEXT_PUBLIC_REWARDFUL_COMPANY_ID || "";
	}

	/**
	 * Get headers for Rewardful API requests
	 */
	private getHeaders(): HeadersInit {
		return {
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
		};
	}

	/**
	 * Create a new affiliate
	 */
	async createAffiliate(data: {
		email: string;
		first_name?: string;
		last_name?: string;
	}): Promise<RewardfulAffiliate | null> {
		if (!this.ensureConfigured()) {
			return null;
		}

		try {
			const response = await fetch(`${this.baseUrl}/affiliates`, {
				method: "POST",
				headers: this.getHeaders(),
				body: JSON.stringify({
					...data,
					campaign_id: "704065bc-0621-4b2e-8060-79a382a52f65",
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Failed to create affiliate: ${error}`);
			}

			return response.json();
		} catch (error) {
			console.error("Error creating Rewardful affiliate:", error);
			return null;
		}
	}

	/**
	 * Get affiliate by ID
	 */
	async getAffiliate(affiliateId: string): Promise<RewardfulAffiliate | null> {
		if (!this.ensureConfigured()) {
			return null;
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/affiliates/${affiliateId}`,
				{
					headers: this.getHeaders(),
				}
			);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Failed to get affiliate: ${error}`);
			}

			return response.json();
		} catch (error) {
			console.error("Error getting Rewardful affiliate:", error);
			return null;
		}
	}

	/**
	 * Get affiliate by email
	 */
	async getAffiliateByEmail(email: string): Promise<RewardfulAffiliate | null> {
		if (!this.ensureConfigured()) {
			return null;
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/affiliates?email=${encodeURIComponent(email)}&expand=links`,
				{
					headers: this.getHeaders(),
				}
			);

			if (!response.ok) {
				return null;
			}

			const data = await response.json();
			return data.data?.[0] || null;
		} catch (error) {
			console.error("Error getting Rewardful affiliate by email:", error);
			return null;
		}
	}

	/**
	 * Get referrals for an affiliate
	 */
	async getAffiliateReferrals(
		affiliateId: string
	): Promise<RewardfulReferral[]> {
		if (!this.ensureConfigured()) {
			return [];
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/affiliates/${affiliateId}/referrals`,
				{
					headers: this.getHeaders(),
				}
			);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Failed to get referrals: ${error}`);
			}

			const data = await response.json();
			return data.data || [];
		} catch (error) {
			console.error("Error getting Rewardful referrals:", error);
			return [];
		}
	}

	/**
	 * Get commissions for an affiliate
	 */
	async getAffiliateCommissions(
		affiliateId: string
	): Promise<RewardfulCommission[]> {
		if (!this.ensureConfigured()) {
			return [];
		}

		try {
			const response = await fetch(
				`${this.baseUrl}/affiliates/${affiliateId}/commissions`,
				{
					headers: this.getHeaders(),
				}
			);

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Failed to get commissions: ${error}`);
			}

			const data = await response.json();
			return data.data || [];
		} catch (error) {
			console.error("Error getting Rewardful commissions:", error);
			return [];
		}
	}

	/**
	 * Calculate affiliate stats from referrals and commissions
	 */
	calculateStats(
		referrals: RewardfulReferral[],
		commissions: RewardfulCommission[]
	): RewardfulStats {
		const successful_conversions = referrals.filter(
			(r) => r.state === "converted"
		).length;

		const total_commission_cents = commissions
			.filter((c) => c.state === "paid")
			.reduce((sum, c) => sum + c.amount_cents, 0);

		const pending_commission_cents = commissions
			.filter((c) => c.state === "due" || c.state === "approved")
			.reduce((sum, c) => sum + c.amount_cents, 0);

		return {
			total_referrals: referrals.length,
			successful_conversions,
			total_commission_cents,
			pending_commission_cents,
		};
	}

	/**
	 * Generate referral link for an affiliate
	 */
	generateReferralLink(affiliateToken: string, path = ""): string {
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const url = new URL(path || "/pricing", baseUrl);
		url.searchParams.set("via", affiliateToken);
		return url.toString();
	}

	/**
	 * Format commission amount
	 */
	formatCommission(amountCents: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		}).format(amountCents / 100);
	}
}

export const rewardfulService = new RewardfulService();
