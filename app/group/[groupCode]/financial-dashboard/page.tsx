"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowDownLeft,
    ArrowUpRight,
    RotateCcw,
    CheckCircle2,
    Clock3,
    XCircle,
    Loader2,
    IndianRupee,
    Users,
    Wallet,
    TrendingUp,
    FileText,
} from "lucide-react";

type RequestStats = {
    id: string;
    reason: string;
    amount: number;
    collectedAmount: number;
    remainingAmount: number;
    collectionPercentage: number;
    totalApprovals: number;
    approvedApprovals: number;
    rejectedApprovals: number;
    pendingApprovals: number;
    allApproved: boolean;
};

type DashboardData = {
    summary: {
        totalContributions: number;
        totalPayouts: number;
        totalRefunds: number;
        totalRepayments: number;
        netFlow: number;
        totalRequests: number;
    };
    requests: RequestStats[];
};

export default function FinancialDashboardPage() {
    const params = useParams();
    const groupCode = params.groupCode as string;

    const { data, isPending: loading, error: queryError, refetch: fetchDashboard } = useQuery<DashboardData>({
        queryKey: ["group-financial-dashboard", groupCode],
        queryFn: async () => {
            const response = await fetch(`/api/group/${encodeURIComponent(groupCode)}/financial-dashboard`, { cache: "no-store" });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || "Failed to load financial dashboard");
            return result;
        },
        enabled: !!groupCode,
        staleTime: 5_000,
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
    });
    const error = queryError instanceof Error ? queryError.message : "";

    function money(amount: number) {
        return Number(amount || 0).toLocaleString(
            "en-IN"
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2
                    size={36}
                    className="animate-spin text-black"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center">
                    <XCircle
                        size={40}
                        className="mx-auto text-red-500"
                    />

                    <h2 className="font-semibold text-lg mt-4">
                        Unable to load dashboard
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={() => fetchDashboard()}
                        className="mt-5 px-5 py-2 rounded-lg bg-black text-white"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const {
        totalContributions,
        totalPayouts,
        totalRefunds,
        totalRepayments,
        netFlow,
        totalRequests,
    } = data.summary;

    return (
        <div className="min-h-screen bg-[#fafafa] text-black px-4 py-8 md:px-10 lg:px-16">
            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Financial Dashboard
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Track your group complete financial activity.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchDashboard()}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

                    {/* Contributions */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <ArrowUpRight
                                    size={20}
                                    className="text-blue-600"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                CONTRIBUTIONS
                            </span>
                        </div>

                        <p className="text-2xl font-bold mt-5">
                            ₹{money(totalContributions)}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Money collected
                        </p>
                    </div>

                    {/* Payouts */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <ArrowDownLeft
                                    size={20}
                                    className="text-green-600"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                PAYOUTS
                            </span>
                        </div>

                        <p className="text-2xl font-bold mt-5">
                            ₹{money(totalPayouts)}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Money paid out
                        </p>
                    </div>

                    {/* Refunds */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <RotateCcw
                                    size={20}
                                    className="text-orange-600"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                REFUNDS
                            </span>
                        </div>

                        <p className="text-2xl font-bold mt-5">
                            ₹{money(totalRefunds)}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Money refunded
                        </p>
                    </div>

                    {/* Loan Repayments */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                                <ArrowUpRight size={20} className="text-violet-600" />
                            </div>
                            <span className="text-xs text-gray-400">REPAYMENTS</span>
                        </div>
                        <p className="text-2xl font-bold mt-5">₹{money(totalRepayments)}</p>
                        <p className="text-sm text-gray-500 mt-1">Loan repayments received</p>
                    </div>

                    {/* Net Flow */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <TrendingUp
                                    size={20}
                                    className="text-purple-600"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                NET FLOW
                            </span>
                        </div>

                        <p
                            className={`text-2xl font-bold mt-5 ${
                                netFlow >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            ₹{money(netFlow)}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Current group flow
                        </p>
                    </div>

                    {/* Requests */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileText
                                    size={20}
                                    className="text-gray-700"
                                />
                            </div>

                            <span className="text-xs text-gray-400">
                                REQUESTS
                            </span>
                        </div>

                        <p className="text-2xl font-bold mt-5">
                            {totalRequests}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Total money requests
                        </p>
                    </div>
                </div>

                {/* Balance Overview */}

                <div className="bg-black text-white rounded-2xl p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                        <div>
                            <p className="text-gray-400 text-sm">
                                GROUP NET BALANCE
                            </p>

                            <h2 className="text-4xl font-bold mt-2">
                                ₹{money(netFlow)}
                            </h2>

                            <p className="text-gray-400 text-sm mt-2">
                                Contributions − payouts − refunds + repayments
                            </p>
                        </div>

                        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Wallet size={30} />
                        </div>
                    </div>
                </div>

                {/* Request Collection */}

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold">
                                Money Requests
                            </h2>

                            <p className="text-sm text-gray-500">
                                Collection and approval progress.
                            </p>
                        </div>
                    </div>

                    {data.requests.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
                            <FileText
                                size={35}
                                className="mx-auto text-gray-300"
                            />

                            <h3 className="font-semibold mt-4">
                                No money requests
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                Requests will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {data.requests.map(
                                (request) => (
                                    <div
                                        key={request.id}
                                        className="bg-white border border-gray-200 rounded-2xl p-6"
                                    >

                                        {/* Request Header */}

                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                    <IndianRupee
                                                        size={19}
                                                    />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold">
                                                        {request.reason}
                                                    </h3>

                                                    <p className="text-xs text-gray-400 mt-1 break-all">
                                                        Request ID:{" "}
                                                        {
                                                            request.id
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {request.allApproved ? (
                                                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                                    <CheckCircle2
                                                        size={14}
                                                    />
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                                                    <Clock3
                                                        size={14}
                                                    />
                                                    Pending
                                                </span>
                                            )}
                                        </div>

                                        {/* Amount */}

                                        <div className="grid grid-cols-3 gap-3 mt-6">

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Requested
                                                </p>

                                                <p className="font-semibold mt-1">
                                                    ₹
                                                    {money(
                                                        request.amount
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Collected
                                                </p>

                                                <p className="font-semibold mt-1 text-green-600">
                                                    ₹
                                                    {money(
                                                        request.collectedAmount
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Remaining
                                                </p>

                                                <p className="font-semibold mt-1 text-red-500">
                                                    ₹
                                                    {money(
                                                        request.remainingAmount
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Collection Progress */}

                                        <div className="mt-6">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-gray-500">
                                                    Collection
                                                </span>

                                                <span className="font-medium">
                                                    {Math.min(
                                                        request.collectionPercentage,
                                                        100
                                                    ).toFixed(
                                                        0
                                                    )}
                                                    %
                                                </span>
                                            </div>

                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-black rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min(
                                                            request.collectionPercentage,
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Approval Stats */}

                                        <div className="mt-6 pt-5 border-t border-gray-100">

                                            <div className="flex items-center gap-2 mb-3">
                                                <Users
                                                    size={16}
                                                />

                                                <span className="text-sm font-medium">
                                                    Approval Status
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">

                                                <div className="rounded-lg bg-green-50 p-3">
                                                    <p className="text-xs text-green-600">
                                                        Approved
                                                    </p>

                                                    <p className="font-bold text-green-700 mt-1">
                                                        {
                                                            request.approvedApprovals
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-lg bg-yellow-50 p-3">
                                                    <p className="text-xs text-yellow-600">
                                                        Pending
                                                    </p>

                                                    <p className="font-bold text-yellow-700 mt-1">
                                                        {
                                                            request.pendingApprovals
                                                        }
                                                    </p>
                                                </div>

                                                <div className="rounded-lg bg-red-50 p-3">
                                                    <p className="text-xs text-red-600">
                                                        Rejected
                                                    </p>

                                                    <p className="font-bold text-red-700 mt-1">
                                                        {
                                                            request.rejectedApprovals
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Completion */}

                                        {request.collectionPercentage >=
                                            100 &&
                                            request.allApproved && (
                                                <div className="mt-5 rounded-lg bg-green-50 border border-green-100 p-3">
                                                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                                        <CheckCircle2
                                                            size={
                                                                17
                                                            }
                                                        />
                                                        Request ready for payout
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Navigation */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <a
                        href={`/group/${groupCode}/transactions`}
                        className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-black transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <IndianRupee size={20} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    View Transactions
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    See complete transaction history.
                                </p>
                            </div>
                        </div>
                    </a>

                    <a
                        href={`/group/${groupCode}`}
                        className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-black transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Users size={20} />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Back to Group
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Return to your group.
                                </p>
                            </div>
                        </div>
                    </a>

                </div>
            </div>
        </div>
    );
}