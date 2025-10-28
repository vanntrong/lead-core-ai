import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { townSendService } from "@/services/townsend.service";
import type { Lead } from "@/types/lead";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { leads } = body as {
            leads: Lead[];
        };

        if (!leads) {
            return NextResponse.json(
                { success: false, message: "No leads provided" },
                { status: 400 }
            );
        }

        if (!Array.isArray(leads)) {
            return NextResponse.json(
                { success: false, message: "Leads must be an array" },
                { status: 400 }
            );
        }

        if (leads.length === 0) {
            return NextResponse.json(
                { success: false, message: "No leads provided" },
                { status: 400 }
            );
        }

        // Get user's TownSend API key
        const apiKey = await townSendService.getUserApiKey(user.id);

        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    message: "TownSend API key not configured. Please set it in your settings.",
                },
                { status: 400 }
            );
        }

        // Export leads to TownSend
        const result = await townSendService.exportLeadsToAudience(apiKey, leads);

        if (!result.success) {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (error: any) {
        console.error("TownSend export API error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to export leads to TownSend",
            },
            { status: 500 }
        );
    }
}

