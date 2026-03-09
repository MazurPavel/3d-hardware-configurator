import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const device = await prisma.device.findFirst({
    include: {
      components: {
        include: {
          options: true,
        },
      },
    },
  });

  return NextResponse.json(device);
}