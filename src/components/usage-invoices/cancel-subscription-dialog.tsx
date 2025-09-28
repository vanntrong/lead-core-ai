import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCancelSubscription } from "@/hooks/use-subscription";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function CancelSubscriptionDialog() {
  const cancelSubscriptionMutation = useCancelSubscription();

  const handleCancel = async () => {
    try {
      const result = await cancelSubscriptionMutation.mutateAsync();
      if (!result.success) {
        throw new Error(result.message || "Failed to cancel subscription. Please try again.");
      }
      toast.success("Subscription cancelled successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to cancel subscription. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-9 border border-red-400 text-red-600 bg-white hover:border-red-500 hover:text-red-700 transition-colors duration-150"
          size="sm"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Cancellation</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your subscription? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
            disabled={cancelSubscriptionMutation.isPending}
            onClick={handleCancel}
          >
            {cancelSubscriptionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm cancellation"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}