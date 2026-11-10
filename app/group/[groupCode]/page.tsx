"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import LoginNavbar from "@/components/loginNavbar";
import { useContributionDetail, useGroupContribution } from "@/hooks/useGroupContribution";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [financialSummary, setFinancialSummary] = useState<{
    totalContributions: number;
    contributionCount: number;
    pendingContributionAmount: number;
    pendingContributionCount: number;
    totalPayouts: number;
    totalRefunds: number;
    netFlow: number;
    totalRequests: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/group/${groupCode}/financial-dashboard`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load group finances");
        return result;
      })
      .then((result) => {
        if (active) setFinancialSummary(result.summary);
      })
      .catch((error) => {
        console.error("GROUP FINANCIAL SUMMARY ERROR:", error);
      });
    return () => {
      active = false;
    };
  }, [groupCode]);

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
      queryClient.invalidateQueries({
        queryKey: ["contribution", groupCode],
      })
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
      queryClient.invalidateQueries({
        queryKey: ["requests", groupCode],
      });

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

      queryClient.invalidateQueries({
        queryKey: ["requests", groupCode],
      });

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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f4f4f5] text-[#111111]">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)`,
          WebkitMaskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)`,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div className="relative z-10">
        <LoginNavbar />
      </div>


      <div className="relative z-10 mx-auto grid h-[calc(100vh-5rem)] min-h-0 w-full max-w-[1600px] flex-1 grid-rows-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-4 overflow-hidden px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.9fr)] lg:grid-rows-1 lg:gap-6 lg:px-8 lg:py-5">
        <div className="min-h-0 min-w-0 h-full w-full overflow-y-auto overscroll-contain rounded-3xl border border-[#252525] bg-[#080808] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.12)] sm:p-7 lg:p-8">

          <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
            {groupDetails.groupName}
          </h1>

          <p className="mt-2 text-sm text-gray-400 sm:text-base">
            Manage your monthly savings group.
          </p>

          <div className="mt-8 space-y-0 rounded-2xl border border-[#242424] bg-[#101010] px-4 sm:px-5">

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#252525] py-4 last:border-0">
              <span className="text-gray-400">Group Code</span>
              <span className="font-semibold">{groupDetails.groupCode}</span>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#252525] py-4 last:border-0">
              <span className="text-gray-400">Monthly Contribution</span>
              <span className="font-semibold">
                ₹ {groupDetails.monthlyContribution}
              </span>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#252525] py-4 last:border-0">
              <span className="text-gray-400">Total Amount</span>
              <span className="font-semibold text-green-400">
                ₹ {groupDetails.totalAmount}
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Description</p>
              <p className="leading-7 text-gray-300">
                {groupDetails.description}
              </p>
            </div>

          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOpenContri(true)}
              className="w-full rounded-xl border border-white bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-white/5 transition hover:-translate-y-0.5 hover:bg-gray-100 sm:w-auto"
            >
              Contribute
            </button>


            <button onClick={() => router.push(`/group/${groupCode}/message`)} className="w-full rounded-xl border border-[#3a3a3a] bg-[#151515] px-5 py-3 text-sm font-semibold text-white transition hover:border-gray-500 hover:bg-[#202020] sm:w-auto">
              Message
            </button>

            <button onClick={() => setOpenRequest(true)} className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-500 sm:w-auto">
              Request Money
            </button>

          </div>
          <div className="mt-8 rounded-2xl border border-[#292929] bg-gradient-to-br from-[#151515] to-[#090909] p-4 shadow-inner sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Group Financial Overview</h2>
                <p className="text-xs text-gray-500 mt-1">Only confirmed payments are counted in received and wallet totals.</p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/group/${groupCode}/transactions`)}
                className="rounded-xl border border-[#414141] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:border-[#666] hover:bg-[#242424]"
              >
                View transactions
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              <div className="rounded-2xl border border-[#2b2b2b] bg-[#191919] p-5 transition hover:border-[#414141] hover:bg-[#1d1d1d]">
                <p className="break-words text-xs tracking-wide text-gray-400">TOTAL CONTRIBUTION RECEIVED</p>
                <p className="text-2xl font-semibold text-green-400 mt-2">₹{money(financialSummary?.totalContributions ?? groupDetails.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{financialSummary?.contributionCount ?? 0} successful contributions</p>
              </div>
              <div className="rounded-2xl border border-[#2b2b2b] bg-[#191919] p-5 transition hover:border-[#414141] hover:bg-[#1d1d1d]">
                <p className="break-words text-xs tracking-wide text-gray-400">CURRENT WALLET BALANCE</p>
                <p className="text-2xl font-semibold text-white mt-2">₹{money(financialSummary?.netFlow ?? groupDetails.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">Received − payouts − refunds</p>
              </div>
              <div className="rounded-2xl border border-[#2b2b2b] bg-[#191919] p-5 transition hover:border-[#414141] hover:bg-[#1d1d1d]">
                <p className="break-words text-xs tracking-wide text-gray-400">TOTAL PAYOUTS</p>
                <p className="text-2xl font-semibold text-blue-400 mt-2">₹{money(financialSummary?.totalPayouts ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully paid out</p>
              </div>
              <div className="rounded-2xl border border-[#2b2b2b] bg-[#191919] p-5 transition hover:border-[#414141] hover:bg-[#1d1d1d]">
                <p className="break-words text-xs tracking-wide text-gray-400">TOTAL REFUNDS</p>
                <p className="text-2xl font-semibold text-orange-400 mt-2">₹{money(financialSummary?.totalRefunds ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully refunded</p>
              </div>
              <div className="rounded-2xl border border-[#2b2b2b] bg-[#191919] p-5 transition hover:border-[#414141] hover:bg-[#1d1d1d]">
                <p className="break-words text-xs tracking-wide text-gray-400">PENDING CONTRIBUTIONS</p>
                <p className="text-2xl font-semibold text-yellow-400 mt-2">₹{money(financialSummary?.pendingContributionAmount ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">{financialSummary?.pendingContributionCount ?? 0} payments awaiting confirmation</p>
              </div>
              <div className="rounded-2xl border border-[#2b2b2b] bg-[#191919] p-5 transition hover:border-[#414141] hover:bg-[#1d1d1d]">
                <p className="break-words text-xs tracking-wide text-gray-400">MONEY REQUESTS</p>
                <p className="text-2xl font-semibold text-white mt-2">{financialSummary?.totalRequests ?? groupRequests?.sentrequestDetails.length ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total requests created</p>
              </div>
            </div>
          </div>

          <div className="mt-9">
            <h2 className="mb-4 text-xl font-bold tracking-tight">
              Members of Group
            </h2>

            <div className="space-y-3">
              {groupDetails.groupmember.map((member) => (
                <div
                  key={member.id}
                  className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#292929] bg-[#121212] px-4 py-4 text-white transition hover:border-[#454545]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-700"></div>

                    <div>
                      <p className="font-medium">
                        {member.user.userdetails.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {member.user.coustumerId}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">
                    Member
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="min-h-0 min-w-0 h-full w-full overflow-y-auto overscroll-contain self-start rounded-3xl border border-[#252525] bg-[#080808] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.12)] sm:p-6 lg:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Activity</h2>
              <p className="mt-1 text-xs text-gray-500">Recent group activity</p>
            </div>
            <span className="rounded-full border border-[#245a3b] bg-[#10291b] px-3 py-1 text-xs font-semibold text-green-400">LIVE</span>
          </div>
          {contributionDetails.map((item) => (
            <div key={item.id} className="mt-4">
              <div className="flex items-start rounded-2xl border border-[#242424] bg-[#111111] px-4 py-4 transition hover:border-[#3a3a3a]">
                <div>
                  <p className="text-[#dadada]">
                    <span className="font-semibold">
                      {item.user.userdetails.name}
                    </span>{" "}
                    contributed
                    <span className="text-green-400">
                      {" "}₹{item.amount}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.month}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {groupRequests?.sentrequestDetails.map((item) => (
            <div
              key={item.id}
              className="mt-4"
            >
              <div className="flex items-start rounded-2xl border border-[#242424] bg-[#111111] px-4 py-4 transition hover:border-[#3a3a3a]">

                <div className="w-full">

                  {/* Request Information */}
                  <p className="text-[#dadada]">
                    <span className="font-semibold">
                      {item.user.userdetails.name}
                    </span>{" "}
                    Requested{" "}
                    <span className="text-green-400">
                      ₹{item.amount}
                    </span>
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.month}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    Reason: {item.reason}
                  </p>

                  <p
                    className={`text-sm mt-1 ${item.status === "PENDING"
                      ? "text-yellow-400"
                      : item.status === "ACCEPTED"
                        ? "text-green-400"
                        : "text-red-400"
                      }`}
                  >
                    Status: {item.status}
                  </p>

                  {item.status === "PENDING" &&
                    item.approvals?.[0]?.status === "PENDING" && (
                      <div className="flex gap-3 mt-4">

                        <button
                          type="button"
                          disabled={updateRequestMutation.isPending}
                          onClick={() => {
                            setProcessingRequest({
                              id: item.id,
                              status: "ACCEPTED",
                            });

                            updateRequestMutation.mutate({
                              groupCode,
                              requestId: item.id,
                              status: "ACCEPTED",
                            });
                          }}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingRequest?.id === item.id &&
                            processingRequest.status === "ACCEPTED"
                            ? "Processing..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          disabled={updateRequestMutation.isPending}
                          onClick={() => {
                            setProcessingRequest({
                              id: item.id,
                              status: "REJECTED",
                            });

                            updateRequestMutation.mutate({
                              groupCode,
                              requestId: item.id,
                              status: "REJECTED",
                            });
                          }}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {processingRequest?.id === item.id &&
                            processingRequest.status === "REJECTED"
                            ? "Processing..."
                            : "Reject"}
                        </button>

                      </div>
                    )}

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

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

                <div className="w-full rounded border border-[#2c2c2c] bg-black px-3 py-2 text-white">
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
                  className="w-full rounded border border-[#2c2c2c] bg-black px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-[#dadada] focus:ring-2 focus:ring-[#6D4DFE]/30"
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
                  className="flex-1 text-black border border-black px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
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
                  className="w-full rounded border border-[#2c2c2c] bg-black px-3 py-2 text-white" />
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
                  className="w-full rounded border border-[#2c2c2c] bg-black px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-[#dadada] focus:ring-2 focus:ring-[#6D4DFE]/30"
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
                  className="w-full rounded border border-[#2c2c2c] bg-black px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-[#dadada] focus:ring-2 focus:ring-[#6D4DFE]/30"
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
                  className="flex-1 text-black border border-black px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                  onClick={() => setOpenRequest(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}