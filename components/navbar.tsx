"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] h-10 flex items-center justify-between">

            <div className="shrink-0">
                <Image src="/logo.png" alt="logo" width={150} height={150}
                    className="w-27.5 sm:w-32.5 md:w-37.5 h-auto" />
            </div>

            <div className="hidden md:flex items-center justify-center text-white bg-black/95 backdrop-blur-sm px-2 py-1 gap-1 rounded-full h-11 text-[14px] font-medium shadow-lg shadow-black/10">
                <p className="relative cursor-pointer group px-4 py-2 rounded-full">
                    Home
                    <span className="absolute left-4 right-4 bottom-1 h-px bg-white scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
                </p>

                <p className="relative cursor-pointer group px-4 py-2 rounded-full">
                    About
                    <span className="absolute left-4 right-4 bottom-1 h-px bg-white scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
                </p>

                <p className="relative cursor-pointer group px-4 py-2 rounded-full">
                    How it works?
                    <span className="absolute left-4 right-4 bottom-1 h-px bg-white scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
                </p>

                <p className="relative cursor-pointer group px-4 py-2 rounded-full">
                    Contact
                    <span className="absolute left-4 right-4 bottom-1 h-px bg-white scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
                </p>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button onClick={() => router.push("/signin")}
                    className="text-white bg-[#000000] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-[15px] font-medium cursor-pointer flex items-center justify-center">
                    Login
                </button>
                <button onClick={() => router.push("/signup")}
                    className="text-black border border-[#dadada] bg-white px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-[15px] font-medium cursor-pointer whitespace-nowrap">
                    Create account
                </button>
            </div>
        </div>
    );
}