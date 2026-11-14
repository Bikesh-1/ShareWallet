"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowDownLeft,
    ArrowUpRight,
    RotateCcw,
    Clock3,
    CheckCircle2,
    XCircle,
    Loader2,
    IndianRupee,
} from "lucide-react";
import { useParams } from "next/navigation";

type Transaction = {
    id: string;
    amount: number;
    type: "CONTRIBUTION" | "PAYOUT" | "REFUND" | "LOAN_REPAYMENT";
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
    provider?: string | null;
    providerReference?: string | null;
    createdAt: string;

    sender?: {
        id: string;
        email: string;
        userdetails?: {
            firstName?: string | null;
            lastName?: string | null;
        } | null;
    } | null;

    receiver?: {
        id: string;
        email: string;
        userdetails?: {
            firstName?: string | null;
            lastName?: string | null;
        } | null;
    } | null;

    request?: {
        id: string;
        reason: string;
        amount: string;
    } | null;
};

type Filter =
    | "ALL"
    | "CONTRIBUTION"
    | "PAYOUT"
    | "REFUND"
    | "LOAN_REPAYMENT"
    | "SUCCESS"
    | "PENDING"
    | "FAILED";

export default function GroupTransactionsPage() {
    const params = useParams();

    const groupCode = params.groupCode as string;

    const [filter, setFilter] = useState<Filter>("ALL");
    const { data: transactions = [], isPending: loading, error: queryError, refetch: fetchTransactions } = useQuery<Transaction[]>({
        queryKey: ["group-transactions", groupCode],
        queryFn: async () => {
            const response = await fetch(`/api/group/${encodeURIComponent(groupCode)}/transactions`, { cache: "no-store" });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.error || "Failed to load group transactions");
            return data.transactions || [];
        },
        enabled: !!groupCode,
        staleTime: 5_000,
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
    });
    const error = queryError instanceof Error ? queryError.message : "";

    const filteredTransactions = transactions.filter(
        (transaction) => {
            if (filter === "ALL") return true;

            return (
                transaction.type === filter ||
                transaction.status === filter
            );
        }
    );

    function getTypeIcon(
        type: Transaction["type"]
    ) {
        if (type === "CONTRIBUTION") {
            return (
                <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowUpRight
                        size={21}
                        className="text-blue-600"
                    />
                </div>
            );
        }

        if (type === "PAYOUT") {
            return (
                <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowDownLeft
                        size={21}
                        className="text-green-600"
                    />
                </div>
            );
        }

        if (type === "LOAN_REPAYMENT") {
            return <div className="h-11 w-11 rounded-full bg-violet-100 flex items-center justify-center"><ArrowUpRight size={21} className="text-violet-600" /></div>;
        }

        return (
            <div className="h-11 w-11 rounded-full bg-orange-100 flex items-center justify-center">
                <RotateCcw
                    size={21}
                    className="text-orange-600"
                />
            </div>
        );
    }

    function getStatus(
        status: Transaction["status"]
    ) {
        if (status === "SUCCESS") {
            return (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle2 size={15} />
                    Success
                </span>
            );
        }

        if (status === "FAILED") {
            return (
                <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <XCircle size={15} />
                    Failed
                </span>
            );
        }

        if (status === "REFUNDED") {
            return (
                <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                    <RotateCcw size={15} />
                    Refunded
                </span>
            );
        }

        return (
            <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                <Clock3 size={15} />
                Pending
            </span>
        );
    }

    function getUserName(
        user: Transaction["sender"]
    ) {
        if (!user) return "Unknown";

        const firstName =
            user.userdetails?.firstName || "";

        const lastName =
            user.userdetails?.lastName || "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return fullName || user.email;
    }

    function getTitle(
        transaction: Transaction
    ) {
        if (transaction.type === "CONTRIBUTION") {
            return "Contribution";
        }

        if (transaction.type === "PAYOUT") {
            return "Payout";
        }

        if (transaction.type === "LOAN_REPAYMENT") return "Loan repayment";
        return "Refund";
    }

    function getDescription(
        transaction: Transaction
    ) {
        if (transaction.type === "CONTRIBUTION") {
            return `From ${getUserName(
                transaction.sender
            )}`;
        }

        if (transaction.type === "PAYOUT") {
            return `To ${getUserName(
                transaction.receiver
            )}`;
        }

        if (transaction.type === "LOAN_REPAYMENT") return `From ${getUserName(transaction.sender)}`;
        return "Contribution refund";
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2
                    size={35}
                    className="animate-spin text-black"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] text-black px-4 py-8 md:px-10">
            <div className="max-w-6xl mx-auto">

                {/* Header */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Group Transactions
                        </h1>

                        <p className="text-gray-500 mt-1">
                            View all financial activity in this group.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchTransactions()}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                        Refresh
                    </button>
                </div>

                {/* Filters */}

                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {[
                        "ALL",
                        "CONTRIBUTION",
                        "PAYOUT",
                        "REFUND",
                        "LOAN_REPAYMENT",
                        "SUCCESS",
                        "PENDING",
                        "FAILED",
                    ].map((item) => (
                        <button
                            key={item}
                            onClick={() =>
                                setFilter(
                                    item as Filter
                                )
                            }
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm border transition ${
                                filter === item
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}
                        >
                            {item === "ALL"
                                ? "All"
                                : item === "LOAN_REPAYMENT" ? "Loan Repayment" : item
                                      .charAt(0)
                                      .toUpperCase() +
                                  item
                                      .slice(1)
                                      .toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Error */}

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {/* Transactions */}

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    {filteredTransactions.length ===
                    0 ? (
                        <div className="py-20 text-center">
                            <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                                <IndianRupee
                                    size={25}
                                    className="text-gray-400"
                                />
                            </div>

                            <h2 className="font-semibold mt-4">
                                No transactions found
                            </h2>

                            <p className="text-gray-500 text-sm mt-1">
                                Group transactions will appear here.
                            </p>
                        </div>
                    ) : (
                        filteredTransactions.map(
                            (transaction) => (
                                <div
                                    key={transaction.id}
                                    className="p-5 border-b last:border-b-0 hover:bg-gray-50 transition"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                                        {/* Left */}

                                        <div className="flex items-center gap-4">

                                            {getTypeIcon(
                                                transaction.type
                                            )}

                                            <div>
                                                <h3 className="font-semibold">
                                                    {getTitle(
                                                        transaction
                                                    )}
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {getDescription(
                                                        transaction
                                                    )}
                                                </p>

                                                {transaction.request && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {
                                                            transaction
                                                                .request
                                                                .reason
                                                        }
                                                    </p>
                                                )}

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(
                                                        transaction.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right */}

                                        <div className="flex items-center justify-between md:justify-end gap-8">

                                            <div className="text-right">

                                                <p
                                                    className={`font-semibold ${
                                                        transaction.type ===
                                                        "PAYOUT"
                                                            ? "text-green-600"
                                                            : transaction.type ===
                                                              "REFUND"
                                                            ? "text-orange-600"
                                                            : transaction.type === "LOAN_REPAYMENT"
                                                            ? "text-green-600"
                                                            : "text-black"
                                                    }`}
                                                >
                                                    {transaction.type ===
                                                    "PAYOUT"
                                                        ? "+"
                                                        : transaction.type ===
                                                          "REFUND" || transaction.type === "LOAN_REPAYMENT"
                                                        ? "+"
                                                        : "-"}
                                                    ₹
                                                    {Number(
                                                        transaction.amount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                                <div className="mt-1">
                                                    {getStatus(
                                                        transaction.status
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction ID */}

                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-400 break-all">
                                            Transaction ID:{" "}
                                            {transaction.id}
                                        </p>

                                        {transaction.providerReference && (
                                            <p className="text-xs text-gray-400 mt-1 break-all">
                                                Provider Ref:{" "}
                                                {
                                                    transaction.providerReference
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        )
                    )}
                </div>
            </div>
        </div>
    );
}