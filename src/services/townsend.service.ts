import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/types/lead";

export interface TownSendExportResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export interface TownSendAudiencePayload {
    name: string;
    email: string;
    description?: string;
    tags?: string;
}

export class TownSendService {
    private readonly townsendHost: string;

    constructor() {
        this.townsendHost = process.env.TOWN_SEND_HOST || "";
    }

    /**
     * Get user's TownSend API key from database
     */
    async getUserApiKey(userId: string): Promise<string | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("user_api_keys")
            .select("api_key")
            .eq("user_id", userId)
            .eq("service_name", "townsend")
            .single();

        if (error || !data) {
            return null;
        }

        return data.api_key;
    }

    /**
     * Save or update user's TownSend API key
     */
    async saveUserApiKey(userId: string, apiKey: string): Promise<void> {
        const supabase = await createClient();

        const { error } = await supabase.from("user_api_keys").upsert(
            {
                user_id: userId,
                service_name: "townsend",
                api_key: apiKey,
            },
            {
                onConflict: "user_id,service_name",
            }
        );

        if (error) {
            throw new Error(`Failed to save TownSend API key: ${error.message}`);
        }
    }

    /**
     * Export leads to TownSend audiences API
     */
    async exportLeadsToAudience(
        apiKey: string,
        leads: Lead[]
    ): Promise<TownSendExportResponse> {
        if (!this.townsendHost) {
            return {
                success: false,
                message: "TownSend host is not configured",
            };
        }

        if (!apiKey) {
            return {
                success: false,
                message: "TownSend API key is required",
            };
        }

        if (!leads || leads.length === 0) {
            return {
                success: false,
                message: "No leads to export",
            };
        }

        try {
            // Filter leads with emails included in the scrap_info.emails array
            const filteredLeads = leads.filter((lead) => lead.scrap_info?.emails && lead.scrap_info.emails.length > 0);

            // Transform leads to TownSend format
            const payload: TownSendAudiencePayload[] = filteredLeads.map((lead) => {
                // Build tags from source and business type
                const tags: string[] = [];
                if (lead.source) {
                    tags.push(lead.source);
                }
                if (lead.business_type) {
                    tags.push(lead.business_type);
                }

                // At this point we know scrap_info and emails exist due to filter
                const email = lead.scrap_info!.emails![0];
                const name =
                    lead.scrap_info?.title ||
                    lead.enrich_info?.title_guess ||
                    "Unknown";
                const description =
                    lead.scrap_info?.desc || lead.enrich_info?.summary || undefined;

                return {
                    name,
                    email,
                    description,
                    tags: tags.length > 0 ? tags.join("|") : undefined,
                };
            });

            const response = await fetch(
                `${this.townsendHost}/api/v1/audiences`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const responseData = await response.json();

            if (!response.ok) {
                // Check for rate limit errors
                if (response.status === 429) {
                    return {
                        success: false,
                        message:
                            responseData.message ||
                            "TownSend API rate limit exceeded. Please try again later.",
                    };
                }

                // Check for other errors with message field
                if (responseData.message) {
                    return {
                        success: false,
                        message: responseData.message,
                    };
                }

                return {
                    success: false,
                    message: `Failed to export to TownSend: ${response.status} ${response.statusText}`,
                };
            }

            const successMessage = `Successfully exported ${leads.length} lead${leads.length > 1 ? "s" : ""} to TownSend`;

            return {
                success: true,
                message: successMessage,
                data: responseData,
            };
        } catch (error: any) {
            console.error("TownSend export error:", error);
            return {
                success: false,
                message: error.message || "Failed to export to TownSend",
            };
        }
    }

    /**
     * Verify TownSend API key is valid
     */
    async verifyApiKey(apiKey: string): Promise<{ valid: boolean; message?: string }> {
        if (!this.townsendHost) {
            return {
                valid: false,
                message: "TownSend host is not configured",
            };
        }

        try {
            // Try to make a simple API call to verify the key
            const response = await fetch(
                `${this.townsendHost}/api/v1/audiences`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                    },
                }
            );

            if (response.status === 401 || response.status === 403) {
                return {
                    valid: false,
                    message: "Invalid API key",
                };
            }

            if (response.ok || response.status === 404) {
                // 404 is ok, it means the endpoint exists but no audiences found
                return {
                    valid: true,
                };
            }

            return {
                valid: false,
                message: `Unexpected response: ${response.status}`,
            };
        } catch (error: any) {
            return {
                valid: false,
                message: error.message || "Failed to verify API key",
            };
        }
    }
}

export const townSendService = new TownSendService();

