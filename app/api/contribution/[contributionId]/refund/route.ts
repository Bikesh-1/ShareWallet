import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { refundContribution } from "@/lib/payment/refundContribution";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      contributionId: string;
    }>;
  }
) {
  try {
    const { contributionId } = await params;

    const session =
      await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const contribution =
      await prisma.contribution.findUnique({
        where: {
          id: contributionId,
        },
      });

    if (!contribution) {
      return NextResponse.json(
        {
          error: "Contribution not found.",
        },
        { status: 404 }
      );
    }

    if (contribution.userId !== user.id) {
      return NextResponse.json(
        {
          error:
            "You cannot refund another user's contribution.",
        },
        { status: 403 }
      );
    }

    const result =
      await refundContribution(contributionId);

    return NextResponse.json(result, {
      status: 200,
    });
  } catch (error) {
    console.error("REFUND ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Refund failed",
      },
      { status: 500 }
    );
  }
}