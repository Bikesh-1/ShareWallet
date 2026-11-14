"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import LoginNavbar from "@/components/loginNavbar";
import { useContributionDetail, useGroupContribution } from "@/hooks/useGroupContribution";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contribution } from "@/services/contribution.service";
import { toast } from "sonner";
import { sendRequest, updateRequestApproval } from "@/services/request.service";
import type { SendRequestPayload } from "@/types/request";
import { useGroupRequests } from "@/hooks/useGroupRequests";




export default function GroupPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [openContri, setOpenContri] = useState(false);
  const [openRequest, setOpenRequest] = useState(false);
  const [activityFilter, setActivityFilter] = useState<"ALL" | "CONTRIBUTIONS" | "REQUESTS">("ALL");
  const params = useParams();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [processingRequest, setProcessingRequest] = useState<{
    id: string;
    status: "ACCEPTED" | "REJECTED";
  } | null>(null);
  const groupCode = params.groupCode as string;
  const router = useRouter();
  const {
    data: groupDetails,
    isPending: isGroupDetailsPending,
    isError: isGroupDetailsError,
    error: errorGroupDetails

  } = useGroupContribution(groupCode);

  const {
    data: contributionDetails,
    isPending: isContributionPending,
    isError: isContributionError,
    error: errorContribution
  } = useContributionDetail(groupCode);

  const {
    data: groupRequests,
    isPending: isRequestsPending,
    isError: isRequestsError,
    error: errorRequests,
  } = useGroupRequests(groupCode);


  const queryClient = useQueryClient();
  const { data: financialSummary } = useQuery<{
    totalContributions: number;
    contributionCount: number;
    pendingContributionAmount: number;
    pendingContributionCount: number;
    totalPayouts: number;
    totalRefunds: number;
    netFlow: number;
    totalRequests: number;
  }>({
    queryKey: ["group-financial-summary", groupCode],
    queryFn: async () => {
      const response = await fetch(`/api/group/${encodeURIComponent(groupCode)}/financial-dashboard`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load group finances");
      return result.summary;
    },
    enabled: !!groupCode,
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const money = (value: number) =>
    Number(value || 0).toLocaleString("en-IN");

  const mutation = useMutation({
    mutationFn: contribution,
    onSuccess: async (data) => {
      try {
        if (!data.contribution?.id) {
          throw new Error("Contribution record was not returned by the server.");
        }

        const orderResponse = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contributionId: data.contribution.id }),
        });
        const orderData = await orderResponse.json();
        if (!orderResponse.ok) {
          throw new Error(orderData.error || "Unable to create Cashfree order.");
        }
        if (!orderData.paymentSessionId) {
          throw new Error("Cashfree payment session was not created.");
        }

        if (!window.Cashfree) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector<HTMLScriptElement>("#cashfree-sdk");
            const script = existing || document.createElement("script");
            const onLoad = () => window.Cashfree ? resolve() : reject(new Error("Cashfree SDK failed to initialize."));
            const onError = () => reject(new Error("Unable to load Cashfree SDK."));
            script.addEventListener("load", onLoad, { once: true });
            script.addEventListener("error", onError, { once: true });
            if (!existing) {
              script.id = "cashfree-sdk";
              script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
              script.async = true;
              document.head.appendChild(script);
            }
          });
        }

        if (!window.Cashfree) throw new Error("Cashfree SDK is unavailable.");
        const cashfree = window.Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox",
        });
        setOpenContri(false);
        await cashfree.checkout({
          paymentSessionId: orderData.paymentSessionId,
          redirectTarget: "_self",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to start Cashfree payment.");
      }
      queryClient.invalidateQueries({
        queryKey: ["group", groupCode],
      })
      queryClient.invalidateQueries({ queryKey: ["contribution", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["group-financial-summary", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["group-financial-dashboard", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["group-transactions", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setOpenContri(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const requestMutation = useMutation({
    mutationFn: ({
      groupCode,
      data,
    }: {
      groupCode: string;
      data: SendRequestPayload;
    }) => sendRequest(groupCode, data),

    onSuccess: (data) => {
      toast.success(data.message);

      queryClient.invalidateQueries({
        queryKey: ["group", groupCode],
      });
      queryClient.invalidateQueries({ queryKey: ["requests", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["group-financial-summary", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["group-financial-dashboard", groupCode] });

      setOpenRequest(false);
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({
      groupCode,
      requestId,
      status,
    }: {
      groupCode: string;
      requestId: string;
      status: "ACCEPTED" | "REJECTED";
    }) =>
      updateRequestApproval(groupCode, requestId, {
        status: status === "ACCEPTED" ? "APPROVED" : "REJECTED",
      }),

    onSuccess: (data) => {
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: ["requests", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["group-financial-summary", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["group-financial-dashboard", groupCode] });

      setProcessingRequest(null);
    },

    onError: (error: Error) => {
      toast.error(error.message);

      setProcessingRequest(null);
    },
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();

    requestMutation.mutate({
      groupCode,
      data: {
        reason,
        amount,
        month,
      },
    });
  };



  const handleContribution = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      groupCode,
      amount: groupDetails?.monthlyContribution ?? 0,
      month,
    });
  };


  if (
    isGroupDetailsPending ||
    isContributionPending ||
    isRequestsPending
  ) {
    return <p>Loading...</p>;
  }


  if (
    isGroupDetailsError ||
    isContributionError ||
    isRequestsError
  ) {
    return (
      <p>
        {errorGroupDetails?.message ||
          errorContribution?.message ||
          errorRequests?.message}
      </p>
    );
  }






  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-black">
      <div className="pointer-events-none fixed inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 12% 0%, rgba(0,0,0,0.025), transparent 28%), radial-gradient(circle at 90% 12%, rgba(0,0,0,0.02), transparent 24%)" }} />
      <div className="relative z-20"><LoginNavbar /></div>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-9">
        <div className="mb-7 flex flex-col gap-5 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-black">
              <span className="h-2 w-2 rounded-full bg-green-400 " />
              ShareWallet <span className="text-zinc-600">/</span> Savings group
            </div>
            <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{groupDetails.groupName}</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">A shared space to save together, stay on track and manage your group money.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-black">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Group active
            </span>
            <button type="button" onClick={async () => {
              try { await navigator.clipboard.writeText(groupDetails.groupCode); toast.success("Group code copied"); }
              catch { toast.error("Unable to copy group code"); }
            }} className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-100">
              Invite code · {groupDetails.groupCode} <span className="ml-2 text-black">Copy ↗</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Monthly contribution</p>
                <p className="mt-3 text-2xl font-bold tracking-tight">₹{money(groupDetails.monthlyContribution)}</p>
                <p className="mt-1 text-xs text-zinc-500">Per member · every month</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-black p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-white">Total group amount</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-white">₹{money(groupDetails.totalAmount)}</p>
                <p className="mt-1 text-xs text-white">Current group total</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">Group members</p>
                <p className="mt-3 text-2xl font-bold tracking-tight">{groupDetails.groupmember.length}</p>
                <p className="mt-1 text-xs text-zinc-500">Saving together</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">Group workspace</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">What would you like to do?</h2>
                  <p className="mt-1 text-sm text-zinc-500">Make a contribution, coordinate with members or request funds.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => setOpenContri(true)} className="group flex min-h-[112px] flex-col items-start justify-between rounded-xl border border-zinc-300 bg-white p-4 text-left text-black transition hover:-translate-y-0.5 hover:bg-zinc-100">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-lg text-black">＋</span>
                  <span><span className="block font-semibold text-black">Contribute</span><span className="mt-1 block text-xs text-zinc-500">Add this month’s savings</span></span>
                </button>
                <button type="button" onClick={() => router.push(`/group/${groupCode}/message`)} className="group flex min-h-[112px] flex-col items-start justify-between rounded-xl border border-[#3a3a3a] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-gray-500 hover:bg-zinc-100">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-lg text-zinc-800">↗</span>
                  <span><span className="block font-semibold text-black">Group chat</span><span className="mt-1 block text-xs text-zinc-600">Talk with your members</span></span>
                </button>
                <button type="button" onClick={() => setOpenRequest(true)} className="group flex min-h-[112px] flex-col items-start justify-between rounded-xl border border-red-600 bg-red-600 p-4 text-left text-black transition hover:-translate-y-0.5 hover:bg-red-500">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg text-black">₹</span>
                  <span><span className="block font-semibold text-black">Request Money</span><span className="mt-1 block text-xs text-black/70">Ask the group for support</span></span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">Financial health</p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">Group financial overview</h2>
                  <p className="mt-1 text-xs text-zinc-500">Only confirmed payments are included in received and wallet totals.</p>
                </div>
                <button type="button" onClick={() => router.push(`/group/${groupCode}/transactions`)} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:text-black sm:w-auto">View transactions ↗</button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500">CONTRIBUTIONS RECEIVED</p><p className="mt-2 text-2xl font-bold text-black">₹{money(financialSummary?.totalContributions ?? groupDetails.totalAmount)}</p><p className="mt-1 text-xs text-zinc-500">{financialSummary?.contributionCount ?? 0} successful payments</p></div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500">WALLET BALANCE</p><p className="mt-2 text-2xl font-bold">₹{money(financialSummary?.netFlow ?? groupDetails.totalAmount)}</p><p className="mt-1 text-xs text-zinc-500">Received less payouts and refunds</p></div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500">TOTAL PAYOUTS</p><p className="mt-2 text-2xl font-bold text-zinc-800">₹{money(financialSummary?.totalPayouts ?? 0)}</p><p className="mt-1 text-xs text-zinc-500">Successfully paid out</p></div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500">TOTAL REFUNDS</p><p className="mt-2 text-2xl font-bold text-zinc-800">₹{money(financialSummary?.totalRefunds ?? 0)}</p><p className="mt-1 text-xs text-zinc-500">Successfully refunded</p></div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500">PENDING CONTRIBUTIONS</p><p className="mt-2 text-2xl font-bold text-zinc-800">₹{money(financialSummary?.pendingContributionAmount ?? 0)}</p><p className="mt-1 text-xs text-zinc-500">{financialSummary?.pendingContributionCount ?? 0} awaiting confirmation</p></div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500">MONEY REQUESTS</p><p className="mt-2 text-2xl font-bold">{financialSummary?.totalRequests ?? groupRequests?.sentrequestDetails.length ?? 0}</p><p className="mt-1 text-xs text-zinc-500">Total requests created</p></div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">The people behind the goal</p><h2 className="mt-1 text-xl font-bold tracking-tight">Group members</h2></div>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700">{groupDetails.groupmember.length} {groupDetails.groupmember.length === 1 ? "member" : "members"}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {groupDetails.groupmember.map((member) => (
                  <div key={member.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-sm font-bold text-black">{(member.user.userdetails.name || "M").charAt(0).toUpperCase()}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-black">{member.user.userdetails.name}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{member.user.coustumerId}</p></div>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-black">Member</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="min-w-0">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 xl:sticky xl:top-24">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black">Stay in the loop</p><h2 className="mt-1 text-xl font-bold tracking-tight">Recent activity</h2><p className="mt-1 text-xs text-zinc-500">Contributions and group requests</p></div>
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-bold tracking-wider text-black">ACTIVITY</span>
              </div>
              <div className="mb-5 grid grid-cols-3 rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                {([
                  { key: "ALL", label: "All" },
                  { key: "CONTRIBUTIONS", label: "Contributions" },
                  { key: "REQUESTS", label: "Requests" },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActivityFilter(tab.key)}
                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${activityFilter === tab.key ? "bg-white text-black" : "text-zinc-600 hover:bg-zinc-100 hover:text-black"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {activityFilter === "ALL" && contributionDetails.length === 0 && (!groupRequests?.sentrequestDetails || groupRequests.sentrequestDetails.length === 0) && (

                <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-black">No activity yet</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">Contributions and money requests will appear here.</p>
                </div>
              )}

              {activityFilter !== "REQUESTS" && contributionDetails.length > 0 && (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">Contributions</h3>
                    <span className="text-xs text-zinc-500">{contributionDetails.length}</span>
                  </div>
                  <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                    {contributionDetails.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 py-4">
                        <div className="min-w-0">
                          <p className="text-sm leading-6 text-zinc-700"><span className="font-semibold text-black">{item.user.userdetails.name}</span> contributed</p>
                          <p className="mt-1 text-xs text-zinc-500">{item.month}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-black">₹{money(Number(item.amount))}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activityFilter !== "CONTRIBUTIONS" && (groupRequests?.sentrequestDetails?.length ?? 0) > 0 && (
                <section className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">Money requests</h3>
                    <span className="text-xs text-zinc-500">{groupRequests?.sentrequestDetails.length}</span>
                  </div>
                  <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                    {groupRequests?.sentrequestDetails.map((item) => (
                      <div key={item.id} className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm leading-6 text-zinc-700"><span className="font-semibold text-black">{item.user.userdetails.name}</span> requested</p>
                            <p className="mt-1 text-xs text-zinc-500">{item.month} · {item.reason}</p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold tabular-nums text-black">₹{money(Number(item.amount))}</p>
                        </div>
                        <span className={`mt-2 inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-700`}>{item.status}</span>
                        {item.status === "ACCEPTED" && item.user.id === groupRequests?.currentUserId && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => router.push(`/group/${groupCode}/repay/${item.id}`)}
                              className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
                            >
                              Repay Now →
                            </button>
                          </div>
                        )}
                        {item.status === "PENDING" && item.approvals?.[0]?.status === "PENDING" && (
                          <div className="mt-3 flex gap-2">
                            <button type="button" disabled={updateRequestMutation.isPending} onClick={() => { setProcessingRequest({ id: item.id, status: "ACCEPTED" }); updateRequestMutation.mutate({ groupCode, requestId: item.id, status: "ACCEPTED" }); }} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50">{processingRequest?.id === item.id && processingRequest.status === "ACCEPTED" ? "Processing..." : "Approve"}</button>
                            <button type="button" disabled={updateRequestMutation.isPending} onClick={() => { setProcessingRequest({ id: item.id, status: "REJECTED" }); updateRequestMutation.mutate({ groupCode, requestId: item.id, status: "REJECTED" }); }} className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-50">{processingRequest?.id === item.id && processingRequest.status === "REJECTED" ? "Processing..." : "Reject"}</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      </main>

      {openContri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <div className="relative z-10 my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 text-black shadow-2xl sm:p-8">

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black">
                Monthly Contribution
              </h2>
              <p className="mt-2 text-sm text-black">
                Enter your contribution details for this month.
              </p>
            </div>

            <form onSubmit={handleContribution} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Contribution Amount
                </label>

                <div className="w-full rounded border border-[#2c2c2c] bg-white px-3 py-2 text-black">
                  ₹ {groupDetails.monthlyContribution}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Month
                </label>
                <input
                  type="month"
                  readOnly
                  defaultValue={currentMonth}
                  placeholder="July"
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded border border-[#2c2c2c] bg-white px-3 py-2 text-black placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-[#dadada] focus:ring-2 focus:ring-[#6D4DFE]/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  disabled={mutation.isPending}
                  type="submit"
                  className="flex-1 text-white border bg-black px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                >
                  {mutation.isPending ? "Contributing..." : "Contribute"}
                </button>
                <button
                  className="flex-1 text-black border border-zinc-300 px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                  onClick={() => setOpenContri(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">
          <div className="relative z-10 my-auto max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 text-black shadow-2xl sm:p-8">

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black">
                Send Request
              </h2>
              <p className="mt-2 text-sm text-black">
                Enter your amount and reason in details.
              </p>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Withdraw Amount
                </label>
                <input
                  placeholder="Enter the amount"
                  type="text"
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded border border-[#2c2c2c] bg-white px-3 py-2 text-black" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Month
                </label>
                <input
                  type="month"
                  readOnly
                  defaultValue={currentMonth}
                  placeholder="July"
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded border border-[#2c2c2c] bg-white px-3 py-2 text-black placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-[#dadada] focus:ring-2 focus:ring-[#6D4DFE]/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="Enter Reason"
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded border border-[#2c2c2c] bg-white px-3 py-2 text-black placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-[#dadada] focus:ring-2 focus:ring-[#6D4DFE]/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  disabled={requestMutation.isPending}
                  type="submit"
                  className="flex-1 text-white border bg-black px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                >
                  {requestMutation.isPending ? "Sending..." : "Send Request"}
                </button>
                <button
                  className="flex-1 text-black border border-zinc-300 px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                  onClick={() => setOpenRequest(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}