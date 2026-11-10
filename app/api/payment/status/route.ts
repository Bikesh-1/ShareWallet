import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orderId = new URL(req.url).searchParams.get("order_id");
    if (!orderId || !orderId.startsWith("SW_CONTRIBUTION_")) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        providerReference: orderId,
        type: "CONTRIBUTION",
        senderId: user.id,
      },
      select: { status: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ status: transaction.status }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("PAYMENT STATUS ERROR:", error);
    return NextResponse.json({ error: "Unable to check payment status" }, { status: 500 });
  }
}
