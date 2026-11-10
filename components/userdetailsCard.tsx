"use client"

import { useUserDetails } from "@/hooks/useUserDetails";

export default function Userdetails() {

  const {
    data: userdetails,
    isPending,
    isError,
    error
  } = useUserDetails();

  if (isPending) {
    return <p>Loading...</p>
  }

  if (isError) {
    return <p>{error.message}</p>
  }

  return (
    <div >
      <div className="w-80 rounded-2xl border border-[#202020] bg-[#0a0a0a] p-6 shadow-[0_0_40px_rgba(79,71,234,0.12)] transition-all duration-300 hover:border-[#4F47EA]/50">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Profile
            </p>
          </div>
        </div>

        {userdetails ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[#4F47EA]/30 bg-[#4F47EA]/10 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400">ShareWallet Balance</p>
              <p className="mt-2 text-2xl font-bold text-white">
                ₹{Number(userdetails.user.walletBalance || 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-gray-500">Money received from approved group requests</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#1d1d1d] pb-2">
                <span className="text-gray-400">Name</span>
                <span className="font-bold text-white">
                  {userdetails.name}
                </span>
              </div>

              <div className="flex justify-between border-b border-[#1d1d1d] pb-2">
                <span className="text-gray-400">Mobile</span>
                <span className="font-bold text-white">
                  {userdetails.mobileNumber}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">DOB</span>
                <span className="font-bold text-white">
                  {userdetails.dateOfbirth}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
      </div>
    </div>
  )
}