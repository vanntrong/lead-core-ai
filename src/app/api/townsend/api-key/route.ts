import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { townSendService } from "@/services/townsend.service";

// Get user's TownSend API key
export async function GET() {
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

        const apiKey = await townSendService.getUserApiKey(user.id);

        return NextResponse.json({
            success: true,
            hasApiKey: !!apiKey,
            // Don't return the actual key for security
        });
    } catch (error: any) {
        console.error("Get TownSend API key error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to get API key",
            },
            { status: 500 }
        );
    }
}

// Save or update user's TownSend API key
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
        const { apiKey } = body as { apiKey: string };

        if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
            return NextResponse.json(
                { success: false, message: "API key is required" },
                { status: 400 }
            );
        }

        // Verify the API key is valid before saving
        const verification = await townSendService.verifyApiKey(apiKey);

        if (!verification.valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: verification.message || "Invalid API key",
                },
                { status: 400 }
            );
        }

        // Save the API key
        await townSendService.saveUserApiKey(user.id, apiKey);

        return NextResponse.json({
            success: true,
            message: "TownSend API key saved successfully",
        });
    } catch (error: any) {
        console.error("Save TownSend API key error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to save API key",
            },
            { status: 500 }
        );
    }
}

// Delete user's TownSend API key
export async function DELETE() {
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

        const { error } = await supabase
            .from("user_api_keys")
            .delete()
            .eq("user_id", user.id)
            .eq("service_name", "townsend");

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: "TownSend API key deleted successfully",
        });
    } catch (error: any) {
        console.error("Delete TownSend API key error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to delete API key",
            },
            { status: 500 }
        );
    }
}

