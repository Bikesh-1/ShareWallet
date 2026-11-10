import prisma from "@/lib/prisma";
import { verifyCashfreeWebhook } from "@/lib/cashfree/webhook";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-webhook-signature");

        const timestamp = req.headers.get("x-webhook-timestamp");

        if (!signature || !timestamp) {
            return NextResponse.json({ error: "Missing webhook headers", }, { status: 400 });
        }

        const isValid = verifyCashfreeWebhook(rawBody, timestamp, signature);

        if (!isValid) {
            return NextResponse.json({ error: "Invalid webhook signature", }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const orderId = payload?.data?.order?.order_id;
        const paymentStatus = payload?.data?.payment?.payment_status;

        if (!orderId) {
            return NextResponse.json({ received: true, }, { status: 200 });
        }

        if (!orderId.startsWith("SW_CONTRIBUTION_")) {
            return NextResponse.json({ received: true, }, { status: 200 });
        }

        const contributionId = orderId
            .slice("SW_CONTRIBUTION_".length)
            .replace(/_\\d+$/, "");

        const contribution = await prisma.contribution.findUnique({ where: { id: contributionId } });

        if (!contribution) {
            return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
        }

        if(paymentStatus === "SUCCESS"){
            await prisma.$transaction(async (tx) =>{
                const transactionResult = await tx.transaction.updateMany({
                    where:{
                        providerReference: orderId,
                        type:"CONTRIBUTION",
                        status:"PENDING",
                    },
                    data:{status:"SUCCESS"}
                });
                if(transactionResult.count === 0){
                    return;
                }

                const contributionResult = await tx.contribution.updateMany({
                    where:{
                        id:contribution.id,
                        status:{not: "PAID"},
                    },
                    data:{
                        status:"PAID",
                        paidAt: new Date(),
                    },
                });
                if(contributionResult.count !== 1){
                    throw new Error("Contribution already processed or invalid");
                }

                await tx.group.update({
                    where: {id: contribution.groupId},
                    data:{
                        totalAmount:{
                            increment: contribution.amount,
                        }
                    }
                })
            })
        }

        if (paymentStatus === "FAILED" || paymentStatus === "USER_DROPPED") {
            await prisma.transaction.updateMany(
                {
                    where: {
                        providerReference: orderId,
                        type: "CONTRIBUTION",
                        status: "PENDING",
                    },

                    data: {
                        status: "FAILED",
                    },
                }
            );
        }

        return NextResponse.json(
            { received: true, },
            { status: 200 }
        );
    } catch (error) {
        console.error("CASHFREE WEBHOOK ERROR:", error);
        return NextResponse.json(
            { error: "Webhook processing failed", },
            { status: 500 }
        );
    }
}