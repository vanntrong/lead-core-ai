import { Button } from "@/components/ui/button";
import { useDeleteLeadAdmin } from "@/hooks/use-lead-admin";

import { Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";

export function DeleteLeadButton({ leadId }: Readonly<{ leadId: string }>) {
  const { mutateAsync, isPending } = useDeleteLeadAdmin();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await mutateAsync(leadId);
      toast.success("Lead deleted successfully!");
      setOpen(false);
    } catch (error: any) {
      console.error("Error deleting lead:", error);
      toast.error(error?.message || "Something went wrong. Please try again or contact support.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-700 focus:ring-2 focus:ring-red-500/20"
          size="sm"
          title="Delete Lead"
          variant="ghost"
          aria-label="Delete Lead"
          type="button"
        >
          <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-lg p-6">
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogDescription>
          Are you sure you want to permanently delete this lead? This action cannot be undone.
        </DialogDescription>
        <div className="flex space-x-3 border-gray-200 border-t pt-6 mt-2">
          <DialogClose asChild>
            <Button
              className="flex-1"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1 border border-red-400 text-red-600 bg-white hover:border-red-500 hover:text-red-700 transition-colors duration-150"
            variant="outline"
            type="button"
            disabled={isPending}
            onClick={handleDelete}
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