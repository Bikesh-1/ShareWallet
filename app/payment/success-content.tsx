"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type PaymentState = "checking" | "success" | "pending" | "failed";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState<PaymentState>("checking");

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/payment/status?order_id=${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Unable to verify payment");
        if (cancelled) return;

        if (data.status === "SUCCESS") {
          setStatus("success");
          return;
        }

        if (data.status === "FAILED" || data.status === "USER_DROPPED") {
          setStatus("failed");
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          setStatus("pending");
          return;
        }

        window.setTimeout(checkStatus, 2500);
      } catch {
        if (!cancelled) setStatus("pending");
      }
    };

    void checkStatus();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const message = {
    checking: "Verifying your payment...",
    success: "Payment successful!",
    pending: "Payment is still being confirmed. Please refresh in a moment.",
    failed: "Payment failed or was cancelled.",
  }[status];

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="text-center">
        <h1 className="text-2xl font-bold">{message}</h1>
        {orderId && <p className="mt-2 text-sm text-gray-500">Order ID: {orderId}</p>}
        <a href="/dashboard" className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-white">
          Go to dashboard
        </a>
      </section>
    </main>
  );
}
