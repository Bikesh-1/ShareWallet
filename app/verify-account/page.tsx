"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Navbar from "@/components/navbar";

function VerifyAccountContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const [status, setStatus] = useState<
        "loading" | "success" | "error"
    >("loading");

    const [message, setMessage] = useState(
        "Verifying your email..."
    );

    useEffect(() => {
        async function verifyEmail() {
            if (!token) {
                setStatus("error");
                setMessage("Invalid verification link.");
                return;
            }

            try {
                const res = await fetch("/api/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage(data.message);

                    setTimeout(() => {
                        router.push("/signin");
                    }, 2500);
                } else {
                    setStatus("error");
                    setMessage(
                        data.message ||
                        "Verification failed."
                    );
                }
            } catch {
                setStatus("error");
                setMessage("Something went wrong.");
            }
        }

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen w-full relative bg-white text-black flex items-center justify-center">
            
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage:
                        `linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 0",
                    maskImage:
                        `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),
                         repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),
                         radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)`,
                    WebkitMaskImage:
                        `repeating-linear-gradient(to right,black 0px,black 3px,transparent 3px,transparent 8px),
                         repeating-linear-gradient(to bottom,black 0px,black 3px,transparent 3px,transparent 8px),
                         radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)`,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                }}
            />

            <div>
                <Navbar />

                <div className="w-105 rounded-lg border text-white bg-black p-8 relative z-20">

                    <div className="flex justify-center">
                        {status === "loading" && (
                            <Loader2
                                className="animate-spin text-white"
                                size={55}
                            />
                        )}

                        {status === "success" && (
                            <CheckCircle2
                                className="text-green-500"
                                size={55}
                            />
                        )}

                        {status === "error" && (
                            <XCircle
                                className="text-red-500"
                                size={55}
                            />
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-center mt-6">
                        {status === "loading"
                            ? "Verifying..."
                            : status === "success"
                                ? "Email Verified"
                                : "Verification Failed"}
                    </h1>

                    <p className="text-center text-stone-400 mt-4">
                        {message}
                    </p>

                    {status === "success" && (
                        <button
                            onClick={() =>
                                router.push("/signin")
                            }
                            className="mt-8 w-full text-black border border-[#dadada] bg-white px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                        >
                            Continue to Login
                        </button>
                    )}

                    {status === "error" && (
                        <>
                            <button
                                onClick={() =>
                                    router.push(
                                        "/verify-email"
                                    )
                                }
                                className="mt-8 w-full text-black border border-[#dadada] bg-white px-2 py-2 rounded-lg text-[15px] font-medium cursor-pointer"
                            >
                                Resend Verification Email
                            </button>

                            <button
                                onClick={() =>
                                    router.push("/signup")
                                }
                                className="mt-3 w-full rounded-lg border border-white px-3 py-2 text-[15px] font-medium cursor-pointer"
                            >
                                Back to Signup
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyAccountPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <Loader2
                        className="animate-spin text-black"
                        size={45}
                    />
                </div>
            }
        >
            <VerifyAccountContent />
        </Suspense>
    );
}