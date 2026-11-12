"use client"
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import LoginNavbar from "../../components/loginNavbar";
import { toast } from "sonner";
import { useGroupDetails } from "@/hooks/useGroupDetails";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "@/services/group.service";

export default function Creategroup() {
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
    const [dueDate, setDuedate] = useState("");
    const totalAmount = 0;
    const router = useRouter();

    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        .toISOString().split("T")[0];
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        .toISOString().split("T")[0];

    const{data: Group} = useGroupDetails();

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createGroup,

        onSuccess: (data) =>{
            toast.success(data.message);
            queryClient.invalidateQueries({
                queryKey:["group"],
            })
            queryClient.invalidateQueries({
                queryKey: ["friend"],
            })
            router.push("/dashboard")
        },

        onError:(error:Error) =>{
            toast.error(error.message)
        }
    })

    const handlegroupCreation = (e: React.FormEvent) =>{
        e.preventDefault();

        mutation.mutate({
            groupName,
            description,
            monthlyContribution,
            dueDate,
            totalAmount,
        })
    }

    return (
        <div className="min-h-screen w-full relative bg-white ">
            <div className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 0",
                    maskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)`,
                    WebkitMaskImage: `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)`,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                }}
            />
            <LoginNavbar />
            <div className="w-full min-h-screen flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4 sm:gap-6 lg:gap-8 px-3 sm:px-5 lg:px-8 py-5 sm:py-8 relative z-10">
                <div className="w-full lg:w-1/3 flex items-center justify-center">
                    <div className="bg-white border rounded p-5 sm:p-7 lg:p-8 w-full max-w-2xl lg:max-w-md">
                        <div className="mb-5 sm:mb-6">
                            <h2 className="text-2xl font-bold text-[#0a0a0a]">Before You Create</h2>
                            <p className="text-red-700 text-sm mt-1 font-black">
                                Please review these important guidelines before creating your savings group.
                            </p>
                        </div>
                        <div className="space-y-4 sm:space-y-5 text-sm">
                            <div className="flex gap-3">
                                <span className="text-[#4F47EA] font-bold">-</span>
                                <div>
                                    <p className="font-semibold text-black">Group Deletion</p>
                                    <p className="text-gray-700">Groups cannot be deleted directly after creation. If required, contact our support team.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#4F47EA] font-bold">-</span>
                                <div>
                                    <p className="font-semibold text-black">Invite Members</p>
                                    <p className="text-gray-700">After creating the group, you can invite your friends to join.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#4F47EA] font-bold">-</span>
                                <div>
                                    <p className="font-semibold text-black">Member Management</p>
                                    <p className="text-gray-700">Once a member joins the group, they cannot be removed.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="text-[#4F47EA] font-bold">-</span>
                                <div>
                                    <p className="font-semibold text-black">Contributions</p>
                                    <p className="text-gray-700">Ensure every member understands the monthly contribution amount before joining.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 sm:mt-8 border-t border-gray-300 pt-5">
                            <p className="text-xs text-gray-600">
                                <span className="font-semibold">Tip:</span> Choose a meaningful group name and set a realistic savings goal for better tracking.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-2/3 flex items-center justify-center">
                    <div className="bg-black w-full max-w-5xl min-h-[auto] lg:min-h-[80vh] rounded px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-8 flex flex-col justify-center text-white">
                        <div className="mb-4 sm:mb-3">
                            <h1 className="text-3xl font-bold">Create Group</h1>
                            <p className="text-sm mt-1">Build your savings group and invite friends to start contributing together.</p>
                        </div>
                        <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handlegroupCreation}>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Group Name</label>
                                <input type="text" placeholder="e.g. Goa Trip Fund" value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full min-w-0 border border-[#dadada] rounded-xl px-4 py-2.5 outline-none focus:border-[#4F47EA] transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Description</label>
                                <input type="text" placeholder="Describe the purpose of your group" value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-[#dadada] rounded-xl px-4 py-2 outline-none focus:border-[#4F47EA] transition" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Monthly Contribution</label>
                                    <input type="number" placeholder="₹500" value={monthlyContribution}
                                        onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                                        className="w-full border border-[#dadada] rounded-xl px-4 py-2 outline-none focus:border-[#4F47EA] transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Group Total Contribution</label>
                                    <input type="text" value="₹ 0" readOnly
                                        className="w-full min-w-0 border border-[#dadada] rounded-xl px-4 py-2.5 outline-none bg-gray-100 text-gray-600 cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2">
                                <label className="block text-sm font-semibold mb-2">Monthly Due Date</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    min={currentMonthStart}
                                    max={currentMonthEnd}
                                    onChange={(e) => setDuedate(e.target.value)}
                                    className="w-full border border-[#dadada] rounded-xl px-4 py-2 outline-none focus:border-[#4F47EA] transition"
                                />
                                <p className="text-xs text-gray-400 mt-1">Choose a date from the current month only.</p>
                            </div>
                            <button disabled={mutation.isPending} type="submit"
                                className="mt-3 text-black border bg-white px-3 py-2 rounded-lg text-[15px] font-medium cursor-pointer">
                                {mutation.isPending ? "creating..." : "Create Group"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}