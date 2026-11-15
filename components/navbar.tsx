"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar() {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMenu = () => setMobileOpen(false);

    return (
        <header className="absolute left-1/2 top-4 z-50 w-[92%] max-w-[1500px] -translate-x-1/2 sm:top-5 sm:w-[90%]">
            <div className="relative flex h-[58px] items-center justify-between rounded-2xl border border-black/[0.07] bg-white/85 px-3 shadow-[0_8px_30px_rgba(15,15,25,0.07)] backdrop-blur-xl sm:h-[64px] sm:px-5">
                <Link href="/" aria-label="ShareWallet home" onClick={closeMenu} className="shrink-0">
                    <Image
                        src="/logo.png"
                        alt="ShareWallet"
                        width={150}
                        height={150}
                        priority
                        className="h-auto w-28 sm:w-32 md:w-[145px]"
                    />
                </Link>

                <nav aria-label="Main navigation" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-black/[0.06] bg-[#F7F7F9] p-1 md:flex">
                    {links.map((link, index) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="group relative rounded-full px-4 py-2 text-[13px] font-medium text-[#55545D] transition-all duration-300 hover:bg-white hover:text-[#4F47EA] hover:shadow-sm lg:px-5 lg:text-sm"
                        >
                            {link.label}
                            <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-[#4F47EA] transition-transform duration-300 group-hover:scale-x-100" />
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 sm:gap-3 md:flex">
                    <button
                        onClick={() => router.push("/signin")}
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#17171C] transition-colors duration-200 hover:bg-black/[0.045] hover:text-[#4F47EA]"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => router.push("/signup")}
                        className="group inline-flex items-center gap-2 rounded-xl bg-[#111116] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(17,17,22,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4F47EA] hover:shadow-[0_8px_20px_rgba(79,71,234,0.22)]"
                    >
                        Create account
                        <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    <button
                        onClick={() => router.push("/signup")}
                        className="rounded-xl bg-[#111116] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4F47EA] sm:text-sm"
                    >
                        Join now
                    </button>
                    <button
                        type="button"
                        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((open) => !open)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-[#17171C] transition-colors hover:border-[#4F47EA]/40 hover:text-[#4F47EA]"
                    >
                        {mobileOpen ? <X size={19} /> : <Menu size={19} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <nav
                    aria-label="Mobile navigation"
                    className="mt-2 rounded-2xl border border-black/[0.07] bg-white/95 p-2 shadow-[0_16px_45px_rgba(15,15,25,0.12)] backdrop-blur-xl md:hidden"
                >
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            className="block rounded-xl px-4 py-3 text-sm font-medium text-[#34333B] transition-colors hover:bg-[#F2F0FF] hover:text-[#4F47EA]"
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="mt-1 grid grid-cols-2 gap-2 border-t border-black/[0.06] p-2">
                        <button
                            onClick={() => { closeMenu(); router.push("/signin"); }}
                            className="rounded-xl border border-black/10 px-3 py-2.5 text-sm font-semibold text-[#17171C] transition-colors hover:border-[#4F47EA]/40 hover:text-[#4F47EA]"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { closeMenu(); router.push("/signup"); }}
                            className="rounded-xl bg-[#4F47EA] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3E36D8]"
                        >
                            Create account
                        </button>
                    </div>
                </nav>
            )}
        </header>
    );
}
