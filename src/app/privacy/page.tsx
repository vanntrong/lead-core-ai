import { ArrowLeft, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-gray-100 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <Link href="/" className="font-bold text-gray-900 text-xl">
                LeadCore AI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild size="sm" variant="ghost">
                <Link className="flex items-center text-gray-600" href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            This policy explains how LeadCore AI collects, uses, and protects your personal information.
          </p>
          <div className="mt-6 text-gray-500 text-sm">
            Last updated: September 14, 2024
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                1. Data Collection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We collect limited personal information (such as email address,
                payment details, and account preferences) when you register and
                use LeadCore AI.
              </p>
            </section>
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                2. Data Usage
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use this information to deliver our services, manage
                subscriptions, provide support, and process payments. We do not
                sell personal data to third parties.
              </p>
            </section>
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                3. Data Storage
              </h2>
              <p className="text-gray-700 leading-relaxed">
                All data is stored securely in accordance with UK GDPR
                requirements. Leads scraped or enriched through the platform are
                processed automatically and remain the responsibility of the user.
              </p>
            </section>
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                4. Cookies & Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and tracking technologies for authentication,
                analytics, and product improvement.
              </p>
            </section>
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                5. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                LeadCore AI integrates with providers such as Stripe, Rewardful,
                and AI/verification APIs. These services process data under
                their own policies.
              </p>
            </section>
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                6. User Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You may request access, correction, or deletion of your personal
                data by contacting{" "}
                <a
                  className="text-indigo-600 underline hover:text-indigo-700"
                  href="mailto:support@leadcoreai.com"
                >
                  support@leadcoreai.com
                </a>
                .
              </p>
            </section>
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                7. Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We take appropriate technical measures to protect user data but
                cannot guarantee complete security of information transmitted
                online.
              </p>
            </section>
            <section>
              <h2 className="mb-4 font-semibold text-2xl text-gray-900">
                8. Changes
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. Users will
                be notified of material changes.
              </p>
            </section>
          </div>

        </div>

        {/* Contact Section - moved and styled for clarity */}
        <div className="mt-12 flex justify-center">
          <div className="rounded-lg p-6 w-full max-w-md">
            <h2 className="mb-3 text-xl font-semibold text-gray-900 text-center">Contact</h2>
            <div className="space-y-1 text-gray-700 text-base text-center">
              <div>Bug Hutch Ltd</div>
              <div>Lee Caston</div>
              <div>WhatsApp: <span className="text-indigo-600">+44 7894 158884</span></div>
              <div>Email: <a className="text-indigo-600 underline hover:text-indigo-700" href="mailto:support@leadcoreai.com">support@leadcoreai.com</a></div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
