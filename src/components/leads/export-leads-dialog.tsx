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
// Google Sheets components - temporarily disabled
// import {
//     useGoogleAuth,
//     useGoogleCreateAndExportMultiple,
//     useGoogleExportMultiple,
// } from "@/hooks/use-google-api";
import { useUserActiveSubscription } from "@/hooks/use-subscription";
import { getLeadsAction } from "@/lib/actions/lead.actions";
import { leadExportService } from "@/services/lead-export.service";
import type { Lead, LeadFilters } from "@/types/lead";
// import { GoogleLoginBtn } from "../google-login-btn";
import { UpgradeButton } from "../upgrade-btn";

// import ExportGoogleSheetButton from "./export-google-sheet";
import { TownSendApiKeyDialog } from "./townsend-api-key-dialog";

interface ExportLeadsData {
    format: "csv" | "google-sheets" | "zapier" | "townsend";
}

interface ExportLeadsDialogProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly filters?: LeadFilters;
}

const ExportLeadsSchema = z.object({
    format: z.enum(["csv", "google-sheets", "zapier", "townsend"]),
    webhookUrl: z.string().optional(),
    spreadsheetId: z.string().optional(),
    spreadsheetNew: z.string().optional(),
});

export function ExportLeadsDialog({
    isOpen,
    onClose,
    filters,
}: ExportLeadsDialogProps) {
    const {
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
        register,
    } = useForm<z.infer<typeof ExportLeadsSchema>>({
        defaultValues: { format: undefined },
    });

    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [isExporting, setIsExporting] = React.useState(false);
    const [leadsData, setLeadsData] = React.useState<Lead[]>([]);
    const [isLoadingLeads, setIsLoadingLeads] = React.useState(false);
    const selectedFormat = watch("format");
    const { data: activeSubscription } = useUserActiveSubscription();

    // Google Sheets integration - temporarily disabled
    // const {
    //     login: handleGoogleLogin,
    //     logout: handleGoogleLogout,
    //     error: googleError,
    //     isLoading: isGoogleLoading,
    //     token: googleToken,
    //     isConnected: isGoogleConnected,
    // } = useGoogleAuth();
    // const [googleSheetMode, setGoogleSheetMode] = useState<"select" | "create">(
    //     "select"
    // );
    // const exportLeadsToSheet = useGoogleExportMultiple(googleToken ?? "");
    // const createNewAndExportLeadsToSheet = useGoogleCreateAndExportMultiple(
    //     googleToken ?? ""
    // );

    const [isTownSendApiKeyDialogOpen, setIsTownSendApiKeyDialogOpen] =
        useState(false);
    const [hasTownSendApiKey, setHasTownSendApiKey] = useState(false);

    const handleClose = () => {
        onClose();
    };

    // Retry state: list of attempts with status and error
    type RetryStatus = "pending" | "success" | "error" | "waiting";
    const [retryAttempts, setRetryAttempts] = React.useState<
        Array<{ attempt: number; status: RetryStatus; error?: string }>
    >([]);

    // Load leads based on filters when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsLoadingLeads(true);
            getLeadsAction(filters)
                .then((leads) => {
                    setLeadsData(leads);
                    setIsLoadingLeads(false);
                })
                .catch((error) => {
                    console.error("Failed to load leads:", error);
                    toast.error("Failed to load leads for export");
                    setIsLoadingLeads(false);
                });

            // Check if user has TownSend API key
            fetch("/api/townsend/api-key")
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.hasApiKey) {
                        setHasTownSendApiKey(true);
                    }
                })
                .catch((error) => {
                    console.error("Failed to check TownSend API key:", error);
                });
        }
    }, [isOpen, filters]);

    const exportLeads = async (data: z.infer<typeof ExportLeadsSchema>) => {
        if (leadsData.length === 0) {
            setSubmitError("No leads to export");
            return;
        }

        setSubmitError(null);
        setIsExporting(true);
        setRetryAttempts([]);

        let lastError: string | null = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            setRetryAttempts((prev) => [...prev, { attempt, status: "pending" }]);
            try {
                switch (data.format) {
                    case "csv":
                        await exportToCSV();
                        break;
                    // Google Sheets export - temporarily disabled
                    // case "google-sheets":
                    //     if (!isGoogleConnected) {
                    //         throw new Error("Please connect your Google account", {
                    //             cause: "validation",
                    //         });
                    //     }
                    //     if (googleSheetMode === "create") {
                    //         await createAndExportToGoogleSheets(data.spreadsheetNew ?? "");
                    //     } else {
                    //         await exportToGoogleSheets(data.spreadsheetId ?? "");
                    //     }
                    //     break;
                    case "zapier":
                        await exportToZapier(data.webhookUrl ?? "");
                        break;
                    case "townsend":
                        await exportToTownSend();
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
                    `${leadsData.length} lead${leadsData.length > 1 ? "s" : ""} exported to ${data.format.replace("-", " ")} successfully!`
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
        if (leadsData.length === 0) {
            throw new Error("No leads to export", { cause: "validation" });
        }

        // Convert leads data to CSV format
        leadExportService.export({ format: "csv", leads: leadsData });
    };

    // Google Sheets export functions - temporarily disabled
    // const exportToGoogleSheets = async (spreadsheetId: string) => {
    //     if (leadsData.length === 0) {
    //         throw new Error("No leads to export", { cause: "validation" });
    //     }
    //     if (!spreadsheetId) {
    //         throw new Error("Please select a Google Sheet", { cause: "validation" });
    //     }
    //     // Export multiple leads to Google Sheets
    //     const result = await exportLeadsToSheet.mutateAsync({
    //         leads: leadsData,
    //         selectedSheet: spreadsheetId,
    //     });
    //     if (!result.success) {
    //         throw new Error(
    //             result.message || "Failed to export leads to Google Sheets"
    //         );
    //     }
    //     return true;
    // };

    // const createAndExportToGoogleSheets = async (spreadsheetNew: string) => {
    //     if (leadsData.length === 0) {
    //         throw new Error("No leads to export", { cause: "validation" });
    //     }
    //     if (!spreadsheetNew) {
    //         throw new Error("Please enter a name for the new Google Sheet", {
    //             cause: "validation",
    //         });
    //     }
    //     // Create new sheet and export multiple leads
    //     const result = await createNewAndExportLeadsToSheet.mutateAsync({
    //         leads: leadsData,
    //         spreadsheetName: spreadsheetNew,
    //     });
    //     if (!result.success) {
    //         throw new Error(
    //             result.message || "Failed to create and export leads to Google Sheets"
    //         );
    //     }
    //     return true;
    // };

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
        if (leadsData.length === 0) {
            throw new Error("No leads to export", { cause: "validation" });
        }
        // Implement Zapier webhook export
        await leadExportService.export({
            format: "zapier",
            webhookUrl,
            leads: leadsData,
        });
        return true;
    };

    const exportToTownSend = async () => {
        if (leadsData.length === 0) {
            throw new Error("No leads to export", { cause: "validation" });
        }
        if (!hasTownSendApiKey) {
            throw new Error("Please configure your TownSend API key first", {
                cause: "validation",
            });
        }
        // Export to TownSend
        await leadExportService.export({
            format: "townsend",
            leads: leadsData,
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
                            <span>Export Leads</span>
                            <p className="mt-1 font-normal text-gray-600 text-sm">
                                {isLoadingLeads ? (
                                    "Loading leads..."
                                ) : (
                                    <>
                                        Export{" "}
                                        <span className="font-semibold text-indigo-600">
                                            {leadsData.length}
                                        </span>{" "}
                                        lead{leadsData.length !== 1 ? "s" : ""} to your preferred
                                        format.
                                    </>
                                )}
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

                    {/* Google Sheets error - temporarily disabled */}
                    {/* {googleError && (
                        <div className="mb-4">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{googleError}</AlertDescription>
                            </Alert>
                        </div>
                    )} */}

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

                    {isLoadingLeads ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                            <span className="ml-2 text-gray-600">Loading leads...</span>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit(exportLeads)}>
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
                                        setValue("format", value as ExportLeadsData["format"], {
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
                                        {/* Google Sheets export - temporarily disabled */}
                                        {/* <SelectItem value="google-sheets">
                                            <div className="flex items-center space-x-2">
                                                <span>📋</span>
                                                <div>
                                                    <div className="font-medium">Google Sheets</div>
                                                    <div className="text-gray-500 text-sm">
                                                        Export directly to Google Sheets
                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem> */}
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
                                        <SelectItem value="townsend">
                                            <div className="flex items-center space-x-2">
                                                <span>🎯</span>
                                                <div>
                                                    <div className="font-medium">TownSend</div>
                                                    <div className="text-gray-500 text-sm">
                                                        Export to TownSend audience
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

                            {/* Google Sheets export components - temporarily disabled */}
                            {/* {selectedFormat === "google-sheets" && (
                            {/* TownSend configuration */}
                            {selectedFormat === "townsend" && (
                                <div className="space-y-4">
                                    {!hasTownSendApiKey ? (
                                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                            <p className="mb-3 text-sm text-yellow-800">
                                                You need to configure your TownSend API key first.
                                            </p>
                                            <Button
                                                className="w-full"
                                                onClick={() => setIsTownSendApiKeyDialogOpen(true)}
                                                type="button"
                                                variant="outline"
                                            >
                                                Configure TownSend API Key
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => setIsTownSendApiKeyDialogOpen(true)}
                                            size="sm"
                                            type="button"
                                            variant="outline"
                                        >
                                            Update TownSend API Key
                                        </Button>
                                    )}

                                </div>
                            )}

                            {/* Google Sheets export button */}
                            {/* {selectedFormat === "google-sheets" && (
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
                                    <ExportGoogleSheetButton
                                        accessToken={googleToken ?? ""}
                                        mode={googleSheetMode}
                                        setMode={setGoogleSheetMode}
                                        setSpreadsheetId={setValue.bind(null, "spreadsheetId")}
                                        setSpreadsheetName={setValue.bind(null, "spreadsheetNew")}
                                    />
                                </>
                            )} */}

                            {/* Format-specific info */}
                            {selectedFormat && (
                                <div className="rounded-lg border bg-gray-50 p-3">
                                    <p className="text-gray-600 text-sm">
                                        {selectedFormat === "csv" &&
                                            `Your ${leadsData.length} lead${leadsData.length !== 1 ? "s" : ""} will be downloaded as a CSV file that you can open in Excel or Google Sheets.`}
                                        {/* Google Sheets info - temporarily disabled */}
                                        {/* {selectedFormat === "google-sheets" &&
                                            (isGoogleConnected ? (
                                                googleSheetMode === "create" ? (
                                                    <span>
                                                        Your {leadsData.length} lead
                                                        {leadsData.length !== 1 ? "s" : ""} will be exported
                                                        directly to a{" "}
                                                        <span className="rounded bg-indigo-50 px-1 font-semibold text-indigo-600">
                                                            New
                                                        </span>{" "}
                                                        Google Sheets document.
                                                        <br />
                                                    </span>
                                                ) : (
                                                    <span>
                                                        Your {leadsData.length} lead
                                                        {leadsData.length !== 1 ? "s" : ""} will be exported
                                                        to the existing Google Sheets document.
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
                                            ))} */}
                                        {selectedFormat === "zapier" &&
                                            `Your ${leadsData.length} lead${leadsData.length !== 1 ? "s" : ""} will be sent to your configured Zapier webhook for further automation.`}
                                        {selectedFormat === "townsend" &&
                                            (hasTownSendApiKey
                                                ? `Your ${leadsData.length} lead${leadsData.length !== 1 ? "s" : ""} with emails will be exported to TownSend. Only leads with emails will be included.`
                                                : "Configure your TownSend API key to enable exports. Only leads with emails will be included.")}
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
                                        disabled={
                                            isExporting ||
                                            isSubmitting ||
                                            !selectedFormat ||
                                            leadsData.length === 0
                                        }
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
                                                Export {leadsData.length} Lead
                                                {leadsData.length !== 1 ? "s" : ""}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                <TownSendApiKeyDialog
                    isOpen={isTownSendApiKeyDialogOpen}
                    onClose={() => setIsTownSendApiKeyDialogOpen(false)}
                    onSaved={() => {
                        setHasTownSendApiKey(true);
                        toast.success("TownSend API key configured successfully");
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
