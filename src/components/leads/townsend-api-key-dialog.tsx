"use client";

import { AlertCircle, Key, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
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

interface TownSendApiKeyDialogProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onSaved: () => void;
}

export function TownSendApiKeyDialog({
    isOpen,
    onClose,
    onSaved,
}: TownSendApiKeyDialogProps) {
    const [apiKey, setApiKey] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!apiKey.trim()) {
            setError("Please enter your TownSend API key");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/townsend/api-key", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ apiKey: apiKey.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Failed to save API key");
                return;
            }

            if (!data.success) {
                setError(data.message || "Failed to save API key");
                return;
            }

            toast.success("TownSend API key saved successfully");
            setApiKey("");
            onSaved();
            onClose();
        } catch (error: any) {
            console.error("Error saving TownSend API key:", error);
            setError(error.message || "Failed to save API key");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setApiKey("");
        setError(null);
        onClose();
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent
                className="mx-auto max-w-md rounded-lg border-gray-200 bg-white shadow-2xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3 text-xl">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                            <Key className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <span>TownSend API Key</span>
                            <p className="mt-1 font-normal text-gray-600 text-sm">
                                Enter your TownSend API key to enable lead exports
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div>
                        <Label
                            className="font-semibold text-gray-700 text-sm"
                            htmlFor="apiKey"
                        >
                            API Key *
                        </Label>
                        <Input
                            className="mt-2 w-full"
                            disabled={isSubmitting}
                            id="apiKey"
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your TownSend API key"
                            required
                            type="password"
                            value={apiKey}
                        />
                        <p className="mt-2 text-gray-500 text-xs">
                            Your API key will be stored securely and used only for exporting
                            leads to TownSend.
                        </p>
                    </div>

                    <div className="rounded-lg border bg-blue-50 p-3">
                        <p className="text-blue-800 text-sm">
                            <strong>How to get your API key:</strong>
                            <br />
                            1. Log in to your TownSend account
                            <br />
                            2. Go to Settings → API Keys
                            <br />
                            3. Generate a new API key or copy an existing one
                        </p>
                    </div>

                    <div className="flex space-x-3 border-gray-200 border-t pt-6">
                        <DialogClose asChild>
                            <Button
                                className="flex-1"
                                disabled={isSubmitting}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                            disabled={isSubmitting || !apiKey.trim()}
                            type="submit"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save API Key"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
