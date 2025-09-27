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
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageClient />
    </Suspense>
  );
}
