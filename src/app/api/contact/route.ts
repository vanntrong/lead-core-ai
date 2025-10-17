import { type NextRequest, NextResponse } from "next/server";
import { mailgunService } from "@/services/mailgun.service";

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json();

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }
        if (!subject) {
            return NextResponse.json(
                { error: "Subject is required" },
                { status: 400 }
            );
        }
        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        // Send notification to admin
        await mailgunService.sendContactFormNotification({
            name,
            email,
            subject,
            message,
        });

        // Send confirmation email to user
        await mailgunService.sendContactConfirmationEmail({
            name,
            email,
            subject,
        });

        return NextResponse.json({
            success: true,
            message: "Your message has been sent successfully",
        });
    } catch (error) {
        console.error("Error processing contact form:", error);
        return NextResponse.json(
            {
                error: "Failed to send message. Please try again later.",
            },
            { status: 500 }
        );
    }
}

