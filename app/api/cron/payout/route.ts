import { NextResponse } from "next/server";
import { runAutoPayout } from "@/lib/payout/autoPayout";

export async function GET(req: Request) {
    try {
        const authHeader =
            req.headers.get("authorization");

        const expected =
            `Bearer ${process.env.CRON_SECRET}`;

        if (
            !process.env.CRON_SECRET ||
            authHeader !== expected
        ) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const results =
            await runAutoPayout();

        return NextResponse.json({
            success: true,
            processed: results.length,
            results,
        });
    } catch (error) {
        console.error(
            "Cron payout error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Cron payout failed",
            },
            {
                status: 500,
            }
        );
    }
}