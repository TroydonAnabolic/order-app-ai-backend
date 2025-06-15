import { NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client"; // Adjust path if needed

const prisma = new PrismaClient();

export async function GET() {
  try {
    const codes = await prisma.inviteCode.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, code: true, isUsed: true },
    });

    return NextResponse.json(codes, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch invite codes:", error);
    return NextResponse.json([], { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
