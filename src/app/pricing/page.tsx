import Footer from "@/components/footer";
import PricingPlants from "@/components/pricing-plants";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Globe } from "lucide-react";
import Link from "next/link";

export default async function PricingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
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
            <div className="hidden items-center space-x-8 md:flex">
              <Link
                className="font-medium text-gray-600 hover:text-gray-900"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="font-medium text-gray-600 hover:text-gray-900"
                href="/pricing"
              >
                Pricing
              </Link>
              <div className="flex items-center gap-x-3">
                {!user ? (
                  <>
                    <Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
                      <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white px-4 text-sm font-medium rounded-lg shadow-sm" size="sm">
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
                    <Link href="/dashboard/leads">Dashboard</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Title */}
      <div className="text-center py-16">
        <h1 className="font-bold text-4xl text-gray-900 tracking-tight sm:text-5xl">
          Simple, transparent{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            pricing
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 text-lg leading-8">
          Start today. Scale when you're ready. Cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <PricingPlants />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
