"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Loader2,
    Save,
    ShieldCheck,
    Smartphone,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";

type PayoutType = "UPI" | "BANK";

type PayoutAccount = {
    id: string;
    type: PayoutType;
    upiId?: string | null;
    accountHolderName?: string | null;
    accountNumber?: string | null;
    ifsc?: string | null;
    isVerified: boolean;
    isActive: boolean;
};

export default function PayoutAccountPage() {

    const [type, setType] =
        useState<PayoutType>("UPI");

    const [upiId, setUpiId] =
        useState("");

    const [accountHolderName, setAccountHolderName] =
        useState("");

    const [accountNumber, setAccountNumber] =
        useState("");

    const [ifsc, setIfsc] =
        useState("");


    const [saving, setSaving] =
        useState(false);

    const queryClient = useQueryClient();
    const { data: account = null, isPending: loading } = useQuery<PayoutAccount | null>({
        queryKey: ["payout-account"],
        queryFn: async () => {
            const res = await fetch("/api/payout-account", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch payout account");
            return data.account || null;
        },
        staleTime: 30_000,
    });

    useEffect(() => {
        if (!account) return;
        setType(account.type || "UPI");
        setUpiId(account.upiId || "");
        setAccountHolderName(account.accountHolderName || "");
        setAccountNumber(account.accountNumber || "");
        setIfsc(account.ifsc || "");
    }, [account]);

    function validateForm() {
        if (type === "UPI") {
            if (!upiId.trim()) {
                toast.error(
                    "Please enter your UPI ID."
                );

                return false;
            }

            if (
                !upiId.includes("@") ||
                upiId.trim().length < 5
            ) {
                toast.error(
                    "Please enter a valid UPI ID."
                );

                return false;
            }
        }

        if (type === "BANK") {
            if (!accountHolderName.trim()) {
                toast.error(
                    "Please enter account holder name."
                );

                return false;
            }

            if (!accountNumber.trim()) {
                toast.error(
                    "Please enter account number."
                );

                return false;
            }

            if (!ifsc.trim()) {
                toast.error(
                    "Please enter IFSC code."
                );

                return false;
            }

            if (
                accountNumber.trim().length < 8
            ) {
                toast.error(
                    "Please enter a valid account number."
                );

                return false;
            }

            if (
                ifsc.trim().length !== 11
            ) {
                toast.error(
                    "Please enter a valid IFSC code."
                );

                return false;
            }
        }

        return true;
    }

    async function saveAccount() {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                type,
                upiId:
                    type === "UPI"
                        ? upiId.trim()
                        : null,
                accountHolderName:
                    type === "BANK"
                        ? accountHolderName.trim()
                        : null,
                accountNumber:
                    type === "BANK"
                        ? accountNumber.trim()
                        : null,
                ifsc:
                    type === "BANK"
                        ? ifsc.trim().toUpperCase()
                        : null,
            };

            const method = account
                ? "PATCH"
                : "POST";

            const res = await fetch(
                "/api/payout-account",
                {
                    method,
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        payload
                    ),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to save payout account"
                );
            }


            toast.success(
                account
                    ? "Payout account updated successfully."
                    : "Payout account added successfully."
            );

            await queryClient.invalidateQueries({ queryKey: ["payout-account"] });
        } catch (error) {
            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save payout account"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        size={40}
                        className="animate-spin"
                    />

                    <p className="text-sm text-gray-500">
                        Loading payout account...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white text-black px-4 py-8 md:px-8">
            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                            <Wallet size={22} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                Payout Account
                            </h1>

                            <p className="text-sm text-gray-500">
                                Add the account where you want to receive payouts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status */}
                {account && (
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                        account.isVerified
                                            ? "bg-green-100 text-green-600"
                                            : "bg-yellow-100 text-yellow-600"
                                    }`}
                                >
                                    {account.isVerified ? (
                                        <ShieldCheck
                                            size={20}
                                        />
                                    ) : (
                                        <AlertCircle
                                            size={20}
                                        />
                                    )}
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        {account.isVerified
                                            ? "Account Verified"
                                            : "Verification Pending"}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {account.isActive
                                            ? "This account is active for payouts."
                                            : "This account is inactive."}
                                    </p>
                                </div>
                            </div>

                            <div
                                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                                    account.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {account.isActive
                                    ? "ACTIVE"
                                    : "INACTIVE"}
                            </div>

                        </div>

                    </div>
                )}

                {/* Account Form */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">

                    <h2 className="text-xl font-semibold">
                        {account
                            ? "Update Payout Details"
                            : "Add Payout Details"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Choose how you want to receive your money.
                    </p>

                    {/* Type */}
                    <div className="mt-6 grid gap-3 md:grid-cols-2">

                        <button
                            type="button"
                            onClick={() =>
                                setType("UPI")
                            }
                            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                type === "UPI"
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            <Smartphone
                                size={21}
                            />

                            <div>
                                <p className="font-semibold">
                                    UPI
                                </p>

                                <p
                                    className={`text-xs ${
                                        type === "UPI"
                                            ? "text-gray-300"
                                            : "text-gray-500"
                                    }`}
                                >
                                    Receive through UPI
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setType("BANK")
                            }
                            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                type === "BANK"
                                    ? "border-black bg-black text-white"
                                    : "border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            <Building2
                                size={21}
                            />

                            <div>
                                <p className="font-semibold">
                                    Bank Account
                                </p>

                                <p
                                    className={`text-xs ${
                                        type === "BANK"
                                            ? "text-gray-300"
                                            : "text-gray-500"
                                    }`}
                                >
                                    Receive directly in bank
                                </p>
                            </div>
                        </button>

                    </div>

                    {/* UPI */}
                    {type === "UPI" && (
                        <div className="mt-6">

                            <label className="mb-2 block text-sm font-medium">
                                UPI ID
                            </label>

                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) =>
                                    setUpiId(
                                        e.target.value
                                    )
                                }
                                placeholder="example@upi"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                            />

                            <p className="mt-2 text-xs text-gray-500">
                                Example: yourname@upi
                            </p>

                        </div>
                    )}

                    {/* BANK */}
                    {type === "BANK" && (
                        <div className="mt-6 space-y-5">

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Account Holder Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        accountHolderName
                                    }
                                    onChange={(e) =>
                                        setAccountHolderName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter account holder name"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Account Number
                                </label>

                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        accountNumber
                                    }
                                    onChange={(e) =>
                                        setAccountNumber(
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        )
                                    }
                                    placeholder="Enter bank account number"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    IFSC Code
                                </label>

                                <input
                                    type="text"
                                    value={ifsc}
                                    onChange={(e) =>
                                        setIfsc(
                                            e.target.value
                                                .toUpperCase()
                                        )
                                    }
                                    placeholder="SBIN0001234"
                                    maxLength={11}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 uppercase outline-none transition focus:border-black"
                                />
                            </div>

                        </div>
                    )}

                    {/* Security Note */}
                    <div className="mt-6 flex gap-3 rounded-xl bg-gray-50 p-4">
                        <ShieldCheck
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="text-sm font-medium">
                                Your details are secure
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Your payout information is used only for processing eligible payouts.
                            </p>
                        </div>
                    </div>

                    {/* Save */}
                    <button
                        type="button"
                        onClick={saveAccount}
                        disabled={saving}
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {account
                                    ? "Update Payout Account"
                                    : "Save Payout Account"}
                            </>
                        )}
                    </button>

                </div>
            </div>
        </main>
    );
}