# Mailgun Setup Guide

This guide will help you configure Mailgun for the contact form functionality.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## Getting Your Mailgun Credentials

1. **Sign up for Mailgun**
   - Go to https://www.mailgun.com/
   - Create a free account (includes 5,000 emails per month)

2. **Get Your API Key**
   - Log in to your Mailgun dashboard
   - Go to Settings → API Keys
   - Copy your Private API key
   - Set it as `MAILGUN_API_KEY` in your `.env.local`

3. **Get Your Domain**
   - In the Mailgun dashboard, go to Sending → Domains
   - You can use the sandbox domain for testing (e.g., `sandboxXXXXXXX.mailgun.org`)
   - Or add your own custom domain for production
   - Set it as `MAILGUN_DOMAIN` in your `.env.local`

4. **Configure Email Addresses**
   - `MAILGUN_FROM_EMAIL`: The email address that will appear as the sender (e.g., `noreply@yourdomain.com`)
   - `ADMIN_EMAIL`: The email address where contact form submissions will be sent (e.g., `admin@yourdomain.com`)

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/contact

3. Fill out the contact form and submit

4. You should receive:
   - An email notification at your `ADMIN_EMAIL` with the form details
   - A confirmation email sent to the user's email address

## Features

The contact form system includes:

- **Form Validation**: Client-side and server-side validation
- **Admin Notification**: Sends form details to your admin email
- **User Confirmation**: Sends a confirmation email to the user
- **Error Handling**: Proper error messages and retry capability
- **Beautiful UI**: Modern, responsive design matching your brand

## Troubleshooting

### Emails not sending

- Verify all environment variables are set correctly
- Check that your Mailgun API key is valid
- If using sandbox domain, ensure recipient email is added as an authorized recipient in Mailgun
- Check server logs for detailed error messages

### Sandbox Domain Limitations

Mailgun's sandbox domain has limitations:
- Can only send to authorized recipients (add them in Mailgun dashboard)
- Consider adding a custom domain for production use

## Contact Form Locations

The contact form is accessible at:
- `/contact` - Standalone contact page
- Footer - "Contact Support" link in all pages
- Dashboard - "Contact Support" link in sidebar
- Navigation - "Contact" link in main navigation

## Customization

You can customize the email templates in:
- `src/services/mailgun.service.ts`
  - `sendContactFormNotification()` - Admin notification email
  - `sendContactConfirmationEmail()` - User confirmation email

