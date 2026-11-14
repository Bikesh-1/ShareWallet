"use client";

import LoginNavbar from "../../components/loginNavbar";
import Home from "../../components/home";
import Sidebarmsg from "../../components/sidebarusermsg";
import Image from "next/image";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  House, Users, Wallet, Activity, UserRound, Settings, Bell,
  Search, Plus, ExternalLink, RefreshCw,
  CheckCircle2, Clock3, XCircle, ArrowDownLeft, ArrowUpRight,
  ShieldCheck, LogOut, UserPlus, CreditCard
} from "lucide-react";
import { useGroupDetails } from "@/hooks/useGroupDetails";
import { useFriendList } from "@/hooks/useFriendList";
import { useUserDetails } from "@/hooks/useUserDetails";
import { createFriend } from "@/services/friend.service";
import { useRouter } from "next/navigation";
import HomeSection from "@/components/dashboard/HomeSection";
import GroupsSection from "@/components/dashboard/GroupsSection";
import FriendsSection from "@/components/dashboard/FriendsSection";
import ContributionSection from "@/components/dashboard/ContributionSection";
import ActivitySection from "@/components/dashboard/ActivitySection";
import NotificationsSection from "@/components/dashboard/NotificationsSection";
import ProfileSection from "@/components/dashboard/ProfileSection";
import SettingsSection from "@/components/dashboard/SettingsSection";

const menuItems = [
  { id: "home", label: "Home", icon: House },
  { id: "group", label: "Groups", icon: Users },
  { id: "friend", label: "Friends", icon: Users },
  { id: "contribution", label: "Contribution", icon: Wallet },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "notification", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "setting", label: "Setting", icon: Settings },
];

type Transaction = {
  id: string;
  amount: number | string;
  type: "CONTRIBUTION" | "PAYOUT" | "REFUND" | "LOAN_REPAYMENT";
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  createdAt: string;
  group?: { 
    id: string; 
    groupName?: string; 
    groupCode?: string 
  } | null;
  request?: { 
    reason?: string; 
    month?: string 
  } | null;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  group?: { 
    id: string; 
    groupName: string; 
    groupCode: string 
  } | null;
  request?: { 
    id: string; 
    reason: string; 
    amount: string; 
    status: string 
  } | null;
};

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

function PanelHeader({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action?: React.ReactNode 
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#6d63ef]">
          ShareWallet
          </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#101014]">{title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  detail, 
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  detail: string; 
  icon: any 
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#101014] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{label}</p>
        <span className="rounded-xl bg-[#4F47EA]/15 p-2 text-[#8d86ff]">
        <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{detail}</p>
    </div>
  );
}

function EmptyState({ 
  title, 
  detail 
}: { 
  title: string; 
  detail: string 
}) {
  return <div className="rounded-2xl border border-dashed border-zinc-700 px-6 py-14 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
      <Wallet size={21} />
      </div>
    <h3 className="font-semibold text-[#101014]">
      {title}
      </h3>
      <p className="mt-1 text-sm text-zinc-500">
        {detail}
        </p>
  </div>;
}

