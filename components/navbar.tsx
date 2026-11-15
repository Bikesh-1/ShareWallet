"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const links = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "How it works?", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar() {
    const router = useRouter();

    return (
        <header className="absolute left-1/2 top-4 z-50 flex h-12 w-[92%] max-w-[1500px] -translate-x-1/2 items-center justify-between sm:top-5 sm:w-[90%]">
            <Link href="/" aria-label="ShareWallet home" className="shrink-0">
                <Image
                    src="/logo.png"
                    alt="ShareWallet"
                    width={150}
                    height={150}
                    priority
                    className="h-auto w-28 sm:w-32 md:w-[150px]"
                />
            </Link>

            <nav aria-label="Main navigation" className="hidden items-center justify-center gap-1 rounded-full bg-black/95 px-2 py-1 text-[14px] font-medium text-white shadow-lg shadow-black/10 backdrop-blur-sm md:flex">
                {links.map((link) => (
                    <a key={link.href} href={link.href} className="group relative rounded-full px-4 py-2 transition-colors hover:text-[#C8C3FF]">
                        {link.label}
                        <span className="absolute bottom-1 left-4 right-4 h-px origin-center scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                    </a>
                ))}
            </nav>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button
                    onClick={() => router.push("/signin")}
                    className="flex items-center justify-center rounded-lg bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 sm:px-4 sm:text-[15px]"
                >
                    Login
                </button>
                <button
                    onClick={() => router.push("/signup")}
                    className="whitespace-nowrap rounded-lg border border-[#dadada] bg-white px-2.5 py-2 text-xs font-medium text-black transition hover:border-black sm:px-3 sm:text-[15px]"
                >
                    Create account
                </button>
            </div>
        </header>
    );
}
