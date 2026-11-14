"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {ArrowLeft,CheckCircle2,Clock3,CreditCard,Loader2,RefreshCw,Wallet,XCircle,} from "lucide-react";
import { toast } from "sonner";

declare global {
        interface Window {
        Cashfree?: (config: {mode: "sandbox" | "production";}) => {
            checkout: (config: {
                paymentSessionId: string;
                redirectTarget:
                | "_self"
                | "_blank"
                | "_modal";
            }) => Promise<void>;
        };
    }
}

type Approval = {
    id: string;
    status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
    actionAt?: string | null;

    user?: {
        id?: string;
        email?: string;

        userdetails?: {
            firstName?: string;
            lastName?: string;
        } | null;
    } | null;
};

type Contribution = {
    id: string;
    amount: number;
    status: string;
    paidAt?: string | null;
    userId?: string;

    user?: {
        id?: string;
        email?: string;
        userdetails?: {
            firstName?: string;
            lastName?: string;
        } | null;
    } | null;
};

type RequestData = {
    id: string;
    reason: string;
    amount: string | number;
    month?: string | null;
    status: string;
    requestAt?: string;
    actionAt?: string | null;
    approvals?: Approval[];
    currentUserContribution?:| Contribution| null;
    contributions?: Contribution[];
    user?: {
        id?: string;
        email?: string;
        userdetails?: {
            firstName?: string;
            lastName?: string;
        } | null;
    } | null;
};

