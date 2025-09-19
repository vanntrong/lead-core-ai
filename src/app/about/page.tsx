import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";

export default function LegalDisclaimerPage() {
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
            About Us
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Learn more about LeadCore AI, our mission, and the team behind the platform.
          </p>
          <div className="mt-6 text-gray-500 text-sm">
            Last updated: September 14, 2025
          </div>
        </div>
        <div className="prose prose-lg max-w-none">
          <div className="mb-8 rounded-lg bg-gray-50 p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              LeadCore AI is a next-generation SaaS platform built by Bug Hutch Ltd, led by founder Lee Caston.
            </p>
            <hr className="my-4 border-gray-200" />
            <p className="text-gray-700 leading-relaxed mb-4">
              Our mission is simple: to give businesses and agencies the tools to find, enrich, and connect with the right leads—faster, smarter, and more compliantly than ever before.
            </p>
            <hr className="my-4 border-gray-200" />
            <p className="text-gray-700 leading-relaxed mb-4">
              LeadCore integrates advanced AI enrichment, verified email intelligence, and outbound bridges to help operators scale.
            </p>
            <hr className="my-4 border-gray-200" />
            <p className="text-gray-700 leading-relaxed">
              Bug Hutch Ltd is a UK-based technology company focused on building sovereign SaaS tools that empower entrepreneurs, agencies, and operators worldwide.
            </p>
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
