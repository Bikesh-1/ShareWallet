import { Suspense } from "react";
import PaymentSuccessContent from "../success-content";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading payment status...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
