import { Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDeleteLeadAdmin } from "@/hooks/use-lead-admin";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

export function DeleteLeadButton({ leadId }: Readonly<{ leadId: string }>) {
	const { mutateAsync, isPending } = useDeleteLeadAdmin();
	const [open, setOpen] = useState(false);

	const handleDelete = async () => {
		try {
			const result = await mutateAsync(leadId);
			if (!result.success) {
				throw new Error(result.message);
			}
			toast.success("Lead deleted successfully!");
			setOpen(false);
		} catch (error: any) {
			console.error("Error deleting lead:", error);
			toast.error(
				error?.message ||
				"Something went wrong. Please try again or contact support."
			);
		}
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>
				<Button
					aria-label="Delete Lead"
					className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-700 focus:ring-2 focus:ring-red-500/20"
					size="sm"
					title="Delete Lead"
					type="button"
					variant="ghost"
				>
					<XCircle aria-hidden="true" className="h-4 w-4 text-red-500" />
				</Button>
			</DialogTrigger>
			<DialogContent
				className="max-w-md rounded-lg p-6"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogTitle>Delete Lead</DialogTitle>
				<DialogDescription>
					Are you sure you want to permanently delete this lead? This action
					cannot be undone.
				</DialogDescription>
				<div className="mt-2 flex space-x-3 border-gray-200 border-t pt-6">
					<DialogClose asChild>
						<Button className="flex-1" type="button" variant="outline">
							Cancel
						</Button>
					</DialogClose>
					<Button
						className="flex-1 border border-red-400 bg-white text-red-600 transition-colors duration-150 hover:border-red-500 hover:text-red-700"
						disabled={isPending}
						onClick={handleDelete}
						type="button"
						variant="outline"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : (
							"Confirm deletion"
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
