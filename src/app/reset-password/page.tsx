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
import { useResetPassword } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Globe, Loader2, Lock, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    try {
      await resetPasswordMutation.mutateAsync(data.password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Please try again.");
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
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {isSuccess ? "Password updated!" : "Reset your password"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isSuccess
                  ? "Your password has been successfully updated"
                  : "Enter your new password below"
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

              {isSuccess ? (
                <div className="text-center space-y-6">
                  <div className="bg-green-50 rounded-xl px-6 py-6 border border-green-200">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-700 mb-2">All set!</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Your password has been reset successfully
                    </p>
                    <p className="text-xs text-gray-500">
                      You can now sign in with your new password
                    </p>
                  </div>

                  <Button asChild className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/login">
                      Continue to sign in
                    </Link>
                  </Button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      New password
                    </Label>
                    <div className="relative">
                      <Input
                        className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                        id="password"
                        placeholder="Enter your new password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        errorMessage={errors.password?.message}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                        id="confirmPassword"
                        placeholder="Confirm your new password"
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        errorMessage={errors.confirmPassword?.message}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={resetPasswordMutation.isPending}
                    type="submit"
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update password
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