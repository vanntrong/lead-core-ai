"use client";

import { AlertCircle, Download, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import {
	useGoogleAuth,
	useGoogleCreateAndExport,
	useGoogleExport,
} from "@/hooks/use-google-api";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { leadExportService } from "@/services/lead-export.service";
import type { Lead } from "@/types/lead";
import { GoogleLoginBtn } from "../google-login-btn";
import { UpgradeButton } from "../upgrade-btn";
import ExportGoogleSheetButton from "./export-google-sheet";

interface ExportLeadData {
	format: "csv" | "google-sheets" | "zapier";
}

interface ExportLeadDialogProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly leadData?: Lead;
}

const ExportLeadSchema = z.object({
	format: z.enum(["csv", "google-sheets", "zapier"]),
	webhookUrl: z.string().optional(),
	spreadsheetId: z.string().optional(),
	spreadsheetNew: z.string().optional(),
});

export function ExportLeadDialog({
	isOpen,
	onClose,
	leadData,
}: ExportLeadDialogProps) {
	const {
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
		register,
	} = useForm<z.infer<typeof ExportLeadSchema>>({
		defaultValues: { format: undefined },
	});

	const [submitError, setSubmitError] = React.useState<string | null>(null);
	const [isExporting, setIsExporting] = React.useState(false);
	const selectedFormat = watch("format");
	const { data: activeSubscription } = useUserActiveSubscription();
	const {
		login: handleGoogleLogin,
		logout: handleGoogleLogout,
		error: googleError,
		isLoading: isGoogleLoading,
		token: googleToken,
		isConnected: isGoogleConnected,
	} = useGoogleAuth();
	const [googleSheetMode, setGoogleSheetMode] = useState<"select" | "create">(
		"select"
	);
	const exportLeadToSheet = useGoogleExport(googleToken ?? "");
	const createNewAndExportLeadToSheet = useGoogleCreateAndExport(
		googleToken ?? ""
	);

	const handleClose = () => {
		onClose();
	};

	// Retry state: list of attempts with status and error
	type RetryStatus = "pending" | "success" | "error" | "waiting";
	const [retryAttempts, setRetryAttempts] = React.useState<
		Array<{ attempt: number; status: RetryStatus; error?: string }>
	>([]);

	const exportLead = async (data: z.infer<typeof ExportLeadSchema>) => {
		setSubmitError(null);
		setIsExporting(true);
		setRetryAttempts([]);

		let lastError: string | null = null;
		for (let attempt = 1; attempt <= 3; attempt++) {
			setRetryAttempts((prev) => [...prev, { attempt, status: "pending" }]);
			try {
				switch (data.format) {
					case "csv":
						exportToCSV();
						break;
					case "google-sheets":
						if (!isGoogleConnected) {
							throw new Error("Please connect your Google account", {
								cause: "validation",
							});
						}
						if (googleSheetMode === "create") {
							await createAndExportToGoogleSheets(data.spreadsheetNew ?? "");
						} else {
							await exportToGoogleSheets(
								data.spreadsheetId ?? "",
								data.spreadsheetNew ?? ""
							);
						}
						break;
					case "zapier":
						await exportToZapier(data.webhookUrl ?? "");
						break;
					default:
						throw new Error("Please select an export format");
				}
				setRetryAttempts((prev) =>
					prev.map((r) =>
						r.attempt === attempt ? { ...r, status: "success" } : r
					)
				);
				toast.success(
					`Lead exported to ${data.format.replace("-", " ")} successfully!`
				);
				handleClose();
				lastError = null;
				break;
			} catch (error: any) {
				if (error?.cause === "validation") {
					setSubmitError(
						error?.message || "Validation error. Please check your input."
					);
					setIsExporting(false);
					return;
				}
				lastError =
					error?.message ||
					"Something went wrong during export. Please try again.";
				setRetryAttempts((prev) =>
					prev.map((r) =>
						r.attempt === attempt
							? { ...r, status: "error", error: lastError ?? undefined }
							: r
					)
				);
				if (attempt < 3) {
					// Show waiting status for next attempt
					setRetryAttempts((prev) => [
						...prev,
						{ attempt: attempt + 1, status: "waiting" },
					]);
					await new Promise((resolve) => setTimeout(resolve, 2000));
					// Remove waiting status after delay
					setRetryAttempts((prev) =>
						prev.filter(
							(r) => !(r.attempt === attempt + 1 && r.status === "waiting")
						)
					);
				}
			}
		}

		// If all attempts failed, show final error message
		if (lastError) {
			setSubmitError(
				"Export failed after 3 attempts. Please check your configuration and try again."
			);
		}

		setIsExporting(false);
	};

	const exportToCSV = () => {
		if (!leadData) {
			throw new Error("No lead data to export", { cause: "validation" });
		}

		// Convert lead data to CSV format
		leadExportService.export({ format: "csv", leads: [leadData] });
	};

	const exportToGoogleSheets = async (
		spreadsheetId: string,
		_sheetName: string
	) => {
		if (!leadData) {
			throw new Error("No lead data to export", { cause: "validation" });
		}
		if (!spreadsheetId) {
			throw new Error("Please select a Google Sheet", { cause: "validation" });
		}
		// Implement Google Sheets export
		// This would typically involve Google Sheets API integration
		const result = await exportLeadToSheet.mutateAsync({
			lead: leadData,
			selectedSheet: spreadsheetId,
		});
		if (!result.success) {
			throw new Error(
				result.message || "Failed to export lead to Google Sheets"
			);
		}
		return true;
	};

	const createAndExportToGoogleSheets = async (spreadsheetNew: string) => {
		if (!leadData) {
			throw new Error("No lead data to export", { cause: "validation" });
		}
		if (!spreadsheetNew) {
			throw new Error("Please enter a name for the new Google Sheet", {
				cause: "validation",
			});
		}
		// Implement Google Sheets export
		// This would typically involve Google Sheets API integration
		const result = await createNewAndExportLeadToSheet.mutateAsync({
			lead: leadData,
			spreadsheetName: spreadsheetNew,
		});
		if (!result.success) {
			throw new Error(
				result.message || "Failed to create and export lead to Google Sheets"
			);
		}
		return true;
	};

	const exportToZapier = async (webhookUrl: string) => {
		if (!webhookUrl) {
			throw new Error("Please enter a Zapier webhook URL", {
				cause: "validation",
			});
		}
		// Validate Zapier webhook URL
		const urlPattern = /^https?:\/\/.+/;
		if (!urlPattern.test(webhookUrl)) {
			throw new Error("Invalid webhook URL", { cause: "validation" });
		}
		if (!leadData) {
			throw new Error("No lead data to export", { cause: "validation" });
		}
		// Implement Zapier webhook export
		await leadExportService.export({
			format: "zapier",
			webhookUrl,
			leads: [leadData],
		});
		return true;
	};

	useEffect(() => {
		if (isOpen) {
			reset();
			setSubmitError(null);
			setRetryAttempts([]);
		}
	}, [isOpen, reset]);

	return (
		<Dialog onOpenChange={handleClose} open={isOpen}>
			<DialogContent
				className="mx-auto max-h-screen max-w-md overflow-y-auto rounded-lg border-gray-200 bg-white shadow-2xl"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center space-x-3 text-xl">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
							<Download className="h-5 w-5 text-indigo-600" />
						</div>
						<div>
							<span>Export Lead</span>
							<p className="mt-1 font-normal text-gray-600 text-sm">
								Export your lead data to your preferred format.
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

					{googleError && (
						<div className="mb-4">
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Error</AlertTitle>
								<AlertDescription>{googleError}</AlertDescription>
							</Alert>
						</div>
					)}

					{/* Retry Progress Display */}
					{retryAttempts.length > 1 && (
						<div className="mb-4">
							<div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
								<h4 className="mb-2 font-medium text-blue-800 text-sm">
									Export Progress
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
													<span className="text-blue-600">In progress...</span>
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

					<form className="space-y-6" onSubmit={handleSubmit(exportLead)}>
						{/* Export Format Field */}
						<div>
							<Label
								className="font-semibold text-gray-700 text-sm"
								htmlFor="format"
							>
								Export Format *
							</Label>
							<Select
								onValueChange={(value) => {
									setSubmitError(null);
									setRetryAttempts([]);
									setValue("format", value as ExportLeadData["format"], {
										shouldValidate: true,
									});
								}}
							>
								<SelectTrigger className="mt-2">
									<SelectValue placeholder="Select export format">
										{selectedFormat && (
											<span className="capitalize">
												{selectedFormat.replace("-", " ")}
											</span>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="csv">
										<div className="flex items-center space-x-2">
											<span>📊</span>
											<div>
												<div className="font-medium">CSV File</div>
												<div className="text-gray-500 text-sm">
													Download as spreadsheet file
												</div>
											</div>
										</div>
									</SelectItem>
									<SelectItem value="google-sheets">
										<div className="flex items-center space-x-2">
											<span>📋</span>
											<div>
												<div className="font-medium">Google Sheets</div>
												<div className="text-gray-500 text-sm">
													Export directly to Google Sheets
												</div>
											</div>
										</div>
									</SelectItem>
									<SelectItem value="zapier">
										<div className="flex items-center space-x-2">
											<span>⚡</span>
											<div>
												<div className="font-medium">Zapier</div>
												<div className="text-gray-500 text-sm">
													Send to Zapier webhook
												</div>
											</div>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
							{errors.format && (
								<p className="mt-2 text-red-600 text-sm" role="alert">
									Please select an export format
								</p>
							)}
						</div>

						{/* Zapier webhook URL field */}
						{selectedFormat === "zapier" && (
							<div>
								<Label
									className="font-semibold text-gray-700 text-sm"
									htmlFor="webhookUrl"
								>
									Zapier Webhook URL *
								</Label>
								<Input
									className="mt-2 w-full"
									id="webhookUrl"
									placeholder="https://hooks.zapier.com/..."
									type="text"
									{...register("webhookUrl")}
									disabled={!activeSubscription?.usage_limits?.zapier_export}
									required
								/>
							</div>
						)}

						{/* Google Sheets export button */}
						{selectedFormat === "google-sheets" && (
							<>
								<GoogleLoginBtn
									disabled={
										isExporting ||
										isSubmitting ||
										!activeSubscription?.usage_limits?.sheets_export
									}
									handleLogin={handleGoogleLogin}
									handleLogout={handleGoogleLogout}
									isConnected={isGoogleConnected}
									isLoading={isGoogleLoading}
								/>
								{leadData && (
									<ExportGoogleSheetButton
										accessToken={googleToken ?? ""}
										mode={googleSheetMode}
										setMode={setGoogleSheetMode}
										setSpreadsheetId={setValue.bind(null, "spreadsheetId")}
										setSpreadsheetName={setValue.bind(null, "spreadsheetNew")}
									/>
								)}
							</>
						)}

						{/* Format-specific info */}
						{selectedFormat && (
							<div className="rounded-lg border bg-gray-50 p-3">
								<p className="text-gray-600 text-sm">
									{selectedFormat === "csv" &&
										"Your lead data will be downloaded as a CSV file that you can open in Excel or Google Sheets."}
									{selectedFormat === "google-sheets" &&
										(isGoogleConnected ? (
											googleSheetMode === "create" ? (
												<span>
													Your lead data will be exported directly to a{" "}
													<span className="rounded bg-indigo-50 px-1 font-semibold text-indigo-600">
														New
													</span>{" "}
													Google Sheets document.
													<br />
												</span>
											) : (
												<span>
													Your lead data will be exported to the existing Google
													Sheets document.
													<br />
													<span className="font-semibold">
														The sheet name must be{" "}
														<span className="rounded bg-indigo-50 px-1 text-indigo-600">
															Leads
														</span>{" "}
														for correct export.
													</span>
												</span>
											)
										) : (
											"Please connect your Google account to export to Google Sheets."
										))}
									{selectedFormat === "zapier" &&
										"Your lead data will be sent to your configured Zapier webhook for further automation."}
								</p>
							</div>
						)}

						<div className="mt-2 flex space-x-3 border-gray-200 border-t pt-6">
							<DialogClose asChild>
								<Button
									className="flex-1"
									disabled={isExporting || isSubmitting}
									type="button"
									variant="outline"
								>
									Cancel
								</Button>
							</DialogClose>
							{(!activeSubscription?.usage_limits?.zapier_export &&
								selectedFormat === "zapier") ||
								(!activeSubscription?.usage_limits?.sheets_export &&
									selectedFormat === "google-sheets") ? (
								<UpgradeButton
									className="flex-1"
									currentPlan={
										selectedFormat === "zapier"
											? "pro"
											: (activeSubscription?.plan_tier ?? "trial")
									}
									title="Upgrade to export"
								/>
							) : (
								<Button
									className="flex-1 bg-indigo-600 hover:bg-indigo-700"
									disabled={isExporting || isSubmitting || !selectedFormat}
									type="submit"
								>
									{isExporting || isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Exporting...
										</>
									) : (
										<>
											<Download className="mr-2 h-4 w-4" />
											Export Lead
										</>
									)}
								</Button>
							)}
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
