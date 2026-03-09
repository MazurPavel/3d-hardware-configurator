import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, deviceId, selections, totalPrice, totalPerf } = body;

  const saved = await prisma.userConfiguration.create({
    data: {
      sessionId,
      deviceId,
      selections,
      totalPrice,
      totalPerf,
    },
  });

  return NextResponse.json(saved);
}