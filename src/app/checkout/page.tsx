import { Suspense } from "react";
import CheckoutPageClient from "./CheckoutClient";
import { subscriptionService } from "@/services/subscription.service";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const activeSubscription = await subscriptionService.getUserActiveSubscription();

  if (activeSubscription) {
    redirect("/pricing");
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutPageClient />
    </Suspense>
  );
}
