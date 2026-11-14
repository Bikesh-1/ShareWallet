"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoginNavbar from "../../components/loginNavbar";
import { toast } from "sonner";

type Friend = {
  receiver: { id: string; coustumerId: string; userdetails?: { name?: string | null; profilephoto?: string | null } | null };
};

export default function Creategroup() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/addfriends").then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to fetch friends.");
      if (active) setFriends(data.friendlist || []);
    }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to fetch friends."))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredFriends = useMemo(() => friends.filter(({ receiver }) =>
    (receiver.userdetails?.name || receiver.coustumerId).toLowerCase().includes(search.toLowerCase())
  ), [friends, search]);

  function toggleFriend(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function startDiscussion() {
    if (!selected.length) return toast.error("Select at least one friend to start a discussion.");
    try {
      setStarting(true);
      const res = await fetch("/api/group/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to start discussion.");
      router.push(`/group-draft/${data.draft.draftCode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start discussion.");
      setStarting(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative bg-white">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        maskImage: "radial-gradient(ellipse 80% 80% at 100% 0%, #000 35%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 100% 0%, #000 35%, transparent 90%)",
      }} />
      <LoginNavbar />
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center justify-center px-4 py-8">
        <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="bg-black p-6 text-white sm:p-9">
              <p className="text-sm font-semibold text-gray-300">CREATE A SAVINGS GROUP</p>
              <h1 className="mt-3 text-3xl font-bold">Start with your people.</h1>
              <p className="mt-4 text-sm leading-6 text-gray-300">Select friends from your ShareWallet friend list. A private discussion will open first, so everyone can talk through the plan before the group is created.</p>
              <div className="mt-8 space-y-4 text-sm">
                <div className="flex gap-3"><span className="font-bold text-[#6D5DFB]">01</span><span>Add friends to the discussion</span></div>
                <div className="flex gap-3"><span className="font-bold text-[#6D5DFB]">02</span><span>Discuss contributions and repayment terms</span></div>
                <div className="flex gap-3"><span className="font-bold text-[#6D5DFB]">03</span><span>You finalize the details and create the group</span></div>
              </div>
              <p className="mt-10 border-t border-white/20 pt-5 text-xs text-gray-400">No actual savings group or financial activity is created during this discussion.</p>
            </aside>
            <div className="p-5 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div><h2 className="text-2xl font-bold text-black">Choose friends</h2><p className="mt-1 text-sm text-gray-500">Select who should join the pre-group discussion.</p></div>
                <span className="rounded-full bg-[#F0EEFF] px-3 py-1 text-sm font-semibold text-[#4F47EA]">{selected.length} selected</span>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search friends..." className="mt-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#4F47EA]" />
              <div className="mt-4 max-h-[390px] min-h-[180px] space-y-2 overflow-y-auto">
                {loading ? <p className="py-12 text-center text-sm text-gray-500">Loading friends...</p> :
                  filteredFriends.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">{friends.length ? "No friends match your search." : "Your friend list is empty. Add friends first, then come back here."}</p> :
                  filteredFriends.map(({ receiver }) => {
                    const name = receiver.userdetails?.name || receiver.coustumerId;
                    const checked = selected.includes(receiver.id);
                    return <button type="button" key={receiver.id} onClick={() => toggleFriend(receiver.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${checked ? "border-[#4F47EA] bg-[#F5F3FF]" : "border-gray-200 hover:border-gray-400"}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-bold text-gray-700">{receiver.userdetails?.profilephoto ? <img src={receiver.userdetails.profilephoto} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-gray-900">{name}</span><span className="block text-xs text-gray-500">{receiver.coustumerId}</span></span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${checked ? "border-[#4F47EA] bg-[#4F47EA] text-white" : "border-gray-300"}`}>{checked ? "✓" : ""}</span>
                    </button>;
                  })}
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">Back</button>
                <button type="button" onClick={startDiscussion} disabled={starting || loading || !selected.length} className="rounded-lg bg-[#4F47EA] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{starting ? "Opening discussion..." : "Start discussion"}</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
