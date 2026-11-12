"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { useMessage } from "@/hooks/useMessage";
import { useSocket } from "@/hooks/useSocket";
import { useGroupDetails } from "@/hooks/useGroupDetails";
import { useUserDetails } from "@/hooks/useUserDetails";
import { useGroupContribution } from "@/hooks/useGroupContribution";
import LoginNavbar from "@/components/loginNavbar";

export default function MessagePage() {
    const { groupCode } = useParams<{ groupCode: string }>();
    const { data: session } = useSession();
    const { data: groups = [] } = useGroupDetails();
    const group = groups.find((g: any) => g.groupCode === groupCode);
    const { data: profile } = useUserDetails();
    const { data: messages = [] } = useMessage(groupCode);
    const { data: groupDetails } = useGroupContribution(groupCode);

    const {
        sendMessage,
        typing,
        onlineUsers,
        typingUser,
    } = useSocket({
        groupCode,
        groupId: group?.id ?? "",
        userId: (session?.user as any)?.id ?? "",
        userName: profile?.name ?? "",
    });

    const [text, setText] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!text.trim()) return;
        sendMessage(text);
        setText("");
    };

    const groupInfo = (
        <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3">
                <div className="rounded border border-zinc-800 min-w-0 p-2">
                    <p className="text-xs text-gray-400 uppercase">Group Name</p>
                    <h2 className="mt-1 text-sm font-semibold break-words">{groupDetails?.groupName}</h2>
                </div>
                <div className="rounded border border-zinc-800 min-w-0 p-2">
                    <p className="text-xs text-gray-400 uppercase">Group Code</p>
                    <h2 className="mt-1 text-sm font-semibold break-all">{groupDetails?.groupCode}</h2>
                </div>
                <div className="rounded border border-zinc-800 p-2 col-span-2">
                    <p className="text-xs text-gray-400 uppercase">Description</p>
                    <p className="mt-1 text-sm text-gray-300 break-words">{groupDetails?.description}</p>
                </div>
                <div className="rounded border border-zinc-800 p-2 min-w-0">
                    <p className="text-xs text-gray-400 uppercase">Total Amount</p>
                    <h2 className="mt-1 text-sm font-bold">₹ {groupDetails?.totalAmount}</h2>
                </div>
                <div className="rounded border border-zinc-800 p-2 min-w-0">
                    <p className="text-xs text-gray-400 uppercase">Monthly Amount</p>
                    <h2 className="mt-1 text-sm font-bold">₹ {groupDetails?.monthlyContribution}</h2>
                </div>
                <div className="rounded-xl border border-zinc-800 p-3 sm:p-4 col-span-2">
                    <p className="text-xs text-gray-400 uppercase">Due Date</p>
                    <p className="mt-1 text-sm">{groupDetails?.dueDate}</p>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-white">
            <LoginNavbar />

            <main className="w-full min-h-[calc(100dvh-64px)] bg-white flex flex-col lg:flex-row justify-center items-stretch lg:items-center gap-4 lg:gap-8 px-3 sm:px-5 lg:px-8 py-4">
                {/* Compact, expandable group details on mobile */}
                <details className="lg:hidden w-full bg-black text-white border border-zinc-800 p-4">
                    <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                        <span className="font-semibold">Group Information · {groupDetails?.groupName ?? "Loading..."}</span>
                        <span className="text-xs text-gray-400 shrink-0">View details</span>
                    </summary>
                    {groupInfo}
                </details>

                {/* Full group information panel on desktop */}
                <aside className="hidden lg:flex w-full max-w-[380px] h-[80vh] bg-black text-white border border-zinc-800 p-6 xl:p-8 flex-col">
                    <div className="border-b border-zinc-800 pb-3">
                        <h1 className="text-xl font-bold">Group Information</h1>
                        <p className="text-xs text-gray-400 mt-1">View group details and members.</p>
                    </div>
                    {groupInfo}
                </aside>

                {/* Chat panel */}
                <section className="w-full lg:flex-1 max-w-5xl lg:max-w-[900px] h-[calc(100dvh-170px)] min-h-[420px] lg:h-[80vh] bg-white overflow-hidden flex flex-col border border-gray-200">
                    <header className="border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3 bg-white">
                        <div className="min-w-0">
                            <h1 className="font-bold text-lg sm:text-xl truncate">{groupDetails?.groupName}</h1>
                            <p className="text-xs sm:text-sm text-gray-500 break-all">{groupCode}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{onlineUsers} Online</span>
                        </div>
                    </header>

                    <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 sm:py-5 space-y-4 bg-gray-100">
                        {messages.map((msg) => {
                            const isMe = msg.user.id === (session?.user as { id?: string })?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className="max-w-[88%] sm:max-w-[70%] min-w-0">
                                        {!isMe && (
                                            <p className="text-xs text-black font-semibold mb-1 break-words">
                                                {msg.user.userdetails?.name}
                                            </p>
                                        )}
                                        <p className={`rounded px-3 py-2 shadow break-words [overflow-wrap:anywhere] ${isMe ? "bg-white text-black border rounded-br-md" : "bg-black text-white rounded-bl-md"}`}>
                                            {msg.message}
                                        </p>
                                        <p className="text-[10px] mt-2 text-black">
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {typingUser && (
                            <p className="text-gray-500 italic text-sm">{typingUser} is typing...</p>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <footer className="border-t bg-white p-3 sm:p-5">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <input
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                    typing();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Type your message..."
                                aria-label="Type your message"
                                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#000000]"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!text.trim()}
                                className="shrink-0 text-white bg-black disabled:opacity-50 px-4 sm:px-5 py-2.5 rounded-lg text-sm sm:text-[15px] font-medium cursor-pointer"
                            >
                                Send
                            </button>
                        </div>
                    </footer>
                </section>
            </main>
        </div>
    );
}
