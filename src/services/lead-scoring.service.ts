// lead-scoring.service.ts
import type { Lead } from "../types/lead";
import weights from "../config/lead-score.weights.json" with { type: "json" };

export interface LeadScoreWeights {
	verified_email: number;
	b2b_flag: number;
	tech_signals: number;
	enrichment_quality: number;
	[key: string]: number;
}

export class LeadScoringService {
	private readonly weights: LeadScoreWeights;

	constructor(weights: LeadScoreWeights) {
		this.weights = weights;
	}

	scoreLead(lead: Lead): number {
		let score = 0;
		// Verified email
		if (lead.verify_email_status === "verified") {
			score += this.weights.verified_email;
		}
		// Tech signals (example: presence of tech stack info)
		if (lead.scrap_info?.title || lead.scrap_info?.desc) {
			score += this.weights.tech_signals;
		}
		// Enrichment quality (example: summary or enrichment score)
		if (lead.enrich_info) {
			score += this.weights.enrichment_quality;
		}
		// Add more rules as needed
		return score;
	}

	scoreLeads(leads: Lead[]): number[] {
		return leads.map((lead) => this.scoreLead(lead));
	}
}

// Singleton instance using config file
export const leadScoringService = new LeadScoringService(weights);
