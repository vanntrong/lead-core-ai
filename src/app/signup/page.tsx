"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { useSignUp } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle, Globe, Loader2, Shield, Star, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";

const signUpSchema = z.object({
  email: z.email("Valid email is required"),
  password: z
    .string({ error: "Password is required" })
    .min(MIN_PASSWORD_LENGTH, "Password must be at least 6 characters long"),
  firstName: z.string({ error: "First name is required" }).min(1, "First name is required"),
  lastName: z.string({ error: "Last name is required" }).min(1, "Last name is required"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function Signup() {
  const { mutate: signUp, isPending, error, data: signUpData } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    signUp(data);
  };

  const isSuccess =
    Array.isArray(signUpData?.user?.identities) &&
    signUpData.user.identities.length > 0;

  const isEmailAlreadyRegistered =
    Array.isArray(signUpData?.user?.identities) &&
    signUpData.user.identities.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-gray-100 border-b bg-white/95 backdrop-blur-sm">
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
            <div className="flex items-center gap-x-3">
              <Button asChild className="h-10 rounded-lg px-4 text-sm font-medium shadow-sm border border-gray-200 bg-white text-gray-900 hover:bg-gray-50" size="sm" variant="outline">
                <a href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl w-full">
          {/* Left side - Benefits */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Trusted by 10,000+ businesses
              </div>
              <h1 className="font-bold text-4xl text-gray-900 tracking-tight mb-6">
                Join thousands of companies growing with{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  LeadCore AI
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Start generating high-quality leads in minutes. Choose your plan and get started today.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quick setup</h3>
                  <p className="text-gray-600">Get started in minutes with our simple onboarding process.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multi-platform data scraping</h3>
                  <p className="text-gray-600">Extract leads from Shopify, Etsy, G2, and WooCommerce automatically.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI-powered lead enrichment</h3>
                  <p className="text-gray-600">Enrich leads with Claude AI and verify emails automatically.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export & automation</h3>
                  <p className="text-gray-600">Export to CSV, Google Sheets, or integrate with Zapier workflows.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Card className="border-0 bg-white shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">Create your account</CardTitle>
                  <CardDescription className="text-gray-600">
                    Get started with LeadCore AI today
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="bg-green-50 rounded-xl px-6 py-6 max-w-md text-center border border-green-200">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-green-700 mb-2">Account Created!</h2>
                        <p className="text-base text-gray-700 mb-4">
                          Welcome to LeadCore AI. Please check your email to confirm your account and complete your subscription.
                        </p>
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Link href="/login">Continue to Sign In</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {error?.message && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Signup Error</AlertTitle>
                          <AlertDescription>{error?.message}</AlertDescription>
                        </Alert>
                      )}
                      {isEmailAlreadyRegistered && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Account Already Exists</AlertTitle>
                          <AlertDescription>This email is already registered. Please check your email or try signing in.</AlertDescription>
                        </Alert>
                      )}

                      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                            <Input
                              className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              id="firstName"
                              placeholder="John"
                              type="text"
                              {...register("firstName")}
                              errorMessage={errors.firstName?.message}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                            <Input
                              className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              id="lastName"
                              placeholder="Doe"
                              type="text"
                              {...register("lastName")}
                              errorMessage={errors.lastName?.message}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Work Email</Label>
                          <Input
                            className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            id="email"
                            placeholder="john@company.com"
                            type="email"
                            {...register("email")}
                            errorMessage={errors.email?.message}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                          <Input
                            className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            id="password"
                            placeholder="Create a strong password"
                            type="password"
                            {...register("password")}
                            errorMessage={errors.password?.message}
                          />
                          <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                        </div>

                        <Button
                          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          disabled={isPending}
                          type="submit"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>

                        <div className="text-center">
                          <span className="text-sm text-gray-600">Already have an account? </span>
                          <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline" href="/login">
                            Sign in here
                          </Link>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500 text-center leading-relaxed">
                            By creating an account, you agree to our{" "}
                            <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                          </p>
                        </div>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
