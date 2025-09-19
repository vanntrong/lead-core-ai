"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { leadExportService } from "@/services/lead-export.service";
import { Input } from "@/components/ui/input";
import { z } from "zod";

interface ExportLeadData {
  format: "csv" | "google-sheets" | "zapier";
}

interface ExportLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leadData?: any; // Lead data to export
}

const ExportLeadSchema = z.object({
  format: z.enum(["csv", "google-sheets", "zapier"]),
  webhookUrl: z.string().optional(),
});

export function ExportLeadDialog({ isOpen, onClose, leadData }: ExportLeadDialogProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    register,
    setError,
  } = useForm<z.infer<typeof ExportLeadSchema>>({
    defaultValues: { format: undefined },
  });

  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const selectedFormat = watch("format");

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  const exportLead = async (data: z.infer<typeof ExportLeadSchema>) => {
    setSubmitError(null);
    setIsExporting(true);

    if (data.format === "zapier") {
      if (!data.webhookUrl) {
        setSubmitError("Please provide a Zapier webhook URL");
        setIsExporting(false);
        return;
      }
      // Validate Zapier webhook URL
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(data.webhookUrl)) {
        setError("webhookUrl", { message: "Please enter a valid Zapier webhook URL" });
        setIsExporting(false);
        return;
      }
    }

    try {
      switch (data.format) {
        case "csv":
          await exportToCSV();
          break;
        case "google-sheets":
          await exportToGoogleSheets();
          break;
        case "zapier":
          await exportToZapier(data.webhookUrl ?? "");
          break;
        default:
          throw new Error("Please select an export format");
      }

      toast.success(`Lead exported to ${data.format.replace("-", " ")} successfully!`);
      reset();
      onClose();
    } catch (error: any) {
      console.error("Error exporting lead:", error);
      setSubmitError(error?.message || "Something went wrong during export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    if (!leadData) throw new Error("No lead data to export");

    // Convert lead data to CSV format
    leadExportService.export({ format: "csv", leads: [leadData] })
  }

  const exportToGoogleSheets = async () => {
    // Implement Google Sheets export
    // This would typically involve Google Sheets API integration
    throw new Error("Google Sheets export coming soon!");
  };

  const exportToZapier = async (webhookUrl: string) => {
    if (!leadData) throw new Error("No lead data to export");
    if (!webhookUrl) throw new Error("No Zapier webhook URL provided");
    // Implement Zapier webhook export
    // This would send data to a Zapier webhook
    await leadExportService.export({ format: "zapier", webhookUrl, leads: [leadData] })
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto rounded-lg border-gray-200 bg-white shadow-2xl">
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
          <form className="space-y-6" onSubmit={handleSubmit(exportLead)}>
            {/* Export Format Field */}
            <div>
              <Label className="font-semibold text-gray-700 text-sm" htmlFor="format">
                Export Format *
              </Label>
              <Select
                onValueChange={(value) => setValue("format", value as ExportLeadData["format"], { shouldValidate: true })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select export format" >
                    {selectedFormat && (
                      <span className="capitalize">{selectedFormat.replace("-", " ")}</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center space-x-2">
                      <span>📊</span>
                      <div>
                        <div className="font-medium">CSV File</div>
                        <div className="text-sm text-gray-500">Download as spreadsheet file</div>
                      </div>
                    </div>
                  </SelectItem>
                  {/* <SelectItem value="google-sheets">
                    <div className="flex items-center space-x-2">
                      <span>📋</span>
                      <div>
                        <div className="font-medium">Google Sheets</div>
                        <div className="text-sm text-gray-500">Export directly to Google Sheets</div>
                      </div>
                    </div>
                  </SelectItem> */}
                  <SelectItem value="zapier">
                    <div className="flex items-center space-x-2">
                      <span>⚡</span>
                      <div>
                        <div className="font-medium">Zapier</div>
                        <div className="text-sm text-gray-500">Send to Zapier webhook</div>
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
                <Label className="font-semibold text-gray-700 text-sm" htmlFor="webhookUrl">
                  Zapier Webhook URL *
                </Label>
                <Input
                  type="text"
                  id="webhookUrl"
                  className="mt-2 w-full"
                  placeholder="https://hooks.zapier.com/..."
                  {...register("webhookUrl")}
                  required
                />
                {errors.webhookUrl && (
                  <p className="mt-2 text-red-600 text-sm" role="alert">
                    {errors.webhookUrl?.message}
                  </p>
                )}
              </div>
            )}

            {/* Format-specific info */}
            {selectedFormat && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600">
                  {selectedFormat === "csv" && "Your lead data will be downloaded as a CSV file that you can open in Excel or Google Sheets."}
                  {selectedFormat === "google-sheets" && "Your lead data will be exported directly to a new Google Sheets document."}
                  {selectedFormat === "zapier" && "Your lead data will be sent to your configured Zapier webhook for further automation."}
                </p>
              </div>
            )}

            <div className="flex space-x-3 border-gray-200 border-t pt-6 mt-2">
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
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={isExporting || isSubmitting || !selectedFormat}
                type="submit"
              >
                {(isExporting || isSubmitting) ? (
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
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
