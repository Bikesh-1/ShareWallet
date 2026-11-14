"use client";

import { FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import LoginNavbar from "@/components/loginNavbar";
import { toast } from "sonner";

type DraftMessage = {
  id: string;
  message: string;
  createdAt: string;
  userId: string;
  user?: { id: string; userdetails?: { name?: string | null } | null };
};

export default function GroupDraftDiscussionPage() {
  const { draftCode } = useParams<{ draftCode: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<DraftMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [repaymentDueDate, setRepaymentDueDate] = useState("");
  const [repaymentTerms, setRepaymentTerms] = useState("");
  const [interestFree, setInterestFree] = useState(true);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: discussion, isPending: loading, error: discussionError } = useQuery({
    queryKey: ["group-draft-messages", draftCode],
    queryFn: async () => {
      const res = await fetch(`/api/group/drafts/${draftCode}/messages`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load discussion.");
      return data as { messages: DraftMessage[]; currentUserId: string; creatorId: string; isFinalized: boolean };
    },
    enabled: !!draftCode,
    staleTime: 1_000,
    refetchInterval: 4_000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!discussion) return;
    setMessages(discussion.messages || []);
    setCurrentUserId(discussion.currentUserId || "");
    setCreatorId(discussion.creatorId || "");
    setIsFinalized(Boolean(discussion.isFinalized));
  }, [discussion]);

  useEffect(() => {
    if (discussionError) toast.error(discussionError instanceof Error ? discussionError.message : "Unable to load discussion.");
  }, [discussionError]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim() || sending) return;
    try {
      setSending(true);
      const res = await fetch(`/api/group/drafts/${draftCode}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send message.");
      queryClient.setQueryData(["group-draft-messages", draftCode], (current: { messages: DraftMessage[]; currentUserId: string; creatorId: string; isFinalized: boolean } | undefined) => current ? { ...current, messages: [...current.messages, data.message] } : current);
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  }

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    try {
      setFinalizing(true);
      const res = await fetch(`/api/group/drafts/${draftCode}/finalize`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, description, monthlyContribution: Number(monthlyContribution), dueDate, repaymentDueDate: repaymentDueDate || null, repaymentTerms, interestFree }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create group.");
      toast.success(data.message || "Group created successfully.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create group.");
    } finally {
      setFinalizing(false);
    }
  }

  const isCreator = currentUserId && currentUserId === creatorId;

  return (
    <div className="min-h-screen bg-white">
      <LoginNavbar />
      <main className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-black px-5 py-4 text-white">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pre-group discussion</p><h1 className="mt-1 text-xl font-bold">Discuss your savings plan</h1><p className="mt-1 text-xs text-gray-400">Discussion ID: {draftCode}</p></div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs">{isFinalized ? "Closed" : "Discussion open"}</span>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 sm:p-6">
            {loading ? <p className="py-12 text-center text-sm text-gray-500">Loading discussion...</p> :
              messages.length === 0 ? <div className="mx-auto max-w-md py-16 text-center"><h2 className="font-semibold text-gray-900">Start the conversation</h2><p className="mt-2 text-sm text-gray-500">Discuss the savings goal, monthly contribution, due dates and emergency repayment terms here.</p></div> :
              messages.map((item) => {
                const mine = item.userId === currentUserId;
                return <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${mine ? "rounded-br-sm bg-[#4F47EA] text-white" : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"}`}>
                    <p className={`mb-1 text-[11px] font-semibold ${mine ? "text-white/75" : "text-[#4F47EA]"}`}>{mine ? "You" : item.user?.userdetails?.name || "Group member"}</p>
                    <p className="whitespace-pre-wrap break-words text-sm">{item.message}</p>
                    <p className={`mt-2 text-right text-[10px] ${mine ? "text-white/60" : "text-gray-400"}`}>{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>;
              })}
          </div>
          {!isFinalized && <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 bg-white p-3 sm:p-4">
            <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} placeholder="Write a message..." className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none focus:border-[#4F47EA]" />
            <button disabled={sending || !message.trim()} className="rounded-lg bg-[#4F47EA] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{sending ? "Sending..." : "Send"}</button>
          </form>}
        </section>

        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-black">Before the group is created</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Use this chat to agree on the savings goal and emergency-fund rules. Only the creator can submit the final group details. Friends do not need to approve the form.</p>
          <div className="my-5 space-y-3 border-y border-gray-200 py-5 text-sm text-gray-700">
            <p>• Agree on monthly contribution</p><p>• Decide the monthly due date</p><p>• Discuss repayment timeline and terms</p><p>• Confirm whether emergency loans are interest-free</p>
          </div>
          {isFinalized ? <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-600">This discussion has been finalized and is now closed.</p> :
            isCreator ? <button onClick={() => setShowDetails((value) => !value)} className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90">{showDetails ? "Hide group details" : "Finalize terms & create group"}</button> :
            <p className="rounded-lg bg-[#F4F2FF] p-3 text-sm text-[#4F47EA]">Waiting for the discussion creator to finalize the group details.</p>}
          {showDetails && isCreator && <form onSubmit={createGroup} className="mt-5 space-y-3 border-t border-gray-200 pt-5">
            <h3 className="font-semibold text-black">Final group details</h3>
            <label className="block text-xs font-semibold text-gray-700">Group name<input required minLength={2} maxLength={60} value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Goa Trip Fund" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#4F47EA]" /></label>
            <label className="block text-xs font-semibold text-gray-700">Description<textarea required maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this group saving for?" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#4F47EA]" /></label>
            <label className="block text-xs font-semibold text-gray-700">Monthly contribution (₹)<input type="number" min="0" step="1" required value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#4F47EA]" /></label>
            <label className="block text-xs font-semibold text-gray-700">Monthly due date<input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#4F47EA]" /></label>
            <label className="block text-xs font-semibold text-gray-700">Repayment due date (optional)<input type="date" value={repaymentDueDate} onChange={(e) => setRepaymentDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#4F47EA]" /></label>
            <label className="block text-xs font-semibold text-gray-700">Repayment terms<textarea value={repaymentTerms} onChange={(e) => setRepaymentTerms(e.target.value)} maxLength={1000} rows={3} placeholder="Explain how and when emergency funds should be repaid." className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal text-black outline-none focus:border-[#4F47EA]" /></label>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={interestFree} onChange={(e) => setInterestFree(e.target.checked)} className="h-4 w-4 accent-[#4F47EA]" /> Interest-free emergency loans</label>
            <p className="text-xs leading-5 text-gray-500">You are the final decision-maker for these settings. The group will be created only after you submit this form.</p>
            <button disabled={finalizing} className="w-full rounded-lg bg-[#4F47EA] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{finalizing ? "Creating group..." : "Create actual group"}</button>
          </form>}
        </aside>
      </main>
    </div>
  );
}
