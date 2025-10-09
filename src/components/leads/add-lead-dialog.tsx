"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateLead } from "@/hooks/use-leads";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import type { CreateLeadData, LeadSource } from "@/types/lead";
import { AlertCircle, Globe, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UpgradeButton } from "../upgrade-btn";
import { ErrorLimitMessage } from "./error-limit-message";

interface AddLeadDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onLeadAdded?: () => void;
}

export function AddLeadDialog({
	isOpen,
	onClose,
	onLeadAdded,
}: AddLeadDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<CreateLeadData>({
		defaultValues: { url: "", source: undefined },
	});
	const createLeadMutation = useCreateLead();
	const { data: activeSubscription } = useUserActiveSubscription();
	const [submitError, setSubmitError] = React.useState<string | null>(null);
	const [isCreatingLead, setIsCreatingLead] = React.useState(false);
	const [errorUpgrade, setErrorUpgrade] = useState<string | null>(null);

	// Retry state: list of attempts with status and error
	type RetryStatus = "pending" | "success" | "error" | "waiting";
	const [retryAttempts, setRetryAttempts] = React.useState<
		Array<{ attempt: number; status: RetryStatus; error?: string }>
	>([]);

	const sourceSelected = watch("source");

	// Disable source if no active subscription or no sources available
	const isSourceDisabled =
		sourceSelected &&
		!activeSubscription?.usage_limits?.sources?.includes(sourceSelected);

	const handleClose = () => {
		onClose();
	};

	const submitLead = async (data: CreateLeadData) => {
		setSubmitError(null);
		setIsCreatingLead(true);
		setRetryAttempts([]);

		let lastError: string | null = null;
		let lastErrorType: string | undefined ;
		for (let attempt = 1; attempt <= 3; attempt++) {
			setRetryAttempts((prev) => [...prev, { attempt, status: "pending" }]);
			try {
				const result = await createLeadMutation.mutateAsync(data);
				if (!result.success) {
					throw new Error(
						result.message ||
							"Something went wrong during lead creation. Please try again."
					);
				}
				setRetryAttempts((prev) =>
					prev.map((r) =>
						r.attempt === attempt ? { ...r, status: "success" } : r
					)
				);
				toast.success("Lead added successfully!");
				onLeadAdded?.();
				onClose();
				lastError = null;
				lastErrorType = undefined;
				break;
			} catch (error: any) {
				console.error("Error adding lead:", error);
				if (error.message === "Lead limit exceeded") {
					setErrorUpgrade(error.message);
					break;
				}
				// Detect errorType and message from '[errorType] message' format
				let errorMessage =
					error?.message ||
					"Something went wrong during lead creation. Please try again.";
				let detectedType: string | undefined ;
				const match = errorMessage.match(/^\[(.+?)\]\s*(.*)$/);
				if (match) {
					detectedType = match[1];
					errorMessage = match[2] || errorMessage;
				}
				lastError = errorMessage;
				lastErrorType = detectedType;
				setRetryAttempts((prev) =>
					prev.map((r) =>
						r.attempt === attempt
							? { ...r, status: "error", error: lastError ?? undefined }
							: r
					)
				);
				// Only retry if errorType is not 'validation'
				if (attempt < 3 && lastErrorType !== "validation") {
					setRetryAttempts((prev) => [
						...prev,
						{ attempt: attempt + 1, status: "waiting" },
					]);
					await new Promise((resolve) => setTimeout(resolve, 2000));
					setRetryAttempts((prev) =>
						prev.filter(
							(r) => !(r.attempt === attempt + 1 && r.status === "waiting")
						)
					);
				} else {
					break;
				}
			}
		}

		// If all attempts failed, show final error message
		if (lastError) {
			setSubmitError(
				lastErrorType === "validation"
					? lastError
					: "Lead creation failed after 3 attempts. Please check your URL and try again."
			);
		}

		setIsCreatingLead(false);
	};

	useEffect(() => {
		if (isOpen) {
			reset();
			setSubmitError(null);
			setRetryAttempts([]);
		}
	}, [isOpen, reset]);

	return (
		<>
			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent
					className="mx-auto max-w-md rounded-lg border-gray-200 bg-white shadow-2xl"
					onInteractOutside={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle className="flex items-center space-x-3 text-xl">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
								<Globe className="h-5 w-5 text-indigo-600" />
							</div>
							<div>
								<span>Add Lead</span>
								<p className="mt-1 font-normal text-gray-600 text-sm">
									Add a website to track new leads.
								</p>
							</div>
						</DialogTitle>
					</DialogHeader>

					{/* Form Content */}
					<div className="flex-1">
						{submitError && (
							<div className="mb-4">
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Error</AlertTitle>
									<AlertDescription>{submitError}</AlertDescription>
								</Alert>
							</div>
						)}

						{/* Retry Progress Display */}
						{retryAttempts.length > 1 && (
							<div className="mb-4">
								<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
									<h4 className="mb-2 font-medium text-blue-800 text-sm">
										Creation Progress
									</h4>
									<div className="space-y-2">
										{retryAttempts.map((attempt) => (
											<div
												key={`${attempt.attempt}-${attempt.status}`}
												className="flex items-center space-x-2 text-sm"
											>
												<span className="text-blue-700">
													Attempt {attempt.attempt}:
												</span>
												{attempt.status === "pending" && (
													<>
														<Loader2 className="h-3 w-3 animate-spin text-blue-600" />
														<span className="text-blue-600">
															In progress...
														</span>
													</>
												)}
												{attempt.status === "waiting" && (
													<>
														<Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
														<span className="text-yellow-700">
															Waiting 2s before retry...
														</span>
													</>
												)}
												{attempt.status === "success" && (
													<>
														<span className="text-green-600">✓</span>
														<span className="text-green-600">Success</span>
													</>
												)}
												{attempt.status === "error" && (
													<>
														<span className="text-red-600">✗</span>
														<span className="text-red-600">Failed</span>
														{attempt.error && (
															<span className="text-red-500 text-xs">
																({attempt.error})
															</span>
														)}
													</>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						)}
						<form className="space-y-6" onSubmit={handleSubmit(submitLead)}>
							{/* URL Field */}
							<div>
								<Label
									className="font-semibold text-gray-700 text-sm"
									htmlFor="url"
								>
									Lead URL *
								</Label>
								<Input
									id="url"
									{...register("url", { required: "URL is required" })}
									aria-invalid={errors.url ? "true" : "false"}
									className="mt-2"
									placeholder="https://example.com"
								/>
								{errors.url && (
									<p className="mt-2 text-red-600 text-sm" role="alert">
										{errors.url.message}
									</p>
								)}
							</div>

							{/* Source Field */}
							<div>
								<Label
									className="font-semibold text-gray-700 text-sm"
									htmlFor="source"
								>
									Source
								</Label>
								<Select
									onValueChange={(value) =>
										setValue("source", value as unknown as LeadSource, {
											shouldValidate: true,
										})
									}
									{...register("source", { required: "Source is required" })}
								>
									<SelectTrigger className="mt-2">
										<SelectValue placeholder="Select source" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="shopify">Shopify</SelectItem>
										<SelectItem value="etsy">Etsy</SelectItem>
										<SelectItem value="g2">G2</SelectItem>
										<SelectItem value="woocommerce">WooCommerce</SelectItem>
									</SelectContent>
								</Select>
								{errors.source && (
									<p className="mt-2 text-red-600 text-sm" role="alert">
										{errors.source.message || "Source is required"}
									</p>
								)}
							</div>
							<div className="mt-2 flex space-x-3 border-gray-200 border-t pt-6">
								<DialogClose asChild>
									<Button
										className="flex-1"
										disabled={
											isCreatingLead ||
											createLeadMutation.isPending ||
											isSubmitting
										}
										type="button"
										variant="outline"
									>
										Cancel
									</Button>
								</DialogClose>
								{isSourceDisabled ? (
									<UpgradeButton
										className="flex-1"
										currentPlan={activeSubscription?.plan_tier ?? "trial"}
										title="Upgrade to add lead"
									/>
								) : (
									<Button
										className="flex-1 bg-indigo-600 hover:bg-indigo-700"
										disabled={
											isCreatingLead ||
											createLeadMutation.isPending ||
											isSubmitting
										}
										type="submit"
									>
										{isCreatingLead ||
										createLeadMutation.isPending ||
										isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating Lead...
											</>
										) : (
											"Add Lead"
										)}
									</Button>
								)}
							</div>
						</form>
					</div>
				</DialogContent>
			</Dialog>
			<ErrorLimitMessage
				message={errorUpgrade}
				onClose={() => setErrorUpgrade(null)}
			/>
		</>
	);
}
