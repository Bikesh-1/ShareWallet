import { runAutomaticPayouts } from "@/lib/payout/autoPayout";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader =
    req.headers.get("authorization");

  const cronSecret =
    process.env.CRON_SECRET;

  if (
    !cronSecret ||
    authHeader !==
      `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const results =
      await runAutomaticPayouts();

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error(
      "CRON PAYOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Automatic payout failed.",
      },
      { status: 500 }
    );
  }
}