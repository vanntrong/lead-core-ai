"use client";

import { Button } from "@/components/ui/button";
import { Crown, CheckCircle } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [countdown, setCountdown] = useState(3);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setEnabled(true);
    }
  }, [countdown]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">
            Payment{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Successful!
            </span>
          </h1>
          <p className="text-gray-600 text-base">
            Your LeadCore plan is now upgraded. Enjoy your new features!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/dashboard">
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:scale-105 transition-transform"
                disabled={!enabled}
              >
                <Crown className="mr-2 h-4 w-4 text-yellow-300" />
                Go to Dashboard
                {!enabled && (
                  <span className="ml-2 text-xs text-white flex items-center">
                    {/* Simple spinner or countdown */}
                    <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 00-6 6H4z" />
                    </svg>
                    {countdown}s
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
