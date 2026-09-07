import prisma from "@/lib/prisma";
import { verifyCashfreePayoutWebhook } from "@/lib/cashfree/payoutWebhook";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    const signature = req.headers.get(
      "x-webhook-signature"
    );

    const timestamp = req.headers.get(
      "x-webhook-timestamp"
    );

    if (!signature || !timestamp) {
      return NextResponse.json(
        {
          error: "Missing webhook headers",
        },
        { status: 400 }
      );
    }

    const isValid = verifyCashfreePayoutWebhook(
      rawBody,
      timestamp,
      signature
    );

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Invalid webhook signature",
        },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    const transferId =
      payload?.data?.transfer?.transfer_id ||
      payload?.data?.transfer_id;

    const transferStatus =
      payload?.data?.transfer?.status ||
      payload?.data?.status;

    if (!transferId) {
      return NextResponse.json(
        {
          error: "Transfer ID missing",
        },
        { status: 400 }
      );
    }

    if (!transferId.startsWith("SW_PAYOUT_")) {
      return NextResponse.json(
        {
          message: "Ignored payout",
        },
        { status: 200 }
      );
    }

    const transactionId = transferId.replace(
      "SW_PAYOUT_",
      ""
    );

    const transaction =
      await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
      });

    if (!transaction) {
      return NextResponse.json(
        {
          error: "Transaction not found",
        },
        { status: 404 }
      );
    }

    if (transaction.type !== "PAYOUT") {
      return NextResponse.json(
        {
          error: "Invalid transaction type",
        },
        { status: 400 }
      );
    }

    // SUCCESS
    if (
      transferStatus === "SUCCESS" ||
      transferStatus === "COMPLETED"
    ) {
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: "SUCCESS",
          provider: "CASHFREE",
          providerReference: transferId,
        },
      });

      return NextResponse.json(
        {
          message: "Payout marked successful",
        },
        { status: 200 }
      );
    }

    // FAILED
    if (
      transferStatus === "FAILED" ||
      transferStatus === "REJECTED"
    ) {
      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          status: "FAILED",
          provider: "CASHFREE",
          providerReference: transferId,
        },
      });

      return NextResponse.json(
        {
          message: "Payout marked failed",
        },
        { status: 200 }
      );
    }

    // PROCESSING / RECEIVED / PENDING
    return NextResponse.json(
      {
        message: "Payout status received",
        status: transferStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "CASHFREE PAYOUT WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Payout webhook processing failed",
      },
      { status: 500 }
    );
  }
}