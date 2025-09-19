# LeadCore AI

Signal-powered SaaS for trucking and logistics companies. Smart dispatching, route optimization, and real-time risk intelligence.

## 🚛 Features

- **Load Dispatching**: Intelligent load matching and dispatching with AI-powered route optimization
- **Driver Compliance**: Automated compliance monitoring, HOS tracking, and regulatory reporting
- **Client Communications**: Streamlined client communication with automated updates and real-time tracking
- **Risk Signals**: Real-time monitoring of strikes, fuel protests, weather disruptions, and other risks
- **GPT-Powered Smart Features**: AI-driven insights, predictive analytics, and intelligent automation
- **Enterprise Ready**: Built-in Stripe billing, white-label support, and enterprise-grade security

## 🎨 Stripe-Inspired SaaS Color Scheme

LeadCore AI features a sophisticated, Stripe-inspired color palette designed for maximum user trust and professional appeal:

1. **Stripe Purple** (`oklch(0.45 0.13 270)`) - Trustworthy, premium primary color conveying luxury and reliability
2. **Friendly Blue** (`oklch(0.6 0.15 230)`) - Approachable accent color for comfortable user interactions
3. **Soft Gray** (`oklch(0.96 0.003 240)`) - Clean, professional neutral for optimal content clarity
4. **Mint Green** (`oklch(0.65 0.12 160)`) - Gentle success indicators that provide positive feedback

**SaaS Philosophy**: Colors designed with psychological principles to build trust, reduce cognitive load, and create an approachable yet premium user experience - perfect for non-developer users.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom LeadCore AI theme
- **UI Components**: shadcn/ui (perfect for SaaS applications)
- **Database**: Supabase (configured for authentication and real-time features)
- **Icons**: Lucide React
- **Language**: TypeScript

## 🚀 Getting Started

1. **Clone and Install**:

   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file with your configuration:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration (for billing)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # OpenAI Configuration (for GPT-powered features)
   OPENAI_API_KEY=your_openai_api_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run Development Server**:

   ```bash
   npm run dev
   ```

4. **Open**: Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```
src/
├── app/                    # Next.js App Router
 │   ├── globals.css        # Global styles with LeadCore AI theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── utils.ts           # Utility functions
│   ├── supabase.ts        # Supabase client (browser)
│   └── supabase/
│       └── server.ts      # Supabase client (server)
```

## 🎯 Ready for Production

LeadCore AI is designed to be flip-ready for SaaS deployment:

- ✅ **7-Day Free Trial System** - Ready for Stripe integration
- ✅ **White-Label Support** - Customizable branding and themes
- ✅ **Enterprise Security** - Supabase authentication and RLS
- ✅ **Scalable Architecture** - Next.js 15 with modern patterns
- ✅ **Professional Design** - Industry-specific color scheme and UI

## 📝 License

This project is ready for commercial deployment and white-label customization.