export default function MoneyRequestPage() {
    const params = useParams();
    const groupCode = params.groupCode as string;
    const requestId = params.requestId as string;
    const [paying, setPaying] = useState(false);
    const [cashfreeReady, setCashfreeReady] = useState(false);
    const { data: requestPayload, isPending: loading, refetch: fetchRequest } = useQuery<{
        request: RequestData;
        currentUserId: string;
    }>({
        queryKey: ["request", groupCode, requestId],
        queryFn: async () => {
            const res = await fetch(`/api/group/${encodeURIComponent(groupCode)}/sendRequest/${encodeURIComponent(requestId)}`, { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch request");
            return { request: data.request || data, currentUserId: data.currentUserId || "" };
        },
        enabled: !!groupCode && !!requestId,
        staleTime: 3_000,
        refetchInterval: 10_000,
        refetchIntervalInBackground: false,
    });
    const request = requestPayload?.request || null;
    const currentUserId = requestPayload?.currentUserId || null;

    const cashfreeMode =
        process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
            ? "production"
            : "sandbox";

    useEffect(() => {
        const scriptId = "cashfree-checkout-sdk";
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        const markReady = () => {
            if (window.Cashfree) setCashfreeReady(true);
        };

        if (window.Cashfree) {
            markReady();
            return;
        }

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            script.async = true;
            document.head.appendChild(script);
        }

        script.addEventListener("load", markReady);
        script.addEventListener("error", () => {
            toast.error("Unable to load Cashfree checkout. Please refresh.");
        });

        return () => {
            script?.removeEventListener("load", markReady);
        };
    }, []);



    async function handleApproval(status:| "APPROVED"| "REJECTED") {
        try {
            const res = await fetch(`/api/group/${groupCode}/sendRequest/${requestId}/approval`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({status,}),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error ||"Failed to update approval");
            }

            toast.success(status === "APPROVED"? "Request approved": "Request rejected");
            await fetchRequest();
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error? error.message: "Failed to update approval");
        }
    }

    async function handlePayment(contributionId: string) {
        try {
            setPaying(true);
            const res = await fetch("/api/payment/create-order",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json",
                    },
                    body: JSON.stringify({contributionId,}),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error ||"Unable to create payment");
            }

            if (!data.paymentSessionId) {
                throw new Error("Payment session was not created");
            }

            if (!window.Cashfree || !cashfreeReady) {
                throw new Error("Cashfree checkout is still loading. Please try again.");
            }

            const cashfree = window.Cashfree({ mode: cashfreeMode });

            await cashfree.checkout({
                paymentSessionId:data.paymentSessionId,
                redirectTarget:"_self",
            });
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error? error.message: "Payment failed");
        } finally {
            setPaying(false);
        }
    }

    if (loading) {
        return (
            <>

                <div className="min-h-screen bg-white text-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={40} className="animate-spin"/>
                        <p className="text-sm text-gray-500">
                            Loading money request...
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
                <div className="text-center">
                    <XCircle size={50} className="mx-auto mb-4 text-red-500"/>
                    <h1 className="text-2xl font-semibold">
                        Request Not Found
                    </h1>
                    <p className="text-gray-500 mt-2">
                        This money request could not be found.
                    </p>
                    <button onClick={() => window.history.back()}
                        className="mt-6 rounded-lg bg-black px-5 py-2.5 text-white"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const requestedAmount = Number(request.amount) || 0;
    const contributions = request.contributions || [];
    const paidContributions = contributions.filter((contribution) => contribution.status ==="PAID");
    const collectedAmount = paidContributions.reduce((total, contribution) =>total +Number(contribution.amount),0);
    const remainingAmount =Math.max(requestedAmount -collectedAmount,0);
    const collectionPercentage = requestedAmount > 0 ? Math.min((collectedAmount /requestedAmount) *100,100): 0;
    const approvals = request.approvals || [];
    const approvedCount =approvals.filter((approval) =>approval.status ==="APPROVED").length;
    const rejectedCount = approvals.filter((approval) =>approval.status ==="REJECTED").length;
    const allApproved = approvals.length > 0 &&approvals.every((approval) =>approval.status ==="APPROVED");
    const currentUserContribution = request.currentUserContribution;

    const getUserName = (user?:| Contribution["user"]| Approval["user"]) => {
        const firstName = user?.userdetails?.firstName || "";
        const lastName = user?.userdetails?.lastName || "";
        const fullName =`${firstName} ${lastName}`.trim();
        return (fullName || user?.email ||"Member");
    };

    return (
        <>

            <main className="min-h-screen bg-white text-black px-4 py-8 md:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-medium hover:opacity-60">
                            <ArrowLeft size={18}/>
                            Back
                        </button>

                        <button onClick={fetchRequest} disabled={loading} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
                            <RefreshCw size={16} className={loading? "animate-spin": ""}/>
                            Refresh
                        </button>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="mb-3 flex items-center gap-2">
                                    <Wallet size={22}/>
                                    <span className="text-sm text-gray-500">
                                        Money Request
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold"> 
                                    {
                                        request.reason
                                    }
                                </h1>
                                {request.month && (
                                    <p className="mt-2 text-gray-500">
                                        Month:{" "}
                                        {
                                            request.month
                                        }
                                    </p>
                                )}

                            </div>

                            <div className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${request.status === "ACCEPTED"? "bg-green-100 text-green-700" : request.status === "REJECTED"? "bg-red-100 text-red-700": "bg-yellow-100 text-yellow-700"}`}
                            >
                                {request.status ==="ACCEPTED" ? (
                                    <CheckCircle2 size={16}/>
                                ) : request.status ===
                                    "REJECTED" ? (
                                    <XCircle
                                        size={16}
                                    />
                                ) : (
                                    <Clock3
                                        size={16}
                                    />
                                )}

                                {
                                    request.status
                                }
                            </div>

                        </div>

                        {/* Amount */}

                        <div className="mt-8 grid gap-4 md:grid-cols-3">

                            <div className="rounded-xl bg-gray-50 p-5">
                                <p className="text-sm text-gray-500">
                                    Requested
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    ₹
                                    {requestedAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-5">
                                <p className="text-sm text-gray-500">
                                    Collected
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    ₹
                                    {collectedAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-5">
                                <p className="text-sm text-gray-500">
                                    Remaining
                                </p>

                                <p className="mt-1 text-2xl font-bold">
                                    ₹
                                    {remainingAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </p>
                            </div>

                        </div>

                        {/* Progress */}

                        <div className="mt-8">

                            <div className="mb-2 flex justify-between text-sm">

                                <span className="text-gray-500">
                                    Collection Progress
                                </span>

                                <span className="font-semibold">
                                    {Math.round(
                                        collectionPercentage
                                    )}
                                    %
                                </span>

                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-black transition-all"
                                    style={{
                                        width: `${collectionPercentage}%`,
                                    }}
                                />
                            </div>

                        </div>

                    </div>

                    {request.status === "ACCEPTED" && request.user?.id === currentUserId && (
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-black p-6 text-white shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">Repay your emergency fund</h2>
                                    <p className="mt-1 text-sm text-gray-300">Return the borrowed amount to your group using your ShareWallet balance or UPI/Cashfree.</p>
                                </div>
                                <Link href={`/group/${groupCode}/repay/${requestId}`} className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200">
                                    View repayment & pay
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Approval Section */}

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Member Approvals
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Everyone must approve before payout.
                                </p>

                            </div>

                            <div className="flex gap-3 text-sm">

                                <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                                    Approved:{" "}
                                    {
                                        approvedCount
                                    }
                                </span>

                                <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                                    Rejected:{" "}
                                    {
                                        rejectedCount
                                    }
                                </span>

                            </div>

                        </div>

                        {approvals.length ===
                            0 ? (
                            <div className="mt-6 rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                                No approval records found.
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3">

                                {approvals.map(
                                    (
                                        approval
                                    ) => (
                                        <div
                                            key={
                                                approval.id
                                            }
                                            className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between"
                                        >

                                            <div>
                                                <p className="font-medium">
                                                    {getUserName(
                                                        approval.user
                                                    )}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {
                                                        approval
                                                            .user
                                                            ?.email
                                                    }
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">

                                                {/* Current user's buttons */}

                                                {approval.status ===
                                                    "PENDING" &&
                                                    approval.user
                                                        ?.id ===
                                                    currentUserId && (
                                                        <div className="flex gap-2">

                                                            <button
                                                                onClick={() =>
                                                                    handleApproval(
                                                                        "APPROVED"
                                                                    )
                                                                }
                                                                className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:opacity-80"
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleApproval(
                                                                        "REJECTED"
                                                                    )
                                                                }
                                                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                                                            >
                                                                Reject
                                                            </button>

                                                        </div>
                                                    )}

                                                {/* Status */}

                                                <div
                                                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${approval.status ===
                                                            "APPROVED"
                                                            ? "bg-green-100 text-green-700"
                                                            : approval.status ===
                                                                "REJECTED"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >

                                                    {approval.status ===
                                                        "APPROVED" ? (
                                                        <CheckCircle2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    ) : approval.status ===
                                                        "REJECTED" ? (
                                                        <XCircle
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    ) : (
                                                        <Clock3
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    )}

                                                    {
                                                        approval.status
                                                    }

                                                </div>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                        {allApproved && (
                            <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                                <CheckCircle2
                                    size={18}
                                />

                                All members have approved this request.
                            </div>
                        )}

                    </div>

                    {/* Contributions */}

                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Contributions
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Track payments made by members.
                                </p>

                            </div>

                            <CreditCard
                                size={22}
                            />

                        </div>

                        {contributions.length ===
                            0 ? (
                            <div className="mt-6 rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
                                No contributions yet.
                            </div>
                        ) : (
                            <div className="mt-6 space-y-3">

                                {contributions.map(
                                    (
                                        contribution
                                    ) => (
                                        <div
                                            key={
                                                contribution.id
                                            }
                                            className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between"
                                        >

                                            <div>

                                                <p className="font-medium">
                                                    {getUserName(
                                                        contribution.user
                                                    )}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {
                                                        contribution
                                                            .user
                                                            ?.email
                                                    }
                                                </p>

                                            </div>

                                            <div className="flex items-center gap-4">

                                                <p className="font-semibold">
                                                    ₹
                                                    {Number(
                                                        contribution.amount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${contribution.status ===
                                                            "PAID"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                        }`}
                                                >
                                                    {
                                                        contribution.status
                                                    }
                                                </span>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>

                    {/* Payment */}

                    {currentUserContribution &&
                        currentUserContribution.status !==
                        "PAID" && (
                            <div className="mt-6 rounded-2xl border border-gray-200 bg-black p-6 text-white shadow-sm">

                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                    <div>

                                        <h2 className="text-xl font-semibold">
                                            Complete Your Contribution
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-400">
                                            Pay your contribution securely using Cashfree.
                                        </p>

                                    </div>

                                    <button
                                        onClick={() =>
                                            handlePayment(
                                                currentUserContribution.id
                                            )
                                        }
                                        disabled={
                                            paying
                                        }
                                        className="flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {paying ? (
                                            <>
                                                <Loader2
                                                    size={
                                                        18
                                                    }
                                                    className="animate-spin"
                                                />

                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard
                                                    size={
                                                        18
                                                    }
                                                />

                                                Pay ₹
                                                {Number(
                                                    currentUserContribution.amount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </>
                                        )}

                                    </button>

                                </div>

                            </div>
                        )}

                    {/* Fully Collected */}

                    {requestedAmount >
                        0 &&
                        collectedAmount >=
                        requestedAmount && (
                            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">

                                <CheckCircle2
                                    size={24}
                                />

                                <div>

                                    <p className="font-semibold">
                                        Full amount collected
                                    </p>

                                    <p className="text-sm">
                                        The requested amount has been completely collected.
                                    </p>

                                </div>

                            </div>
                        )}

                </div>
            </main>
        </>
    );
}