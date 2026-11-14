"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => {
      checkout: (config: { paymentSessionId: string; redirectTarget: "_self" | "_blank" | "_modal" }) => Promise<void>;
    };
  }
}

type Repayment = { id: string; amount: number; status: string; provider?: string | null; providerReference?: string | null; createdAt: string };

export default function RepayLoanPage() {
  const { groupCode, requestId } = useParams<{ groupCode: string; requestId: string }>();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [cashfreeReady, setCashfreeReady] = useState(false);
  const { data, isPending: loading, refetch } = useQuery<{
    originalAmount: number; repaidAmount: number; pendingAmount: number;
    outstandingAmount: number; repayments: Repayment[]; walletBalance: number;
  }>({
    queryKey: ["loan-repayment", groupCode, requestId],
    queryFn: async () => {
      const res = await fetch(`/api/group/${encodeURIComponent(groupCode)}/sendRequest/${encodeURIComponent(requestId)}/repay`, { cache: "no-store" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Unable to load repayment details.");
      return result;
    },
    enabled: !!groupCode && !!requestId,
    staleTime: 2_000,
    refetchInterval: (query) => (query.state.data?.pendingAmount || 0) > 0 ? 5_000 : false,
    refetchIntervalInBackground: false,
  });
  const load = async () => { await refetch(); };

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const scriptId = "cashfree-checkout-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const markReady = () => { if (window.Cashfree) setCashfreeReady(true); };
    if (window.Cashfree) { markReady(); return; }
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", markReady);
    return () => script?.removeEventListener("load", markReady);
  }, []);

  async function refreshPending() {
    const pending = data?.repayments.find((item) => item.status === "PENDING" && item.providerReference);
    if (!pending?.providerReference) return toast.error("No pending Cashfree order was found.");
    try {
      const res = await fetch(`/api/payment/status?order_id=${encodeURIComponent(pending.providerReference)}`, { cache: "no-store" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Unable to verify payment.");
      if (result.status === "SUCCESS") toast.success("Repayment confirmed.");
      else if (result.status === "FAILED") toast.error("Payment failed. You can try again.");
      else toast.message("Cashfree is still processing this payment.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify payment.");
    } finally {
    }
  }

  async function repay(method: "wallet" | "cashfree") {
    const value = Number(amount);
    if (!Number.isSafeInteger(value) || value <= 0) return toast.error("Enter a valid repayment amount.");
    if (!data || value > data.outstandingAmount) return toast.error("Amount cannot exceed the outstanding loan.");
    if (method === "wallet" && value > data.walletBalance) return toast.error("Insufficient ShareWallet balance.");
    if (method === "cashfree" && (!window.Cashfree || !cashfreeReady)) return toast.error("Cashfree checkout is still loading. Please try again.");
    try {
      setPaying(true);
      const res = await fetch(`/api/group/${groupCode}/sendRequest/${requestId}/repay`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method, amount: value }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Unable to process repayment.");
      if (method === "wallet") {
        toast.success(result.message || "Repayment successful.");
        await load();
        return;
      }
      const cashfree = window.Cashfree!({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox" });
      await cashfree.checkout({ paymentSessionId: result.paymentSessionId, redirectTarget: "_modal" });
      toast.message("Checking Cashfree payment status...");
      const statusResponse = await fetch(`/api/payment/status?order_id=${encodeURIComponent(result.orderId)}`, { cache: "no-store" });
      const statusData = await statusResponse.json();
      if (statusResponse.ok && statusData.status === "SUCCESS") toast.success("Cashfree repayment received.");
      else if (statusData.status === "FAILED") toast.error("Payment failed. You can try again.");
      else toast.message("Payment is still processing. Refresh in a moment.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Repayment failed.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black md:px-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm font-medium hover:opacity-60"><ArrowLeft size={18} /> Back</button>
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-gray-100 p-3"><Wallet size={22} /></div><div><p className="text-sm text-gray-500">ShareWallet loan</p><h1 className="text-2xl font-bold">Repay emergency fund</h1></div></div>
          {loading ? <p className="py-12 text-center text-sm text-gray-500">Loading repayment details...</p> : data && <>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-500">Original payout</p><p className="mt-1 text-xl font-bold">₹{data.originalAmount.toLocaleString("en-IN")}</p></div>
              <div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-500">Already repaid</p><p className="mt-1 text-xl font-bold">₹{data.repaidAmount.toLocaleString("en-IN")}</p></div>
              <div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-500">Pending payment</p><p className="mt-1 text-xl font-bold">₹{data.pendingAmount.toLocaleString("en-IN")}</p></div>
              <div className="rounded-xl bg-[#F2F0FF] p-4"><p className="text-xs text-[#4F47EA]">Outstanding</p><p className="mt-1 text-xl font-bold text-[#4F47EA]">₹{data.outstandingAmount.toLocaleString("en-IN")}</p></div>
            </div>
            {data.outstandingAmount > 0 ? <>
              <div className="mt-7">
                <label className="mb-2 block text-sm font-semibold">Repayment amount (₹)</label>
                <input type="number" min="1" max={data.outstandingAmount} step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg outline-none focus:border-[#4F47EA]" />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500"><span>Wallet balance: ₹{data.walletBalance.toLocaleString("en-IN")}</span><button type="button" onClick={() => setAmount(String(data.outstandingAmount))} className="font-semibold text-[#4F47EA]">Pay full outstanding amount</button></div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={() => repay("wallet")} disabled={paying || Number(amount) > data.walletBalance} className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Wallet size={18} /> {paying ? "Processing..." : "Pay from wallet"}</button>
                <button onClick={() => repay("cashfree")} disabled={paying || !cashfreeReady} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">{paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />} Pay with UPI / Cashfree</button>
              </div>
              <p className="mt-4 text-xs leading-5 text-gray-500">Wallet repayments are transferred back to the group balance immediately. UPI/Cashfree repayments update the group balance only after Cashfree confirms successful payment.</p>
            </> : data.pendingAmount > 0 ? <div className="mt-7 rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm font-semibold text-yellow-800">A repayment of ₹{data.pendingAmount.toLocaleString("en-IN")} is awaiting Cashfree confirmation. <button type="button" onClick={refreshPending} className="ml-2 underline">Check payment status</button></div> : <div className="mt-7 rounded-xl border border-green-200 bg-green-50 p-5 text-sm font-semibold text-green-700">This loan has been fully repaid. Thank you.</div>}
          </>}
        </section>
        {data?.repayments?.length ? <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Repayment history</h2><div className="mt-4 divide-y divide-gray-100">{data.repayments.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm"><div><p className="font-semibold">₹{item.amount.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-gray-500">{item.provider === "CASHFREE" ? "UPI / Cashfree" : "ShareWallet Wallet"} · {new Date(item.createdAt).toLocaleString()}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "SUCCESS" ? "bg-green-100 text-green-700" : item.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{item.status}</span></div>)}</div></section> : null}
      </div>
    </main>
  );
}
