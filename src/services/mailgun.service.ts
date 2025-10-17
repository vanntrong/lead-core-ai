import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

// Initialize Mailgun client
const getMailgunClient = () => {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey) {
        throw new Error("Mailgun API key not configured");
    }

    if (!domain) {
        throw new Error("Mailgun domain not configured");
    }

    return mailgun.client({
        username: "api",
        key: apiKey,
    });
};

export interface SendEmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
}

export class MailgunService {
    private readonly domain: string;
    private readonly defaultFrom: string;

    constructor() {
        this.domain = process.env.MAILGUN_DOMAIN || "";
        this.defaultFrom =
            process.env.MAILGUN_FROM_EMAIL || `noreply@${this.domain}`;
    }

    /**
     * Send an email using Mailgun
     */
    async sendEmail({
        to,
        subject,
        text,
        html,
        from,
    }: SendEmailParams): Promise<void> {
        try {
            if (!(text || html)) {
                throw new Error("Text or HTML is required");
            }
            const mg = getMailgunClient();

            const messageData = {
                from: from || this.defaultFrom,
                to,
                subject,
                text: text || "",
                html: html || "",
            };

            await mg.messages.create(this.domain, messageData);
        } catch (error) {
            console.error("Failed to send email:", error);
            throw new Error(
                `Failed to send email: ${(error as Error).message || "Unknown error"}`
            );
        }
    }

    /**
     * Send contact form notification to admin
     */
    async sendContactFormNotification(data: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<void> {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@yourdomain.com";

        const html = `
			<h2>New Contact Form Submission</h2>
			<p><strong>Name:</strong> ${data.name}</p>
			<p><strong>Email:</strong> ${data.email}</p>
			<p><strong>Subject:</strong> ${data.subject}</p>
			<p><strong>Message:</strong></p>
			<p>${data.message.replace(/\n/g, "<br>")}</p>
		`;

        await this.sendEmail({
            to: adminEmail,
            subject: `Contact Form: ${data.subject}`,
            html,
        });
    }

    /**
     * Send confirmation email to user who submitted the contact form
     */
    async sendContactConfirmationEmail(data: {
        name: string;
        email: string;
        subject: string;
    }): Promise<void> {
        const html = `
			<h2>Thank you for contacting us!</h2>
			<p>Hi ${data.name},</p>
			<p>We have received your message regarding "${data.subject}" and will get back to you as soon as possible.</p>
			<p>Our team typically responds within 24-48 hours.</p>
			<br>
			<p>Best regards,<br>LeadCore Support Team</p>
		`;

        const text = `
Thank you for contacting us!

Hi ${data.name},

We have received your message regarding "${data.subject}" and will get back to you as soon as possible.

Our team typically responds within 24-48 hours.

Best regards,
LeadCore Support Team
		`;

        await this.sendEmail({
            to: data.email,
            subject: "We received your message - LeadCore Support",
            html,
            text,
        });
    }
}

export const mailgunService = new MailgunService();
