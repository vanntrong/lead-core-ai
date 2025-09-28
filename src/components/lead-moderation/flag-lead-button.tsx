import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "@/components/ui/button";
import { useFlagLeadAdmin } from "@/hooks/use-lead-admin";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function FlagLeadButton({ leadId }: Readonly<{ leadId: string }>) {
  const { mutateAsync, isPending } = useFlagLeadAdmin();
  const [open, setOpen] = useState(false);

  const handleFlag = async () => {
    try {
      const result = await mutateAsync(leadId);
      if (!result.success) {
        throw new Error(result.message);
      }
      toast.success("Lead flagged successfully!");
      setOpen(false);
    } catch (error: any) {
      console.error("Error flagging lead:", error);
      toast.error(error?.message || "Something went wrong. Please try again or contact support.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-7 w-7 p-0 hover:bg-orange-100 hover:text-orange-700 focus:ring-2 focus:ring-orange-500/20"
          size="sm"
          title="Flag Lead"
          variant="ghost"
          aria-label="Flag Lead"
          type="button"
        >
          <ShieldAlert className="h-4 w-4 text-orange-500" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-lg p-6" onInteractOutside={e => e.preventDefault()}>
        <DialogTitle>Flag Lead</DialogTitle>
        <DialogDescription>
          Are you sure you want to flag this lead? Flagged leads are excluded from exports and marked for moderation.
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
            className="flex-1 border border-orange-400 text-orange-600 bg-white hover:border-orange-500 hover:text-orange-700 transition-colors duration-150"
            variant="outline"
            type="button"
            disabled={isPending}
            onClick={handleFlag}
          >
            {isPending ? (
              <>
                Flagging...
              </>
            ) : (
              "Confirm flag"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
