"use client";

import { AlertCircle, Globe, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getPresetsForSource } from "@/constants/vertical-presets";
import { useCreateLead } from "@/hooks/use-leads";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import type { CreateLeadData, LeadSource } from "@/types/lead";
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

	// State for new source-specific fields
	const [googlePlacesKeyword, setGooglePlacesKeyword] = useState("");
	const [googlePlacesLocation, setGooglePlacesLocation] = useState("");
	const [npiProviderName, setNpiProviderName] = useState("");
	const [npiTaxonomy, setNpiTaxonomy] = useState("");
	const [npiLocation, setNpiLocation] = useState("");
	const [fmcsaCompanyName, setFmcsaCompanyName] = useState("");
	const [fmcsaDotNumber, setFmcsaDotNumber] = useState("");
	const [fmcsaMcNumber, setFmcsaMcNumber] = useState("");

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

		// Construct URL based on source type for new sources
		const finalData = { ...data };
		if (data.source === "google_places") {
			if (!googlePlacesKeyword) {
				setSubmitError("Please enter a keyword to search for");
				setIsCreatingLead(false);
				return;
			}
			// Use JSON string for new sources
			finalData.url = JSON.stringify({
				keyword: googlePlacesKeyword,
				location: googlePlacesLocation,
			});
		} else if (data.source === "npi_registry") {
			if (!(npiProviderName || npiTaxonomy)) {
				setSubmitError("Please enter either a provider name or specialty");
				setIsCreatingLead(false);
				return;
			}
			// Use JSON string for new sources
			const params: Record<string, string> = {};
			if (npiProviderName) {
				params.provider = npiProviderName;
			}
			if (npiTaxonomy) {
				params.taxonomy = npiTaxonomy;
			}
			if (npiLocation) {
				params.location = npiLocation;
			}
			finalData.url = JSON.stringify(params);
		} else if (data.source === "fmcsa") {
			if (!(fmcsaCompanyName || fmcsaDotNumber || fmcsaMcNumber)) {
				setSubmitError("Please enter a company name, DOT number, or MC number");
				setIsCreatingLead(false);
				return;
			}
			// Use JSON string for new sources
			const params: Record<string, string> = {};
			if (fmcsaCompanyName) {
				params.company = fmcsaCompanyName;
			}
			if (fmcsaDotNumber) {
				params.dot = fmcsaDotNumber;
			}
			if (fmcsaMcNumber) {
				params.mc = fmcsaMcNumber;
			}
			finalData.url = JSON.stringify(params);
		}

		let lastError: string | null = null;
		let lastErrorType: string | undefined;
		for (let attempt = 1; attempt <= 3; attempt++) {
			setRetryAttempts((prev) => [...prev, { attempt, status: "pending" }]);
			try {
				const result = await createLeadMutation.mutateAsync(finalData);
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
				let detectedType: string | undefined;
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
			// Reset new source fields
			setGooglePlacesKeyword("");
			setGooglePlacesLocation("");
			setNpiProviderName("");
			setNpiTaxonomy("");
			setNpiLocation("");
			setFmcsaCompanyName("");
			setFmcsaDotNumber("");
			setFmcsaMcNumber("");
		}
	}, [isOpen, reset]);

	return (
		<>
			<Sheet onOpenChange={handleClose} open={isOpen}>
				<SheetContent
					className="w-full overflow-y-auto border-gray-200 bg-white sm:max-w-xl lg:max-w-2xl"
					side="right"
				>
					<SheetHeader className="border-gray-200 border-b px-6 pb-4">
						<SheetTitle className="flex items-center space-x-3 text-xl">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
								<Globe className="h-5 w-5 text-indigo-600" />
							</div>
							<div className="flex-1">
								<span className="block text-gray-900">Add Lead</span>
								<SheetDescription className="mt-1 font-normal text-gray-600 text-sm">
									Add a website to track new leads.
								</SheetDescription>
							</div>
						</SheetTitle>
					</SheetHeader>

					{/* Form Content */}
					<div className="flex-1 px-6 py-6">
						{submitError && (
							<div className="mb-6">
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Error</AlertTitle>
									<AlertDescription>{submitError}</AlertDescription>
								</Alert>
							</div>
						)}

						{/* Retry Progress Display */}
						{retryAttempts.length > 1 && (
							<div className="mb-6">
								<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
									<h4 className="mb-2 font-medium text-blue-800 text-sm">
										Creation Progress
									</h4>
									<div className="space-y-2">
										{retryAttempts.map((attempt) => (
											<div
												className="flex items-center space-x-2 text-sm"
												key={`${attempt.attempt}-${attempt.status}`}
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
						<form
							className="space-y-6"
							id="add-lead-form"
							onSubmit={handleSubmit(submitLead)}
						>
							{/* Source Field - Show first */}
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
										<SelectItem value="google_places">Google Places</SelectItem>
										<SelectItem value="npi_registry">NPI Registry</SelectItem>
										<SelectItem value="fmcsa">FMCSA</SelectItem>
									</SelectContent>
								</Select>
								{errors.source && (
									<p className="mt-2 text-red-600 text-sm" role="alert">
										{errors.source.message || "Source is required"}
									</p>
								)}
							</div>

							{/* Old sources - Show URL field */}
							{sourceSelected &&
								["shopify", "etsy", "g2", "woocommerce"].includes(
									sourceSelected
								) && (
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
								)}

							{/* Google Places specific fields */}
							{sourceSelected === "google_places" && (
								<div className="space-y-4">
									<p className="text-gray-600 text-sm">
										Search for local businesses using keywords and location
									</p>

									{/* Input Fields */}
									<div>
										<Label className="font-semibold text-gray-700 text-sm">
											Business Type / Keyword *
										</Label>
										<Input
											className="mt-2"
											onChange={(e) => setGooglePlacesKeyword(e.target.value)}
											placeholder="e.g., restaurants, dentists, coffee shops"
											value={googlePlacesKeyword}
										/>
										<p className="mt-1 text-gray-500 text-xs">
											What type of business are you looking for?
										</p>
									</div>

									<div>
										<Label className="font-semibold text-gray-700 text-sm">
											Location
										</Label>
										<Input
											className="mt-2"
											onChange={(e) => setGooglePlacesLocation(e.target.value)}
											placeholder="e.g., New York, NY or San Francisco, CA"
											value={googlePlacesLocation}
										/>
										<p className="mt-1 text-gray-500 text-xs">
											City, state, or region (optional - leave blank for broader
											search)
										</p>
									</div>

									{/* Preset Buttons */}
									<div className="border-gray-200 border-t pt-4">
										<Label className="mb-2 block font-medium text-gray-700 text-sm">
											Quick Presets
										</Label>
										<div className="grid grid-cols-2 gap-2">
											{getPresetsForSource("google_places").map((preset) => (
												<Button
													className="justify-start text-xs"
													key={preset.label}
													onClick={() => {
														setGooglePlacesKeyword(preset.keyword || "");
														setGooglePlacesLocation(preset.location || "");
													}}
													size="sm"
													type="button"
													variant="outline"
												>
													{preset.label}
												</Button>
											))}
										</div>
									</div>
								</div>
							)}

							{/* NPI Registry specific fields */}
							{sourceSelected === "npi_registry" && (
								<div className="space-y-4">
									<p className="text-gray-600 text-sm">
										Search for healthcare providers by specialty and location
									</p>

									{/* Input Fields */}
									<div>
										<Label className="font-semibold text-gray-700 text-sm">
											Provider Name
										</Label>
										<Input
											className="mt-2"
											onChange={(e) => setNpiProviderName(e.target.value)}
											placeholder="e.g., Smith, Johnson (optional)"
											value={npiProviderName}
										/>
										<p className="mt-1 text-gray-500 text-xs">
											Last name or business name (leave blank to search by
											specialty only)
										</p>
									</div>

									<div>
										<Label className="font-semibold text-gray-700 text-sm">
											Specialty / Taxonomy *
										</Label>
										<Input
											className="mt-2"
											onChange={(e) => setNpiTaxonomy(e.target.value)}
											placeholder="e.g., dentist, physician, physical therapist"
											value={npiTaxonomy}
										/>
										<p className="mt-1 text-gray-500 text-xs">
											What type of healthcare provider are you looking for?
										</p>
									</div>

									<div>
										<Label className="font-semibold text-gray-700 text-sm">
											Location
										</Label>
										<Input
											className="mt-2"
											onChange={(e) => setNpiLocation(e.target.value)}
											placeholder="e.g., California, TX, 90210 (optional)"
											value={npiLocation}
										/>
										<p className="mt-1 text-gray-500 text-xs">
											State, city, or ZIP code (optional)
										</p>
									</div>

									{/* Preset Buttons */}
									<div className="border-gray-200 border-t pt-4">
										<Label className="mb-2 block font-medium text-gray-700 text-sm">
											Quick Presets
										</Label>
										<div className="grid grid-cols-2 gap-2">
											{getPresetsForSource("npi_registry").map((preset) => (
												<Button
													className="justify-start text-xs"
													key={preset.label}
													onClick={() => {
														setNpiProviderName(preset.providerName || "");
														setNpiTaxonomy(preset.taxonomy || "");
														setNpiLocation(preset.location || "");
													}}
													size="sm"
													type="button"
													variant="outline"
												>
													{preset.label}
												</Button>
											))}
										</div>
									</div>
								</div>
							)}

							{/* FMCSA specific fields */}
							{sourceSelected === "fmcsa" && (
								<div className="space-y-4">
									<p className="text-gray-600 text-sm">
										Search for trucking companies and carriers in the FMCSA
										database
									</p>

									{/* Input Fields */}
									<div>
										<Label className="font-semibold text-gray-700 text-sm">
											Company Name
										</Label>
										<Input
											className="mt-2"
											onChange={(e) => setFmcsaCompanyName(e.target.value)}
											placeholder="e.g., ABC Trucking, XYZ Logistics"
											value={fmcsaCompanyName}
										/>
										<p className="mt-1 text-gray-500 text-xs">
											Search by carrier or broker name
										</p>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label className="font-semibold text-gray-700 text-sm">
												DOT Number
											</Label>
											<Input
												className="mt-2"
												onChange={(e) => setFmcsaDotNumber(e.target.value)}
												placeholder="e.g., 123456"
												value={fmcsaDotNumber}
											/>
											<p className="mt-1 text-gray-500 text-xs">
												US DOT number
											</p>
										</div>

										<div>
											<Label className="font-semibold text-gray-700 text-sm">
												MC Number
											</Label>
											<Input
												className="mt-2"
												onChange={(e) => setFmcsaMcNumber(e.target.value)}
												placeholder="e.g., 789012"
												value={fmcsaMcNumber}
											/>
											<p className="mt-1 text-gray-500 text-xs">MC number</p>
										</div>
									</div>

									<p className="text-gray-500 text-xs italic">
										* Enter at least one field above (company name, DOT, or MC
										number)
									</p>

									{/* Preset Buttons */}
									<div className="border-gray-200 border-t pt-4">
										<Label className="mb-2 block font-medium text-gray-700 text-sm">
											Quick Presets
										</Label>
										<div className="grid grid-cols-2 gap-2">
											{getPresetsForSource("fmcsa").map((preset) => (
												<Button
													className="justify-start text-xs"
													key={preset.label}
													onClick={() => {
														setFmcsaCompanyName(preset.companyName || "");
														setFmcsaDotNumber(preset.dotNumber || "");
														setFmcsaMcNumber(preset.mcNumber || "");
													}}
													size="sm"
													type="button"
													variant="outline"
												>
													{preset.label}
												</Button>
											))}
										</div>
									</div>
								</div>
							)}
						</form>
					</div>

					<SheetFooter className="border-gray-200 border-t px-6 pt-4">
						<div className="flex w-full space-x-3">
							<SheetClose asChild>
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
							</SheetClose>
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
									form="add-lead-form"
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
					</SheetFooter>
				</SheetContent>
			</Sheet>
			<ErrorLimitMessage
				message={errorUpgrade}
				onClose={() => setErrorUpgrade(null)}
			/>
		</>
	);
}
