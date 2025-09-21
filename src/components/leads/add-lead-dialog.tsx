"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle
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
import { AlertCircle, Crown, Globe, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AddLeadDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AddLeadDialog({ isOpen, onClose }: AddLeadDialogProps) {
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
	const router = useRouter();
	const createLeadMutation = useCreateLead();
	const { data: activeSubscription } = useUserActiveSubscription();

	const [submitError, setSubmitError] = React.useState<string | null>(null);

	const sourceSelected = watch("source");

	// Disable source if no active subscription or no sources available
	const isSourceDisabled = sourceSelected && !activeSubscription?.usage_limits?.sources?.includes(sourceSelected);

	const isNeedUpgrade =
		!activeSubscription ||
		(activeSubscription?.usage_limits?.current_leads ?? 0) >= (activeSubscription?.usage_limits?.max_leads ?? 0);

	const handleClose = () => {
		reset();
		setSubmitError(null);
		onClose();
	};

	const submitLead = async (data: CreateLeadData) => {
		setSubmitError(null);
		try {
			await createLeadMutation.mutateAsync(data);
			toast.success("Lead added successfully!");
			reset();
			onClose();
		} catch (error: any) {
			console.error("Error adding lead:", error);
			setSubmitError(error?.message || "Something went wrong. Please try again or contact support.");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-md mx-auto rounded-lg border-gray-200 bg-white shadow-2xl">
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
					<form className="space-y-6" onSubmit={handleSubmit(submitLead)}>
						{/* URL Field */}
						<div>
							<Label className="font-semibold text-gray-700 text-sm" htmlFor="url">
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
							<Label className="font-semibold text-gray-700 text-sm" htmlFor="source">
								Source
							</Label>
							<Select
								onValueChange={(value) => setValue("source", value as unknown as LeadSource, { shouldValidate: true })}
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
						<div className="flex space-x-3 border-gray-200 border-t pt-6 mt-2">
							<DialogClose asChild>
								<Button
									className="flex-1"
									disabled={createLeadMutation.isPending || isSubmitting}
									type="button"
									variant="outline"
								>
									Cancel
								</Button>
							</DialogClose>
							{
								(isSourceDisabled || isNeedUpgrade) ? (
									<Button
										className="flex-1 from-indigo-600 to-purple-600"
										type="button"
										onClick={() => router.push(activeSubscription ? '/dashboard/usage-invoices' : '/pricing')}
									>
										<Crown className="mr-2 h-4 w-4 text-yellow-300" />
										Upgrade to add lead
									</Button>
								) : (
									<Button
										className="flex-1 bg-indigo-600 hover:bg-indigo-700"
										disabled={createLeadMutation.isPending || isSubmitting}
										type="submit"
									>
										{(createLeadMutation.isPending || isSubmitting) ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating Lead...
											</>
										) : (
											<>
												Add Lead
											</>
										)}
									</Button>
								)
							}
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
