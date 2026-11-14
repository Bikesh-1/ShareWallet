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

type Transaction = {
    id: string;
    amount: number;
    type: "CONTRIBUTION" | "PAYOUT" | "REFUND" | "LOAN_REPAYMENT";
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
    provider?: string | null;
    providerReference?: string | null;
    createdAt: string;
    group?: {
        id: string;
        groupName?: string | null;
        groupCode?: string | null;
    } | null;
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

export default function TransactionsPage() {
    const [filter, setFilter] = useState<Filter>("ALL");
    const { data: transactions = [], isPending: loading, error: queryError, refetch: fetchTransactions } = useQuery<Transaction[]>({
        queryKey: ["transactions"],
        queryFn: async () => {
            const response = await fetch("/api/transactions", { cache: "no-store" });
            const data = await response.json();
            if (!response.ok) throw new Error(data?.error || "Failed to load transactions");
            return data.transactions || [];
        },
        staleTime: 5_000,
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
    });
    const error = queryError instanceof Error ? queryError.message : "";

    const successful = transactions.filter((item) => item.status === "SUCCESS");
    const totalContributions = successful.filter((item) => item.type === "CONTRIBUTION").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalPayouts = successful.filter((item) => item.type === "PAYOUT" || item.type === "REFUND").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalRepayments = successful.filter((item) => item.type === "LOAN_REPAYMENT").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const pendingAmount = transactions.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + Number(item.amount || 0), 0);

    function exportStatement() {
        const columns = ["Date", "Transaction ID", "Type", "Status", "Amount (INR)", "Group", "Description", "Provider", "Provider Reference"];
        const escapeCsv = (value: unknown) => {
            let text = String(value ?? "");
            if (/^[=+@\\-\\t\\r]/.test(text)) text = "'" + text;
            return '"' + text.replace(/"/g, '""') + '"';
        };
        const rows = filteredTransactions.map((item) => [
            new Date(item.createdAt).toISOString(),
            item.id,
            item.type,
            item.status,
            item.amount,
            item.group?.groupName || "",
            item.request?.reason || "",
            item.provider || "",
            item.providerReference || "",
        ]);
        const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
        const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sharewallet-statement-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    const filteredTransactions = transactions.filter((transaction) => {
        if (filter === "ALL") return true;

        return (
            transaction.type === filter ||
            transaction.status === filter
        );
    });

    function getTypeIcon(type: Transaction["type"]) {
        if (type === "CONTRIBUTION") {
            return (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowUpRight
                        size={20}
                        className="text-blue-600"
                    />
                </div>
            );
        }

        if (type === "PAYOUT") {
            return (
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <ArrowDownLeft
                        size={20}
                        className="text-green-600"
                    />
                </div>
            );
        }

        if (type === "LOAN_REPAYMENT") {
            return <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center"><ArrowUpRight size={20} className="text-violet-600" /></div>;
        }

        return (
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <RotateCcw
                    size={20}
                    className="text-orange-600"
                />
            </div>
        );
    }

    function getStatus(status: Transaction["status"]) {
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

    function getTitle(transaction: Transaction) {
        if (transaction.type === "CONTRIBUTION") {
            return "Contribution";
        }

        if (transaction.type === "PAYOUT") {
            return "Payout";
        }

        if (transaction.type === "LOAN_REPAYMENT") return "Loan repayment";
        return "Refund";
    }

    function getDescription(transaction: Transaction) {
        if (transaction.type === "CONTRIBUTION") {
            return (
                transaction.group?.groupName ||
                "Group contribution"
            );
        }

        if (transaction.type === "PAYOUT") {
            return (
                transaction.request?.reason ||
                "Money payout"
            );
        }

        if (transaction.type === "LOAN_REPAYMENT") return transaction.group?.groupName || "Emergency-fund repayment";
        return "Payment refunded";
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2
                    size={35}
                    className="animate-spin text-black"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa] text-black px-4 py-8 md:px-10 lg:px-16">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Transactions
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Track all your contributions, payouts and refunds.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={exportStatement}
                            disabled={filteredTransactions.length === 0}
                            className="w-fit px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            Export statement
                        </button>
                        <button
                            onClick={() => fetchTransactions()}
                            className="w-fit px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                        >
                            Refresh
                        </button>
                    </div>
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
                                setFilter(item as Filter)
                            }
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm border transition ${
                                filter === item
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}
                        >
                            {item === "ALL"
                                ? "All"
                                : item === "LOAN_REPAYMENT" ? "Loan Repayment" : item.charAt(0) +
                                  item
                                      .slice(1)
                                      .toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Financial summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-sm text-gray-500">Total contributions</p>
                        <p className="mt-2 text-2xl font-bold">₹{totalContributions.toLocaleString("en-IN")}</p>
                        <p className="mt-1 text-xs text-gray-400">Successful payments</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-sm text-gray-500">Payouts & refunds</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">₹{totalPayouts.toLocaleString("en-IN")}</p>
                        <p className="mt-1 text-xs text-gray-400">Successful payout/refund transactions</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-sm text-gray-500">Loan repayments</p>
                        <p className="mt-2 text-2xl font-bold">₹{totalRepayments.toLocaleString("en-IN")}</p>
                        <p className="mt-1 text-xs text-gray-400">Successfully repaid</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-sm text-gray-500">Pending amount</p>
                        <p className="mt-2 text-2xl font-bold text-amber-600">₹{pendingAmount.toLocaleString("en-IN")}</p>
                        <p className="mt-1 text-xs text-gray-400">Awaiting payment confirmation</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                        {error}
                    </div>
                )}

                {/* Transaction List */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                    {filteredTransactions.length === 0 ? (
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
                                Your transaction history will appear here.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {filteredTransactions.map(
                                (transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b last:border-b-0 hover:bg-gray-50 transition"
                                    >
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

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(
                                                        transaction.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

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
                                                            : "text-black"
                                                    }`}
                                                >
                                                    {transaction.type ===
                                                    "PAYOUT"
                                                        ? "+"
                                                        : transaction.type ===
                                                          "REFUND"
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
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}