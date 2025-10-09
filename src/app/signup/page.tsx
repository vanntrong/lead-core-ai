"use client";

import React from "react";
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
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	Globe,
	Loader2,
	Shield,
	Star,
	Users,
	Zap,
	Eye,
	EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";

const signUpSchema = z.object({
	email: z.email("Valid email is required"),
	password: z
		.string({ error: "Password is required" })
		.min(MIN_PASSWORD_LENGTH, "Password must be at least 6 characters long"),
	firstName: z
		.string({ error: "First name is required" })
		.min(1, "First name is required"),
	lastName: z
		.string({ error: "Last name is required" })
		.min(1, "Last name is required"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function Signup() {
	const [showPassword, setShowPassword] = React.useState(false);
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
							<Button
								asChild
								className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm hover:bg-gray-50"
								size="sm"
								variant="outline"
							>
								<a href="/login" className="flex items-center gap-2">
									<ArrowLeft className="h-4 w-4" />
									Back to Sign In
								</a>
							</Button>
						</div>
					</div>
				</div>
			</nav>

			<div className="flex items-center justify-center px-4 py-16">
				<div className="grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
					{/* Left side - Benefits */}
					<div className="hidden flex-col justify-center lg:flex">
						<div className="mb-8">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 font-medium text-indigo-600 text-sm">
								<Star className="h-4 w-4" />
								Trusted by 10,000+ businesses
							</div>
							<h1 className="mb-6 font-bold text-4xl text-gray-900 tracking-tight">
								Join thousands of companies growing with{" "}
								<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
									LeadCore AI
								</span>
							</h1>
							<p className="mb-8 text-gray-600 text-xl">
								Start generating high-quality leads in minutes. Choose your plan
								and get started today.
							</p>
						</div>

						<div className="space-y-6">
							<div className="flex items-start space-x-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
									<CheckCircle className="h-5 w-5 text-green-600" />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-gray-900">
										Quick setup
									</h3>
									<p className="text-gray-600">
										Get started in minutes with our simple onboarding process.
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
									<Zap className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-gray-900">
										Multi-platform data scraping
									</h3>
									<p className="text-gray-600">
										Extract leads from Shopify, Etsy, G2, and WooCommerce
										automatically.
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
									<Users className="h-5 w-5 text-purple-600" />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-gray-900">
										AI-powered lead enrichment
									</h3>
									<p className="text-gray-600">
										Enrich leads with Claude AI and verify emails automatically.
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
									<Shield className="h-5 w-5 text-orange-600" />
								</div>
								<div>
									<h3 className="mb-1 font-semibold text-gray-900">
										Export & automation
									</h3>
									<p className="text-gray-600">
										Export to CSV, Google Sheets, or integrate with Zapier
										workflows.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right side - Form */}
					<div className="flex justify-center">
						<div className="w-full max-w-md">
							<Card className="border-0 bg-white shadow-2xl">
								<CardHeader className="pb-6 text-center">
									<CardTitle className="font-bold text-2xl text-gray-900">
										Create your account
									</CardTitle>
									<CardDescription className="text-gray-600">
										Get started with LeadCore AI today
									</CardDescription>
								</CardHeader>
								<CardContent className="px-6 pb-6">
									{isSuccess ? (
										<div className="flex flex-col items-center justify-center py-8">
											<div className="max-w-md rounded-xl border border-green-200 bg-green-50 px-6 py-6 text-center">
												<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
													<CheckCircle className="h-6 w-6 text-green-600" />
												</div>
												<h2 className="mb-2 font-bold text-green-700 text-xl">
													Check your email!
												</h2>
												<p className="mb-4 text-base text-gray-700">
													We've sent you a confirmation email. Click the link in
													your email to verify your account.
												</p>
												<Button
													asChild
													className="w-full bg-green-600 text-white hover:bg-green-700"
												>
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
													<AlertDescription>
														This email is already registered. Please check your
														email or try signing in.
													</AlertDescription>
												</Alert>
											)}

											<form
												className="space-y-5"
												onSubmit={handleSubmit(onSubmit)}
											>
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label
															htmlFor="firstName"
															className="font-medium text-gray-700 text-sm"
														>
															First Name
														</Label>
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
														<Label
															htmlFor="lastName"
															className="font-medium text-gray-700 text-sm"
														>
															Last Name
														</Label>
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
													<Label
														htmlFor="email"
														className="font-medium text-gray-700 text-sm"
													>
														Work Email
													</Label>
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
													<Label
														htmlFor="password"
														className="font-medium text-gray-700 text-sm"
													>
														Password
													</Label>
													<div className="relative">
														<Input
															className="h-11 border-gray-200 pr-12 focus:border-indigo-500 focus:ring-indigo-500"
															id="password"
															placeholder="Create a strong password"
															type={showPassword ? "text" : "password"}
															{...register("password")}
															errorMessage={errors.password?.message}
														/>
														<button
															type="button"
															aria-label={
																showPassword ? "Hide password" : "Show password"
															}
															onClick={() =>
																setShowPassword((prev: boolean) => !prev)
															}
															className="-translate-y-1/2 absolute top-1/2 right-3 text-gray-500 hover:text-indigo-600 focus:outline-none"
														>
															{showPassword ? (
																<EyeOff className="h-5 w-5" />
															) : (
																<Eye className="h-5 w-5" />
															)}
														</button>
													</div>
													<p className="text-gray-500 text-xs">
														Must be at least 6 characters long
													</p>
												</div>

												<Button
													className="h-12 w-full transform bg-indigo-600 font-semibold text-lg text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
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
													<span className="text-gray-600 text-sm">
														Already have an account?{" "}
													</span>
													<Link
														className="font-medium text-indigo-600 text-sm hover:text-indigo-500 hover:underline"
														href="/login"
													>
														Sign in here
													</Link>
												</div>

												<div className="border-gray-100 border-t pt-4">
													<p className="text-center text-gray-500 text-xs leading-relaxed">
														By creating an account, you agree to our{" "}
														<Link
															href="/terms"
															className="text-indigo-600 hover:underline"
														>
															Terms of Service
														</Link>{" "}
														and{" "}
														<Link
															href="/privacy"
															className="text-indigo-600 hover:underline"
														>
															Privacy Policy
														</Link>
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
			<p className="pb-4 text-center text-gray-500 text-sm">
				© {new Date().getFullYear()} LeadCore AI. Powered by $TOWN.
			</p>
		</div>
	);
}
