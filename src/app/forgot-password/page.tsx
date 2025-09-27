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
import { useForgotPassword } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle, Globe, Loader2, Mail, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Valid email is required"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;


export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPassword();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitted(false);
    setError(null);
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email. Please try again.");
    }
  };

  const handleResendEmail = async () => {
    setError(null);
    try {
      await forgotPasswordMutation.mutateAsync(getValues("email"));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to resend email. Please try again.");
    }
  };

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
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <Card className="border-0 bg-white shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mx-auto mb-4">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isSubmitted ? "Check your email" : "Forgot your password?"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isSubmitted
                  ? "We've sent a password reset link to your email address"
                  : "No worries, we'll send you reset instructions"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {isSubmitted ? (
                <div className="text-center space-y-6">
                  <div className="bg-green-50 rounded-xl px-6 py-6 border border-green-200">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">Email sent!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      We've sent a password reset link to <span className="font-medium">{getValues("email")}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={handleResendEmail}
                      disabled={forgotPasswordMutation.isPending}
                      variant="outline"
                      className="w-full h-11"
                    >
                      {forgotPasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        "Resend email"
                      )}
                    </Button>

                    <Button asChild className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
                      <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to sign in
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address
                    </Label>
                    <Input
                      className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                      id="email"
                      placeholder="Enter your email address"
                      type="email"
                      {...register("email")}
                      errorMessage={errors.email?.message}
                    />
                    <p className="text-xs text-gray-500">
                      Enter the email address associated with your account
                    </p>
                  </div>

                  <Button
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={forgotPasswordMutation.isPending}
                    type="submit"
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send reset link
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <span className="text-sm text-gray-600">Remember your password? </span>
                    <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline" href="/login">
                      Sign in here
                    </Link>
                  </div>
                </form>
              )}
              <div className="pt-6 border-t border-gray-100 mt-6">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>Secure Reset</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>Trusted by 10,000+</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