export default function Dashboard() {
  const [page, setPage] = useState("home");
  const [friendCode, setFriendCode] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("ALL");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: transactions = [], isPending: transactionsLoading, error: transactionsQueryError } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not load transactions");
      return data.transactions || [];
    },
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
  const transactionsError = transactionsQueryError?.message || "";

  const { 
    data: notifications = [], isPending: notificationsLoading, error: notificationsQueryError } = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load notifications");
      return data.notifications || [];
    },
    staleTime: 5_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
  const notificationsError = notificationsQueryError?.message || "";

  const { data: groups = [], isPending: groupsLoading, isError: groupsError, error: groupError } = useGroupDetails();
  const { data: friends = [], isPending: friendsLoading, isError: friendsError, error: friendError } = useFriendList();
  const { data: profile, isPending: profileLoading, isError: profileError, error: profileErrorObj } = useUserDetails();



  useEffect(() => {
    const openNotifications = () => setPage("notification");
    window.addEventListener("sharewallet:notifications", openNotifications);
    return () => window.removeEventListener("sharewallet:notifications", openNotifications);
  }, []);



  async function markNotificationRead(id?: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { markAllRead: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update notification");
      queryClient.setQueryData<NotificationItem[]>(["notifications"], (current = []) => current.map((item) => !id || item.id === id ? { ...item, read: true } : item));
      window.dispatchEvent(new Event("sharewallet:notifications-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notification");
    }
  }

  const addFriendMutation = useMutation({
    mutationFn: createFriend,
    onSuccess: (data) => {
      toast.success(data.message || "Friend request sent");
      setFriendCode("");
      queryClient.invalidateQueries({ queryKey: ["friend"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const paidTransactions = transactions.filter((item) => item.status === "SUCCESS");
  const totalContributed = paidTransactions.filter((item) => item.type === "CONTRIBUTION").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalPayouts = paidTransactions.filter((item) => item.type === "PAYOUT").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingTransactions = transactions.filter((item) => item.status === "PENDING");
  const filteredGroups = groups.filter((group: any) => (group.groupName || "").toLowerCase().includes(groupSearch.toLowerCase()) || (group.groupCode || "").toLowerCase().includes(groupSearch.toLowerCase()));
  const filteredFriends = friends.filter((friend: any) => (friend.receiver?.userdetails?.name || "").toLowerCase().includes(friendSearch.toLowerCase()) || (friend.receiver?.coustumerId || "").toLowerCase().includes(friendSearch.toLowerCase()));
  const filteredTransactions = transactions.filter((item) => transactionFilter === "ALL" || item.type === transactionFilter || item.status === transactionFilter);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["group"] });
    queryClient.invalidateQueries({ queryKey: ["friend"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  const transactionStatus = (status: string) => {
    const style = status === "SUCCESS" ? "text-emerald-400 bg-emerald-400/10" : status === "FAILED" ? "text-red-400 bg-red-400/10" : status === "REFUNDED" ? "text-orange-300 bg-orange-300/10" : "text-amber-300 bg-amber-300/10";
    const Icon = status === "SUCCESS" ? CheckCircle2 : status === "FAILED" ? XCircle : Clock3;
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${style}`}><Icon size={13} />{status}</span>;
  };

  const transactionRows = (items: Transaction[]) => items.length ? (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#101014]">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 border-b border-zinc-800 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#4F47EA]/15 p-3 text-[#9690ff]">{item.type === "CONTRIBUTION" ? <ArrowUpRight size={18} /> : item.type === "PAYOUT" ? <ArrowDownLeft size={18} /> : <RefreshCw size={18} />}</span>
            <div><p className="font-medium text-white">{item.type === "PAYOUT" && item.request ? "Money request received" : item.type === "LOAN_REPAYMENT" ? "Loan repayment sent" : item.type.charAt(0) + item.type.slice(1).toLowerCase()}</p><p className="mt-1 text-xs text-zinc-500">{item.group?.groupName || item.request?.reason || "ShareWallet transaction"} · {new Date(item.createdAt).toLocaleString()}</p></div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end"><span className="font-semibold text-white">{money(Number(item.amount || 0))}</span>{transactionStatus(item.status)}</div>
        </div>
      ))}
    </div>
  ) : <EmptyState title="No transactions yet" detail="Your contribution and payment records will appear here." />;

  const renderSectionContent = () => {
    if (page === "home") return <Home />;
    if (page === "home__unused") return <div className="space-y-7">
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-[#15142b] to-[#101014] p-6 sm:p-8">
        <p className="text-sm text-zinc-400">Welcome back,</p>
        <h1 className="mt-1 text-3xl font-bold text-white">{profile?.name || "ShareWallet member"}</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">Your savings, groups and contributions — all in one place.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-black/30 px-3 py-2 text-xs text-zinc-300">Customer ID <span className="font-mono text-white">{profile?.user?.coustumerId || "—"}</span></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My Groups" value={String(groups.length)} detail="Groups you are a member of" icon={Users} />
        <StatCard label="Friends" value={String(friends.length)} detail="Connected friends" icon={UserRound} />
        <StatCard label="Contributions Paid" value={money(totalContributed)} detail="Successful contribution transactions" icon={Wallet} />
        <StatCard label="Pending Payments" value={String(pendingTransactions.length)} detail={money(pendingTransactions.reduce((s, t) => s + Number(t.amount || 0), 0)) + " awaiting status"} icon={Clock3} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-zinc-800 bg-[#101014] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Groups</h2>
            <button onClick={() => setPage("group")} className="text-sm text-black">View all</button>
          </div>
          {groupsLoading ? <p className="text-sm text-zinc-500">Loading groups…</p> : groupsError ? <p className="text-sm text-red-400">{groupError.message}</p> : groups.length ? <div className="space-y-3">{groups.slice(0, 4).map((group: any) => <div key={group.id} className="flex items-center justify-between rounded-xl border border-zinc-800 p-3"><div><p className="font-medium text-white">{group.groupName}</p><p className="mt-1 text-xs text-zinc-500">{group.groupmember?.length || 0} members · {money(Number(group.monthlyContribution || 0))}/month</p></div><button onClick={() => router.push(`/group/${group.groupCode}`)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black">Open</button></div>)}</div> : <EmptyState title="No groups yet" detail="Create a savings group or join one with your friends." />}</section>
        <section className="rounded-2xl border border-zinc-800 bg-[#101014] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-white">Recent Activity</h2><button onClick={() => setPage("activity")} className="text-sm text-[#a49fff]">View all</button></div>{transactionsLoading ? <p className="text-sm text-zinc-500">Loading activity…</p> : transactionRows(transactions.slice(0, 3))}</section>
      </div>
    </div>;

    if (page === "group") return <div>
      <PanelHeader title="Your Groups" description="Manage your savings groups, review contributions and open group workspaces." action={<button onClick={() => router.push("/creategroup")} className="inline-flex items-center gap-2 rounded-xl bg-[#4F47EA] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Create Group</button>} />
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#101014] px-3"><Search size={17} className="text-zinc-500" /><input value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} placeholder="Search by group name or code…" className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600" /></div>
      {groupsLoading ? <p className="text-zinc-400">Loading groups…</p> : groupsError ? <p className="text-red-400">{groupError.message}</p> : filteredGroups.length ? <div className="grid gap-4 lg:grid-cols-2">{filteredGroups.map((group: any) => <article key={group.id} className="rounded-2xl border border-zinc-800 bg-[#101014] p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-white">{group.groupName}</h2><p className="mt-1 text-xs text-zinc-500">Code: {group.groupCode}</p></div><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">Joined</span></div><p className="mt-4 min-h-10 text-sm text-zinc-400">{group.description || "No group description added."}</p><div className="my-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-black/40 p-3"><p className="text-xs text-zinc-500">Monthly contribution</p><p className="mt-1 font-semibold text-white">{money(Number(group.monthlyContribution || 0))}</p></div><div className="rounded-xl bg-black/40 p-3"><p className="text-xs text-zinc-500">Total contributions</p><p className="mt-1 font-semibold text-white">{money(Number(group.totalAmount || 0))}</p></div><div className="rounded-xl bg-black/40 p-3"><p className="text-xs text-zinc-500">Members</p><p className="mt-1 font-semibold text-white">{group.groupmember?.length || 0}</p></div><div className="rounded-xl bg-black/40 p-3"><p className="text-xs text-zinc-500">Monthly due date</p><p className="mt-1 font-semibold text-white">{group.dueDate ? new Date(group.dueDate).toLocaleDateString() : "Not set"}</p></div></div><button onClick={() => router.push(`/group/${group.groupCode}`)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-black">Open group workspace <ExternalLink size={15} /></button></article>)}</div> : <EmptyState title="No matching groups" detail="Try another search or create a new savings group." />}
    </div>;

    if (page === "friend") return <div>
      <PanelHeader title="Friends" description="Connect with people on ShareWallet using their unique customer ID." />
      <form onSubmit={(e) => { e.preventDefault(); if (!friendCode.trim()) return; addFriendMutation.mutate({ coustumerId: friendCode.trim() }); }} className="mb-6 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#101014] p-4 sm:flex-row"><input value={friendCode} onChange={(e) => setFriendCode(e.target.value)} placeholder="Enter friend customer ID" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#6d63ef]" /><button disabled={addFriendMutation.isPending || !friendCode.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F47EA] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><UserPlus size={16} />{addFriendMutation.isPending ? "Sending…" : "Add friend"}</button></form>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#101014] px-3"><Search size={17} className="text-zinc-500" /><input value={friendSearch} onChange={(e) => setFriendSearch(e.target.value)} placeholder="Search friends…" className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600" /></div>
      {friendsLoading ? <p className="text-zinc-400">Loading friends…</p> : friendsError ? <p className="text-red-400">{friendError.message}</p> : filteredFriends.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredFriends.map((friend: any) =>
        <div key={friend.receiver?.coustumerId} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#101014] p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4F47EA]/20 font-bold text-[#aaa4ff]">{friend.receiver?.userdetails?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {friend.receiver?.userdetails?.name || "Profile not completed"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {friend.receiver?.coustumerId}

            </p>
          </div>
        </div>
      )}
      </div> : <EmptyState title="No friends found" detail="Add a friend using their ShareWallet customer ID." />}
    </div>;

    if (page === "contribution") return <div>
      <PanelHeader title="Contributions" description="Review your contribution payments and their latest payment status." action={<button onClick={refresh} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-black"><RefreshCw size={15} /> Refresh</button>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Successful contributions" value={money(totalContributed)} detail="Based on successful transactions" icon={CheckCircle2} /><StatCard label="Pending transactions" value={String(pendingTransactions.length)} detail={money(pendingTransactions.reduce((s, t) => s + Number(t.amount || 0), 0)) + " pending amount"} icon={Clock3} /><StatCard label="Total payouts" value={money(totalPayouts)} detail="Successful payouts" icon={CreditCard} /></div>
      <div className="mb-4 flex flex-wrap gap-2">{["ALL", "CONTRIBUTION", "PENDING", "SUCCESS", "FAILED"].map((filter) => <button key={filter} onClick={() => setTransactionFilter(filter)} className={`rounded-lg px-3 py-2 text-xs ${transactionFilter === filter ? "bg-[#4F47EA] text-white" : "border border-zinc-700 text-zinc-400"}`}>{filter === "ALL" ? "All" : filter}</button>)}</div>
      {transactionsLoading ? <p className="text-zinc-400">Loading payments…</p> : transactionsError ? <p className="text-red-400">{transactionsError}</p> : transactionRows(filteredTransactions)}
    </div>;

    if (page === "activity") return <div>
      <PanelHeader title="Activity" description="A chronological timeline of your recent payments and group transactions." action={<button onClick={refresh} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-black"><RefreshCw size={15} /> Refresh</button>} />
      {transactionsLoading ? <p className="text-zinc-400">Loading activity…</p> : transactionsError ? <p className="text-red-400">{transactionsError}</p> : transactionRows(transactions)}
    </div>;

    if (page === "notification") return <div>
      <PanelHeader title="Notifications" description="Payment updates and important activity from your ShareWallet account." action={
        <div className="flex flex-wrap gap-2">
          {notifications.some((item) => !item.read) && <button onClick={() => markNotificationRead()} className="rounded-xl bg-[#4F47EA] px-3 py-2.5 text-sm font-semibold text-white">Mark all as read</button>}
          <button onClick={refresh} className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm text-black"><RefreshCw size={15} /> Refresh</button>
        </div>} />
      {notificationsLoading ? <p className="text-sm text-zinc-500">Loading notifications…</p> : notificationsError ? <p className="text-sm text-red-500">{notificationsError}</p> : notifications.length ? <div className="space-y-3">
        {notifications.map((item) => <article key={item.id} className={`flex gap-3 rounded-2xl border p-4 ${item.read ? "border-zinc-200 bg-white" : "border-[#4F47EA]/30 bg-[#4F47EA]/5"}`}>
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.read ? "bg-zinc-300" : "bg-[#4F47EA]"}`} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2"><p className="font-semibold text-[#171717]">{item.title}</p>{!item.read && <span className="rounded-full bg-[#4F47EA]/10 px-2 py-1 text-[10px] font-semibold text-[#4F47EA]">NEW</span>}</div>
            <p className="mt-1 text-sm text-zinc-600">{item.message}</p>
            {item.group?.groupName && <p className="mt-1 text-xs text-zinc-500">Group: {item.group.groupName}</p>}
            <p className="mt-2 text-xs text-zinc-400">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
          {!item.read && <button onClick={() => markNotificationRead(item.id)} className="shrink-0 self-center rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100">Mark read</button>}
        </article>)}
      </div> : <EmptyState title="You're all caught up" detail="New payment and account updates will appear here." />}
    </div>;

    if (page === "profile") return <div>
      <PanelHeader title="My Profile" description="Your ShareWallet account identity and personal details." />
      {profileLoading ? <p className="text-zinc-400">Loading profile…</p> : profileError ? <p className="text-red-400">{profileErrorObj?.message}</p> : profile ? <div className="max-w-2xl rounded-2xl border border-zinc-800 bg-[#101014] p-6"><div className="mb-6 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4F47EA]/20 text-2xl font-bold text-[#aaa4ff]">{profile.name?.charAt(0)?.toUpperCase() || "U"}</div><div><h2 className="text-xl font-semibold text-white">{profile.name}</h2><p className="mt-1 text-sm text-zinc-500">ShareWallet member</p></div></div><div className="space-y-4">{[["Full name", profile.name], ["Customer ID", profile.user?.coustumerId], ["Mobile number", profile.mobileNumber], ["Date of birth", profile.dateOfbirth ? new Date(profile.dateOfbirth).toLocaleDateString() : "Not added"]].map(([label, value]) => <div key={label} className="flex flex-col gap-1 border-b border-zinc-800 pb-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-sm text-zinc-500">{label}</span><span className="text-sm font-medium text-white">{value || "—"}</span></div>)}</div><a href="/profile/edit" className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black">Edit profile</a></div> : <EmptyState title="Profile details unavailable" detail="Complete your profile from the dashboard navigation." />}
    </div>;

    return <div>
      <PanelHeader title="Settings" description="Account access and security controls." />
      <div className="max-w-2xl space-y-4">
        <div className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-[#101014] p-5"><ShieldCheck className="mt-1 text-emerald-400" size={22} /><div><h2 className="font-semibold text-white">Account security</h2><p className="mt-1 text-sm text-zinc-400">Your account uses the existing authenticated ShareWallet session. Sign out when you finish using a shared device.</p></div></div>
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-[#101014] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-white">Sign out</h2><p className="mt-1 text-sm text-zinc-400">End your current ShareWallet session on this device.</p></div><button onClick={() => signOut({ callbackUrl: "/signin" })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-300"><LogOut size={16} /> Sign out</button></div>
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#101014] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold text-white">Change password</h2><p className="mt-1 text-sm text-zinc-400">Update your password after confirming your current password.</p></div><a href="/change-password" className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black">Change password</a></div>
      </div>
    </div>;
  };

  const sectionComponents = {
    home: HomeSection,
    group: GroupsSection,
    friend: FriendsSection,
    contribution: ContributionSection,
    activity: ActivitySection,
    notification: NotificationsSection,
    profile: ProfileSection,
    setting: SettingsSection,
  };

  const renderContent = () => {
    const Section = sectionComponents[page as keyof typeof sectionComponents] || HomeSection;
    return <Section>{renderSectionContent()}</Section>;
  };

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-white">
      <LoginNavbar />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <aside className="relative z-20 hidden h-full w-64 shrink-0 flex-col justify-between bg-white border-r border-black-400 p-2 lg:flex">
          <div className="flex flex-col gap-2">

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${page === item.id
                    ? "bg-[#000000] text-white shadow-md"
                    : "text-[#000000] hover:bg-black hover:text-white"
                    }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <Sidebarmsg />
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          {renderContent()}
        </main>

        <nav aria-label="Mobile dashboard navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-zinc-800 bg-black/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur lg:hidden">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition ${page === item.id ? "text-white" : "text-zinc-400"}`}
              >
                <span className={`rounded-lg p-1.5 ${page === item.id ? "bg-[#4F47EA] text-white" : ""}`}><Icon size={18} /></span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
