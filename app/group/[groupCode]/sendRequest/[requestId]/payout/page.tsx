/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Loader2,
    RefreshCw,
    Wallet,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

type PayoutTransaction = {
    id: string;
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED";
    type: string;
    provider?: string | null;
    providerReference?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

type RequestData = {
    id: string;
    reason: string;
    amount: string | number;
    status: string;
};

export default function PayoutPage() {
    const params = useParams();
    const router = useRouter();

    const groupCode = params.groupCode as string;
    const requestId = params.requestId as string;

    const [retrying, setRetrying] = useState(false);
    const { data: payoutData, isPending: loading, refetch: fetchPayoutStatus } = useQuery<{
        request: RequestData;
        payout: PayoutTransaction | null;
    }>({
        queryKey: ["request-payout-status", groupCode, requestId],
        queryFn: async () => {
            const requestRes = await fetch(`/api/group/${encodeURIComponent(groupCode)}/sendRequest/${encodeURIComponent(requestId)}`, { cache: "no-store" });
            const requestData = await requestRes.json();
            if (!requestRes.ok) throw new Error(requestData.error || "Failed to fetch request");
            const transactionRes = await fetch(`/api/group/${encodeURIComponent(groupCode)}/transactions`, { cache: "no-store" });
            const transactionData = await transactionRes.json();
            if (!transactionRes.ok) throw new Error(transactionData.error || "Failed to fetch transactions");
            const payout = (transactionData.transactions || []).find((transaction: PayoutTransaction & { requestId?: string }) =>
                transaction.type === "PAYOUT" && transaction.requestId === requestId
            ) || null;
            return { request: requestData.request || requestData, payout };
        },
        enabled: !!groupCode && !!requestId,
        staleTime: 2_000,
        refetchInterval: (query) => {
            const current = query.state.data;
            return current?.payout?.status === "PENDING" || (!current?.payout && current?.request?.status === "ACCEPTED") ? 5_000 : false;
        },
        refetchIntervalInBackground: false,
    });
    const request = payoutData?.request || null;
    const payout = payoutData?.payout || null;

    async function retryPayout() {
        try {
            setRetrying(true);

            const res = await fetch(
                `/api/group/${groupCode}/sendRequest/${requestId}/payout/retry`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to retry payout"
                );
            }

            toast.success(
                "Payout retry initiated successfully."
            );

            await fetchPayoutStatus();
        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Payout retry failed"
            );
        } finally {
            setRetrying(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        size={42}
                        className="animate-spin"
                    />

                    <p className="text-sm text-gray-500">
                        Loading payout status...
                    </p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center">
                    <XCircle
                        size={50}
                        className="mx-auto text-red-500"
                    />

                    <h1 className="mt-4 text-2xl font-bold">
                        Request Not Found
                    </h1>

                    <button
                        onClick={() =>
                            router.back()
                        }
                        className="mt-6 rounded-lg bg-black px-5 py-2.5 text-white"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const amount =
        Number(request.amount) || 0;

    return (
        <main className="min-h-screen bg-white text-black px-4 py-8 md:px-8">
            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between gap-4">

                    <button
                        onClick={() =>
                            router.back()
                        }
                        className="flex items-center gap-2 text-sm font-medium hover:opacity-60"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <button
                        onClick={() => fetchPayoutStatus()}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>
                </div>

                {/* Request */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">

                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Wallet size={18} />
                                Payout
                            </div>

                            <h1 className="mt-3 text-2xl font-bold">
                                {request.reason}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Money requested: ₹
                                {amount.toLocaleString(
                                    "en-IN"
                                )}
                            </p>
                        </div>

                        {payout && (
                            <StatusBadge
                                status={
                                    payout.status
                                }
                            />
                        )}
                    </div>

                    {/* No payout */}
                    {!payout && (
                        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-5">

                            <div className="flex gap-3">

                                <Clock3
                                    size={22}
                                    className="shrink-0 text-yellow-600"
                                />

                                <div>
                                    <p className="font-semibold text-yellow-800">
                                        Payout not initiated
                                    </p>

                                    <p className="mt-1 text-sm text-yellow-700">
                                        The payout transaction has not been created yet.
                                    </p>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Payout details */}
                    {payout && (
                        <div className="mt-8">

                            {/* Status */}
                            <div
                                className={`rounded-xl p-5 ${
                                    payout.status ===
                                    "SUCCESS"
                                        ? "bg-green-50"
                                        : payout.status ===
                                          "FAILED"
                                        ? "bg-red-50"
                                        : "bg-yellow-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">

                                    {payout.status ===
                                    "SUCCESS" ? (
                                        <CheckCircle2
                                            size={28}
                                            className="text-green-600"
                                        />
                                    ) : payout.status ===
                                      "FAILED" ? (
                                        <XCircle
                                            size={28}
                                            className="text-red-600"
                                        />
                                    ) : (
                                        <Clock3
                                            size={28}
                                            className="text-yellow-600"
                                        />
                                    )}

                                    <div>
                                        <p className="font-semibold">
                                            {payout.status ===
                                            "SUCCESS"
                                                ? "Payout Successful"
                                                : payout.status ===
                                                  "FAILED"
                                                ? "Payout Failed"
                                                : "Payout Processing"}
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            {payout.status ===
                                            "SUCCESS"
                                                ? "The money has been successfully transferred."
                                                : payout.status ===
                                                  "FAILED"
                                                ? "The payout could not be completed."
                                                : "Your payout is currently being processed."}
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* Amount */}
                            <div className="mt-5 grid gap-4 md:grid-cols-2">

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Payout Amount
                                    </p>

                                    <p className="mt-1 text-2xl font-bold">
                                        ₹
                                        {Number(
                                            payout.amount
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Provider
                                    </p>

                                    <p className="mt-1 text-xl font-semibold">
                                        {payout.provider ||
                                            "CASHFREE"}
                                    </p>
                                </div>

                            </div>

                            {/* Transaction ID */}
                            <div className="mt-4 rounded-xl border border-gray-100 p-5">

                                <p className="text-sm text-gray-500">
                                    Transaction ID
                                </p>

                                <p className="mt-1 break-all font-mono text-sm">
                                    {payout.id}
                                </p>

                            </div>

                            {/* Provider Reference */}
                            {payout.providerReference && (
                                <div className="mt-4 rounded-xl border border-gray-100 p-5">

                                    <p className="text-sm text-gray-500">
                                        Cashfree Reference
                                    </p>

                                    <p className="mt-1 break-all font-mono text-sm">
                                        {
                                            payout.providerReference
                                        }
                                    </p>

                                </div>
                            )}

                            {/* Dates */}
                            <div className="mt-4 grid gap-4 md:grid-cols-2">

                                {payout.createdAt && (
                                    <div className="rounded-xl border border-gray-100 p-4">
                                        <p className="text-xs text-gray-500">
                                            Created
                                        </p>

                                        <p className="mt-1 text-sm font-medium">
                                            {new Date(
                                                payout.createdAt
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>
                                    </div>
                                )}

                                {payout.updatedAt && (
                                    <div className="rounded-xl border border-gray-100 p-4">
                                        <p className="text-xs text-gray-500">
                                            Last Updated
                                        </p>

                                        <p className="mt-1 text-sm font-medium">
                                            {new Date(
                                                payout.updatedAt
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>
                                    </div>
                                )}

                            </div>

                            {/* Retry */}
                            {payout.status ===
                                "FAILED" && (
                                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">

                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                        <div>
                                            <p className="font-semibold text-red-800">
                                                Payout Failed
                                            </p>

                                            <p className="mt-1 text-sm text-red-700">
                                                You can retry the payout using the same payout transaction.
                                            </p>
                                        </div>

                                        <button
                                            onClick={
                                                retryPayout
                                            }
                                            disabled={
                                                retrying
                                            }
                                            className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {retrying ? (
                                                <>
                                                    <Loader2
                                                        size={
                                                            17
                                                        }
                                                        className="animate-spin"
                                                    />
                                                    Retrying...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw
                                                        size={
                                                            17
                                                        }
                                                    />
                                                    Retry Payout
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </div>
                            )}

                            {/* Success */}
                            {payout.status ===
                                "SUCCESS" && (
                                <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-5 text-green-700">
                                    <CheckCircle2
                                        size={22}
                                    />

                                    <div>
                                        <p className="font-semibold">
                                            Payout Completed
                                        </p>

                                        <p className="text-sm">
                                            This payout has been successfully completed.
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}

function StatusBadge({
    status,
}: {
    status: "PENDING" | "SUCCESS" | "FAILED";
}) {
    if (status === "SUCCESS") {
        return (
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                <CheckCircle2 size={14} />
                SUCCESS
            </div>
        );
    }

    if (status === "FAILED") {
        return (
            <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                <XCircle size={14} />
                FAILED
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700">
            <Clock3 size={14} />
            PENDING
        </div>
    );
}