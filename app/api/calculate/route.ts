import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { deviceId, selections } = body;

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device) {
    return NextResponse.json(
      { error: "Device not found" },
      { status: 404 }
    );
  }

  const optionIds = Object.values(selections)
    .map((v) => Number(v))
    .filter(Boolean);

  const options = await prisma.componentOption.findMany({
    where: {
      id: { in: optionIds },
    },
  });

  const totalPrice =
    device.basePrice +
    options.reduce((sum, o) => sum + o.priceDelta, 0);

  const totalPerf =
    options.reduce((sum, o) => sum + o.perfScore, 0);

  return NextResponse.json({
    totalPrice,
    totalPerf,
  });
}