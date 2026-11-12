import { encode } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const secret = process.env.NEXTAUTH_SECRET;

    if (!userId || !secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await encode({
      token: { sub: userId, id: userId },
      secret,
      maxAge: 60 * 60,
    });

    return NextResponse.json(
      { token },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("SOCKET TOKEN ERROR:", error);
    return NextResponse.json({ error: "Unable to authorize socket connection" }, { status: 500 });
  }
}
