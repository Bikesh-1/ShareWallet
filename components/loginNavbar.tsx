"use client";

import { signOut } from "next-auth/react";
import { Bell, Plus, Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUserDetails } from "@/hooks/useUserDetails";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserDetails } from "@/services/user.service";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginNavbar() {
  const router = useRouter();
  const [popup, setPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [dateOfbirth, setDateOfbirth] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const { data: userDetails } = useUserDetails();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUserDetails,
    onSuccess: (data) => {
      toast.success(data.message);
      setPopup(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleUserdetails = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, dateOfbirth, mobileNumber });
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[76px] w-full shrink-0 items-center justify-between border-b border-[#dedede] bg-[#f4f4f5]/95 px-3 backdrop-blur-md sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dadada] bg-white text-[#171717] transition hover:bg-zinc-100 lg:hidden"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="hidden items-center gap-2 lg:flex"
            aria-label="ShareWallet dashboard"
          >
            <Image src="/whitelogo.png" alt="ShareWallet" width={34} height={34} className="rounded-lg bg-black p-1" />
            <span className="text-lg font-extrabold tracking-tight text-[#101014]">ShareWallet</span>
          </button>
          <span className="truncate text-base font-bold text-[#171717] lg:hidden">ShareWallet</span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPopup(true)}
            disabled={!!userDetails}
            className={`hidden rounded-xl border px-3 py-2 text-sm font-medium transition sm:inline-flex ${userDetails
              ? "cursor-not-allowed border-[#dadada] bg-white text-zinc-500"
              : "border-[#dadada] bg-white text-[#171717] hover:bg-zinc-50"
            }`}
          >
            {userDetails ? "Details Added" : "Add Details"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/creategroup")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F47EA] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4038d5] sm:px-4"
          >
            <Plus size={16} />
            <span className="hidden xs:inline sm:inline">Create Group</span>
            <span className="sm:hidden">Create</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            aria-label="Notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dadada] bg-white text-[#171717] transition hover:bg-zinc-50"
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="rounded-xl border border-[#dadada] bg-white px-3 py-2 text-sm font-medium text-[#171717] transition hover:bg-zinc-50 sm:px-4"
          >
            Logout
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute left-3 right-3 top-[68px] z-50 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl lg:hidden">
            <button
              type="button"
              onClick={() => { setPopup(true); setMobileMenuOpen(false); }}
              disabled={!!userDetails}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:text-zinc-400"
            >
              {userDetails ? "Profile details added" : "Add your profile details"}
              <span className="text-xs text-zinc-400">{userDetails ? "Complete" : "Required"}</span>
            </button>
            <button
              type="button"
              onClick={() => { router.push("/dashboard"); setMobileMenuOpen(false); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            >
              <Bell size={17} /> Notifications
            </button>
          </div>
        )}
      </header>

      {popup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#101014] p-6 shadow-2xl sm:p-8">
            <h2 className="text-center text-2xl font-bold text-white">Complete Your Profile</h2>
            <p className="mt-2 text-center text-sm text-zinc-400">Fill in your details to continue.</p>
            <form onSubmit={handleUserdetails} className="mt-6 flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm text-zinc-200">Full Name</label>
                <input required type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#6d63ef]" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-200">Date of Birth</label>
                <input required type="date" value={dateOfbirth} onChange={(e) => setDateOfbirth(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#6d63ef]" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-200">Mobile Number</label>
                <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="9876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\\D/g, "").slice(0, 10))} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#6d63ef]" />
              </div>
              <div className="mt-1 flex gap-3">
                <button disabled={mutation.isPending} type="submit" className="flex-1 rounded-xl bg-[#4F47EA] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4038d5] disabled:opacity-60">{mutation.isPending ? "Saving..." : "Save Details"}</button>
                <button type="button" onClick={() => setPopup(false)} className="flex-1 rounded-xl border border-zinc-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
