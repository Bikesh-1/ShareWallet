"use client";

import { signOut } from "next-auth/react";
import { Bell, Plus, Menu, X, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUserDetails } from "@/hooks/useUserDetails";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const { data: userDetails, isPending: isUserDetailsPending, isError: isUserDetailsError } = useUserDetails();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isUserDetailsPending && !isUserDetailsError && (!userDetails || !userDetails.isprofileCompleted)) {
      setPopup(true);
    }
  }, [isUserDetailsPending, isUserDetailsError, userDetails]);

  const mutation = useMutation({
    mutationFn: createUserDetails,
    onSuccess: (data) => {
      toast.success(data.message);
      setPopup(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const { data: notificationSummary } = useQuery({
    queryKey: ["notification-summary"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load notifications");
      return response.json() as Promise<{ unreadCount: number }>;
    },
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
  const unreadCount = Number(notificationSummary?.unreadCount || 0);

  useEffect(() => {
    const refreshNotificationCount = () => {
      queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    };
    window.addEventListener("sharewallet:notifications-updated", refreshNotificationCount);
    return () => window.removeEventListener("sharewallet:notifications-updated", refreshNotificationCount);
  }, [queryClient]);

  const openNotifications = () => {
    window.dispatchEvent(new Event("sharewallet:notifications"));
    setMobileMenuOpen(false);
  };

  const handleUserdetails = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, dateOfbirth, mobileNumber });
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[76px] w-full shrink-0 items-center justify-between border-b bg-white px-3 backdrop-blur-md sm:px-5 lg:px-7">
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
            <Image src="/logo.png" alt="ShareWallet" width={44} height={44} className="rounded-lg  p-1 w-28" />
          </button>
          <span className="truncate text-base font-bold text-[#171717] lg:hidden">ShareWallet</span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setPopup(true)}
            disabled={!!userDetails?.isprofileCompleted}
            className={`hidden rounded-xl border px-3 py-2 text-sm font-medium transition sm:inline-flex ${userDetails?.isprofileCompleted
              ? "cursor-not-allowed border-[#dadada] bg-white text-zinc-500"
              : "border-[#dadada] bg-white text-[#171717] hover:bg-zinc-50"
            }`}
          >
            {userDetails?.isprofileCompleted ? "Details Added" : "Add Details"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/group-draft")}
            className="hidden items-center justify-center gap-2 rounded-xl border border-[#dadada] bg-white px-3 py-2.5 text-sm font-semibold text-[#171717] transition hover:bg-zinc-50 sm:inline-flex"
          >
            <MessageCircle size={16} />
            Discussions
          </button>
          <button
            type="button"
            onClick={() => router.push("/creategroup")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition  sm:px-4"
          >
            <Plus size={16} />
            <span className="hidden xs:inline sm:inline">Create Group</span>
            <span className="sm:hidden">Create</span>
          </button>
          <button
            type="button"
            onClick={openNotifications}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dadada] bg-white text-[#171717] transition hover:bg-zinc-50"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
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
              disabled={!!userDetails?.isprofileCompleted}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:text-zinc-400"
            >
              {userDetails?.isprofileCompleted ? "Profile details added" : "Add your profile details"}
              <span className="text-xs text-zinc-400">{userDetails?.isprofileCompleted ? "Complete" : "Required"}</span>
            </button>
            <button
              type="button"
              onClick={() => { router.push("/group-draft"); setMobileMenuOpen(false); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            >
              <MessageCircle size={17} /> Group discussions
            </button>
            <button
              type="button"
              onClick={openNotifications}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            >
              <Bell size={17} /> Notifications
            </button>
          </div>
        )}
      </header>

      {popup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 text-black shadow-2xl sm:p-8">
            <h2 className="text-center text-2xl font-bold text-black">Complete Your Profile</h2>
            <p className="mt-2 text-center text-sm text-zinc-600">Fill in your details to continue.</p>
            <form onSubmit={handleUserdetails} className="mt-6 flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm text-zinc-800">Full Name</label>
                <input required type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-[#6d63ef]" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-800">Date of Birth</label>
                <input required type="date" value={dateOfbirth} onChange={(e) => setDateOfbirth(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-[#6d63ef]" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-800">Mobile Number</label>
                <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="9876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\\D/g, "").slice(0, 10))} className="w-full rounded-xl border border-zinc-700 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-[#6d63ef]" />
              </div>
              <div className="mt-1 flex gap-3">
                <button disabled={mutation.isPending} type="submit" className="flex-1 rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60">{mutation.isPending ? "Saving..." : "Save Details"}</button>
                <button type="button" onClick={() => setPopup(false)} className="flex-1 rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
