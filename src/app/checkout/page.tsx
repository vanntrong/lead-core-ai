"use client";
import { Suspense } from "react";
import CheckoutPageClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageClient />
    </Suspense>
  );
}
