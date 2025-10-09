"use client";

import { useState } from "react";
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
import { useSignIn } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertCircle,
	ArrowRight,
	Globe,
	Loader2,
	Shield,
	Star,
	TrendingUp,
	Users,
	Zap,
	Eye,
	EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import z from "zod";

const signInSchema = z.object({
	email: z.email("Valid email is required"),
	password: z
		.string({
			error: "Password is required",
		})
		.min(MIN_PASSWORD_LENGTH, "Password must be at least 6 characters long"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function Login() {
	const { mutate: signIn, isPending, error } = useSignIn();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
	});

	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = (data: SignInFormData) => {
		signIn(data);
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
							<Button
								asChild
								className="h-10 rounded-lg border border-gray-200 bg-white px-4 font-medium text-gray-900 text-sm shadow-sm hover:bg-gray-50"
								size="sm"
								variant="outline"
							>
								<Link href="/signup">Create Account</Link>
							</Button>
						</div>
					</div>
				</div>
			</nav>

			<div className="flex items-center justify-center px-4 py-16">
				<div className="grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
					{/* Left side - Value Proposition */}
					<div className="hidden flex-col justify-center lg:flex">
						<div className="mb-8">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 font-medium text-indigo-600 text-sm">
								<TrendingUp className="h-4 w-4" />
								Join successful sales teams
							</div>
							<h1 className="mb-6 font-bold text-4xl text-gray-900 tracking-tight">
								Welcome back to{" "}
								<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
									LeadCore AI
								</span>
							</h1>
							<p className="mb-8 text-gray-600 text-xl">
								Sign in to continue generating high-quality leads and growing
								your business with AI-powered insights.
							</p>
						</div>

						<div className="space-y-6">
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

					{/* Right side - Login Form */}
					<div className="flex justify-center">
						<div className="w-full max-w-md">
							<Card className="border-0 bg-white shadow-2xl">
								<CardHeader className="pb-6 text-center">
									<CardTitle className="font-bold text-2xl text-gray-900">
										Welcome back
									</CardTitle>
									<CardDescription className="text-gray-600">
										Sign in to your LeadCore AI account
									</CardDescription>
								</CardHeader>
								<CardContent className="px-6 pb-6">
									{error?.message && (
										<Alert variant="destructive" className="mb-4">
											<AlertCircle className="h-4 w-4" />
											<AlertTitle>Sign In Error</AlertTitle>
											<AlertDescription>{error?.message}</AlertDescription>
										</Alert>
									)}

									<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
										<div className="space-y-2">
											<Label
												htmlFor="email"
												className="font-medium text-gray-700 text-sm"
											>
												Email
											</Label>
											<Input
												className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
												id="email"
												placeholder="Enter your email"
												type="email"
												{...register("email")}
												errorMessage={errors.email?.message}
											/>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<Label
													htmlFor="password"
													className="font-medium text-gray-700 text-sm"
												>
													Password
												</Label>
												<Link
													href="/forgot-password"
													className="font-medium text-indigo-600 text-sm hover:text-indigo-500 hover:underline"
												>
													Forgot password?
												</Link>
											</div>
											<div className="relative">
												<Input
													className="h-11 border-gray-200 pr-12 focus:border-indigo-500 focus:ring-indigo-500"
													id="password"
													placeholder="Enter your password"
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
										</div>

										<Button
											className="h-12 w-full transform bg-indigo-600 font-semibold text-lg text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
											disabled={isPending}
											type="submit"
										>
											{isPending ? (
												<>
													<Loader2 className="mr-2 h-5 w-5 animate-spin" />
													Signing you in...
												</>
											) : (
												<>
													Sign In
													<ArrowRight className="ml-2 h-4 w-4" />
												</>
											)}
										</Button>

										<div className="text-center">
											<span className="text-gray-600 text-sm">
												Don't have an account?{" "}
											</span>
											<Link
												className="font-medium text-indigo-600 text-sm hover:text-indigo-500 hover:underline"
												href="/signup"
											>
												Create one now
											</Link>
										</div>

										<div className="border-gray-100 border-t pt-4">
											<div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
												<div className="flex items-center gap-1">
													<Shield className="h-3 w-3" />
													<span>Secure Login</span>
												</div>
												<div className="flex items-center gap-1">
													<Star className="h-3 w-3" />
													<span>Trusted by 10,000+</span>
												</div>
											</div>
										</div>
									</form>
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
