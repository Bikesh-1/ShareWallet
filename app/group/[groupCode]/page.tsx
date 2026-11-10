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
    <div className="min-h-screen w-full relative bg-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
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


      <div className="p-6 flex gap-6 min-h-screen items-center justify-between relative z-10">
        <div className="w-2/3 bg-black border border-[#1d1d1d] rounded p-8 text-white">

          <h1 className="text-2xl font-bold tracking-wide">
            {groupDetails.groupName}
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Manage your monthly savings group.
          </p>

          <div className="mt-8 space-y-4">

            <div className="flex justify-between border-b border-[#1f1f1f] pb-3">
              <span className="text-gray-400">Group Code</span>
              <span className="font-semibold">{groupDetails.groupCode}</span>
            </div>

            <div className="flex justify-between border-b border-[#1f1f1f] pb-3">
              <span className="text-gray-400">Monthly Contribution</span>
              <span className="font-semibold">
                ₹ {groupDetails.monthlyContribution}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#1f1f1f] pb-3">
              <span className="text-gray-400">Total Amount</span>
              <span className="font-semibold text-green-400">
                ₹ {groupDetails.totalAmount}
              </span>
            </div>

            <div>
              <p className="text-gray-400 mb-2">Description</p>
              <p className="leading-7 text-gray-300">
                {groupDetails.description}
              </p>
            </div>

          </div>
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => setOpenContri(true)}
              className=" w-auto text-black border border-[#dadada] bg-white px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
            >
              Contribute
            </button>


            <button onClick={() => router.push(`/group/${groupCode}/message`)} className="text-white border border-white px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer">
              Message
            </button>

            <button onClick={() => setOpenRequest(true)} className=" w-auto text-white   bg-red-600 px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer">
              Request Money
            </button>

          </div>
          <div className="mt-8 rounded-xl border border-[#252525] bg-[#101010] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-white">Group Financial Overview</h2>
                <p className="text-xs text-gray-500 mt-1">Only confirmed payments are counted in received and wallet totals.</p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/group/${groupCode}/transactions`)}
                className="text-sm text-white border border-[#444] rounded-lg px-3 py-2 hover:bg-[#222]"
              >
                View transactions
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#242424] bg-[#171717] p-4">
                <p className="text-xs tracking-wide text-gray-400">TOTAL CONTRIBUTION RECEIVED</p>
                <p className="text-2xl font-semibold text-green-400 mt-2">₹{money(financialSummary?.totalContributions ?? groupDetails.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">{financialSummary?.contributionCount ?? 0} successful contributions</p>
              </div>
              <div className="rounded-lg border border-[#242424] bg-[#171717] p-4">
                <p className="text-xs tracking-wide text-gray-400">CURRENT WALLET BALANCE</p>
                <p className="text-2xl font-semibold text-white mt-2">₹{money(financialSummary?.netFlow ?? groupDetails.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">Received − payouts − refunds</p>
              </div>
              <div className="rounded-lg border border-[#242424] bg-[#171717] p-4">
                <p className="text-xs tracking-wide text-gray-400">TOTAL PAYOUTS</p>
                <p className="text-2xl font-semibold text-blue-400 mt-2">₹{money(financialSummary?.totalPayouts ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully paid out</p>
              </div>
              <div className="rounded-lg border border-[#242424] bg-[#171717] p-4">
                <p className="text-xs tracking-wide text-gray-400">TOTAL REFUNDS</p>
                <p className="text-2xl font-semibold text-orange-400 mt-2">₹{money(financialSummary?.totalRefunds ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Successfully refunded</p>
              </div>
              <div className="rounded-lg border border-[#242424] bg-[#171717] p-4">
                <p className="text-xs tracking-wide text-gray-400">PENDING CONTRIBUTIONS</p>
                <p className="text-2xl font-semibold text-yellow-400 mt-2">₹{money(financialSummary?.pendingContributionAmount ?? 0)}</p>
                <p className="text-xs text-gray-500 mt-1">{financialSummary?.pendingContributionCount ?? 0} payments awaiting confirmation</p>
              </div>
              <div className="rounded-lg border border-[#242424] bg-[#171717] p-4">
                <p className="text-xs tracking-wide text-gray-400">MONEY REQUESTS</p>
                <p className="text-2xl font-semibold text-white mt-2">{financialSummary?.totalRequests ?? groupRequests?.sentrequestDetails.length ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total requests created</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Members of Group
            </h2>

            <div className="space-y-3">
              {groupDetails.groupmember.map((member) => (
                <div
                  key={member.id}
                  className="text-white flex items-center justify-between bg-[#141414] border border-[#202020] rounded-xl px-4 py-3"
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
        <div className="w-1/3 bg-black h-[80vh] rounded p-8">
          <h2 className="text-2xl font-semibold text-[#dadada]">
            Activity
          </h2>
          {contributionDetails.map((item) => (
            <div key={item.id} className="mt-6 space-y-4">
              <div className="flex justify-between items-start border-l-2 border-gray-700 pl-4">
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
              className="mt-6 space-y-4"
            >
              <div className="flex justify-between items-start border-l-2 border-gray-700 pl-4">

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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="w-full max-w-md rounded bg-white text-black p-8 shadow-2xl relative z-10">

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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-10">
          <div className="w-full max-w-md rounded bg-white text-black p-8 shadow-2xl relative z-10">

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