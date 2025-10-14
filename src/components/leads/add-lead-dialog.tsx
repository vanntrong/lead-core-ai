"use client";

import { AlertCircle, Check, Globe, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getPresetsForSource } from "@/constants/vertical-presets";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import {
	bulkCreateLeadsAction,
	scrapeLeadsAction,
} from "@/lib/actions/lead.actions";
import type { CreateLeadData, LeadSource } from "@/types/lead";
import { UpgradeButton } from "../upgrade-btn";
import { ErrorLimitMessage } from "./error-limit-message";

interface AddLeadDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onLeadAdded?: () => void;
}

interface ScrapedLead {
	url: string;
	title: string;
	desc: string;
	emails: string[];
	phone?: string;
	address?: string;
	website?: string;
	rating?: number;
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
		formState: { errors },
	} = useForm<CreateLeadData>({
		defaultValues: { url: "", source: undefined },
	});
	const { data: activeSubscription } = useUserActiveSubscription();
	const [submitError, setSubmitError] = React.useState<string | null>(null);
	const [errorUpgrade, setErrorUpgrade] = useState<string | null>(null);

	// Scraping state
	const [isScraping, setIsScraping] = useState(false);
	const [scrapedResults, setScrapedResults] = useState<ScrapedLead[]>([]);
	const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
	const [isSaving, setIsSaving] = useState(false);
	const [viewingLead, setViewingLead] = useState<ScrapedLead | null>(null);

	// State for source-specific fields
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
		setScrapedResults([]);
		setSelectedLeads(new Set());
		onClose();
	};

	const handleSearchLeads = async (data: CreateLeadData) => {
		setSubmitError(null);
		setIsScraping(true);
		setScrapedResults([]);
		setSelectedLeads(new Set());

		// Construct URL based on source type for new sources
		const finalData = { ...data };
		if (data.source === "google_places") {
			if (!googlePlacesKeyword) {
				setSubmitError("Please enter a keyword to search for");
				setIsScraping(false);
				return;
			}
			finalData.url = JSON.stringify({
				keyword: googlePlacesKeyword,
				location: googlePlacesLocation,
			});
		} else if (data.source === "npi_registry") {
			if (!(npiProviderName || npiTaxonomy)) {
				setSubmitError("Please enter either a provider name or specialty");
				setIsScraping(false);
				return;
			}
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
				setIsScraping(false);
				return;
			}
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

		try {
			const result = await scrapeLeadsAction(finalData);
			if (!result.success) {
				throw new Error(
					result.message || "Failed to scrape leads. Please try again."
				);
			}

			if (!result.results || result.results.length === 0) {
				setSubmitError("No leads found matching your criteria");
				return;
			}

			setScrapedResults(result.results);
			// Auto-select all leads
			setSelectedLeads(new Set(result.results.map((_, idx) => idx)));
		} catch (error: any) {
			console.error("Error scraping leads:", error);
			if (error.message === "Lead limit exceeded") {
				setErrorUpgrade(error.message);
			} else {
				// Detect errorType and message from '[errorType] message' format
				let errorMessage =
					error?.message || "Failed to scrape leads. Please try again.";
				const match = errorMessage.match(/^\[(.+?)\]\s*(.*)$/);
				if (match) {
					errorMessage = match[2] || errorMessage;
				}
				setSubmitError(errorMessage);
			}
		} finally {
			setIsScraping(false);
		}
	};

	const handleSaveSelectedLeads = async () => {
		if (selectedLeads.size === 0) {
			toast.error("Please select at least one lead to save");
			return;
		}

		setIsSaving(true);
		setSubmitError(null);

		try {
			const leadsToSave = Array.from(selectedLeads).map((index) => {
				const lead = scrapedResults[index];
				return {
					url: lead.url,
					source: sourceSelected as LeadSource,
					scrapInfo: {
						title: lead.title,
						desc: lead.desc,
						emails: lead.emails,
						phone: lead.phone,
						address: lead.address,
						website: lead.website,
						rating: lead.rating,
					},
				};
			});

			const result = await bulkCreateLeadsAction(leadsToSave);

			if (!result.success) {
				throw new Error(result.message || "Failed to save leads");
			}

			toast.success(`${result.count} lead(s) saved successfully!`);
			onLeadAdded?.();
			handleClose();
		} catch (error: any) {
			console.error("Error saving leads:", error);
			if (
				error.message === "Lead limit exceeded" ||
				error.message?.includes("exceed your limit")
			) {
				setErrorUpgrade(error.message);
			} else {
				setSubmitError(error?.message || "Failed to save leads");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const toggleSelectAll = () => {
		if (selectedLeads.size === scrapedResults.length) {
			setSelectedLeads(new Set());
		} else {
			setSelectedLeads(new Set(scrapedResults.map((_, idx) => idx)));
		}
	};

	const toggleLeadSelection = (index: number) => {
		const newSelected = new Set(selectedLeads);
		if (newSelected.has(index)) {
			newSelected.delete(index);
		} else {
			newSelected.add(index);
		}
		setSelectedLeads(newSelected);
	};

	useEffect(() => {
		if (isOpen) {
			reset();
			setSubmitError(null);
			setScrapedResults([]);
			setSelectedLeads(new Set());
			// Reset source-specific fields
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
					className="w-full overflow-y-auto border-gray-200 bg-white sm:max-w-4xl lg:max-w-5xl"
					side="right"
				>
					<SheetHeader className="border-gray-200 border-b px-6 pb-4">
						<SheetTitle className="flex items-center space-x-3 text-xl">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
								<Globe className="h-5 w-5 text-indigo-600" />
							</div>
							<div className="flex-1">
								<span className="block text-gray-900">Add Leads</span>
								<SheetDescription className="mt-1 font-normal text-gray-600 text-sm">
									{scrapedResults.length === 0
										? "Search for leads and select which ones to save."
										: `Found ${scrapedResults.length} lead(s). Select the ones you want to save.`}
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

						{/* Show search form only when no results */}
						{scrapedResults.length === 0 && (
							<form
								className="space-y-6"
								id="add-lead-form"
								onSubmit={handleSubmit(handleSearchLeads)}
							>
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
											<SelectItem value="google_places">
												Google Places
											</SelectItem>
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
												onChange={(e) =>
													setGooglePlacesLocation(e.target.value)
												}
												placeholder="e.g., New York, NY or San Francisco, CA"
												value={googlePlacesLocation}
											/>
											<p className="mt-1 text-gray-500 text-xs">
												City, state, or region (optional)
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
												Last name or business name (optional)
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
						)}

						{/* Show results table when we have scraped data */}
						{scrapedResults.length > 0 && (
							<div className="space-y-4">
								{/* Select All Button */}
								<div className="flex items-center justify-between">
									<Button
										onClick={toggleSelectAll}
										size="sm"
										type="button"
										variant="outline"
									>
										{selectedLeads.size === scrapedResults.length
											? "Deselect All"
											: "Select All"}
									</Button>
									<p className="text-gray-600 text-sm">
										{selectedLeads.size} of {scrapedResults.length} selected
									</p>
								</div>

								{/* Results Table */}
								<div className="rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-12">Save</TableHead>
												<TableHead className="min-w-[200px]">
													Business Name
												</TableHead>
												<TableHead className="min-w-[250px]">
													Description
												</TableHead>
												<TableHead>Email</TableHead>
												<TableHead>Phone</TableHead>
												<TableHead>Address</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{scrapedResults.map((lead, index) => (
												<TableRow
													className="cursor-pointer hover:bg-gray-50"
													key={`lead-${lead.url}-${index}`}
													onClick={(e) => {
														// Don't trigger row click when clicking checkbox
														if (
															(e.target as HTMLElement).closest(
																'[role="checkbox"]'
															)
														) {
															return;
														}
														setViewingLead(lead);
													}}
												>
													<TableCell onClick={(e) => e.stopPropagation()}>
														<Checkbox
															checked={selectedLeads.has(index)}
															onCheckedChange={() => toggleLeadSelection(index)}
														/>
													</TableCell>
													<TableCell className="font-medium">
														<div
															className="max-w-[200px] truncate"
															title={lead.title}
														>
															{lead.title || "N/A"}
														</div>
													</TableCell>
													<TableCell>
														<div
															className="max-w-[250px] truncate text-gray-600 text-sm"
															title={lead.desc}
														>
															{lead.desc || "N/A"}
														</div>
													</TableCell>
													<TableCell>
														<div className="max-w-[150px] truncate text-sm">
															{lead.emails.length > 0 ? lead.emails[0] : "N/A"}
														</div>
													</TableCell>
													<TableCell>
														<div className="text-sm">{lead.phone || "N/A"}</div>
													</TableCell>
													<TableCell>
														<div
															className="max-w-[200px] truncate text-gray-600 text-sm"
															title={lead.address}
														>
															{lead.address || "N/A"}
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								{/* Back to Search Button */}
								<Button
									onClick={() => {
										setScrapedResults([]);
										setSelectedLeads(new Set());
										setSubmitError(null);
									}}
									size="sm"
									type="button"
									variant="ghost"
								>
									← Back to Search
								</Button>
							</div>
						)}
					</div>

					<SheetFooter className="border-gray-200 border-t px-6 pt-4">
						<div className="flex w-full space-x-3">
							<SheetClose asChild>
								<Button
									className="flex-1"
									disabled={isScraping || isSaving}
									type="button"
									variant="outline"
								>
									Cancel
								</Button>
							</SheetClose>

							{scrapedResults.length === 0 ? (
								// Show search button when no results
								isSourceDisabled ? (
									<UpgradeButton
										className="flex-1"
										currentPlan={activeSubscription?.plan_tier ?? "trial"}
										title="Upgrade to add lead"
									/>
								) : (
									<Button
										className="flex-1 bg-indigo-600 hover:bg-indigo-700"
										disabled={isScraping}
										form="add-lead-form"
										type="submit"
									>
										{isScraping ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Searching...
											</>
										) : (
											"Search Leads"
										)}
									</Button>
								)
							) : (
								// Show save button when we have results
								<Button
									className="flex-1 bg-green-600 hover:bg-green-700"
									disabled={isSaving || selectedLeads.size === 0}
									onClick={handleSaveSelectedLeads}
									type="button"
								>
									{isSaving ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Check className="mr-2 h-4 w-4" />
											Save Selected Leads ({selectedLeads.size})
										</>
									)}
								</Button>
							)}
						</div>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			{/* Lead Detail Dialog */}
			<Dialog
				onOpenChange={() => setViewingLead(null)}
				open={viewingLead !== null}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="font-semibold text-gray-900 text-xl">
							Lead Details
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Full information for this lead
						</DialogDescription>
					</DialogHeader>

					{viewingLead && (
						<div className="mt-4 space-y-4">
							{/* Business Name */}
							<div>
								<Label className="font-medium text-gray-700 text-sm">
									Business Name
								</Label>
								<p className="mt-1.5 text-gray-900">
									{viewingLead.title || "N/A"}
								</p>
							</div>

							{/* Description */}
							<div>
								<Label className="font-medium text-gray-700 text-sm">
									Description
								</Label>
								<p className="mt-1.5 text-gray-600 text-sm leading-relaxed">
									{viewingLead.desc || "N/A"}
								</p>
							</div>

							{/* Email(s) */}
							<div>
								<Label className="font-medium text-gray-700 text-sm">
									Email(s)
								</Label>
								<div className="mt-1.5 space-y-1">
									{viewingLead.emails.length > 0 ? (
										viewingLead.emails.map((email, idx) => (
											<p
												className="text-gray-900 text-sm"
												key={`email-${idx}-${email}`}
											>
												{email}
											</p>
										))
									) : (
										<p className="text-gray-500 text-sm">N/A</p>
									)}
								</div>
							</div>

							{/* Phone */}
							{viewingLead.phone && (
								<div>
									<Label className="font-medium text-gray-700 text-sm">
										Phone
									</Label>
									<p className="mt-1.5 text-gray-900">{viewingLead.phone}</p>
								</div>
							)}

							{/* Address */}
							{viewingLead.address && (
								<div>
									<Label className="font-medium text-gray-700 text-sm">
										Address
									</Label>
									<p className="mt-1.5 text-gray-900">{viewingLead.address}</p>
								</div>
							)}

							{/* Website */}
							{viewingLead.website && (
								<div>
									<Label className="font-medium text-gray-700 text-sm">
										Website
									</Label>
									<a
										className="mt-1.5 block text-indigo-600 text-sm hover:text-indigo-700 hover:underline"
										href={viewingLead.website}
										rel="noopener noreferrer"
										target="_blank"
									>
										{viewingLead.website}
									</a>
								</div>
							)}

							{/* Rating */}
							{viewingLead.rating && (
								<div>
									<Label className="font-medium text-gray-700 text-sm">
										Rating
									</Label>
									<p className="mt-1.5 text-gray-900">
										⭐ {viewingLead.rating.toFixed(1)}
									</p>
								</div>
							)}

							{/* URL */}
							<div>
								<Label className="font-medium text-gray-700 text-sm">
									Source URL
								</Label>
								<a
									className="mt-1.5 block break-all text-indigo-600 text-sm hover:text-indigo-700 hover:underline"
									href={viewingLead.url}
									rel="noopener noreferrer"
									target="_blank"
								>
									{viewingLead.url}
								</a>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<ErrorLimitMessage
				message={errorUpgrade}
				onClose={() => setErrorUpgrade(null)}
			/>
		</>
	);
}
