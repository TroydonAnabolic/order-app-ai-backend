import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client"; // Adjust path if needed

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log("➡️ Received POST request to create invite code.");

  try {
    const body = await request.json();
    console.log("📦 Request body:", body);

    const { code } = body;

    if (!code || typeof code !== "string") {
      console.warn("⚠️ Invalid or missing 'code' in request.");
      return NextResponse.json({ error: "Code is required." }, { status: 400 });
    }

    console.log(`🔍 Checking if invite code "${code}" already exists.`);
    const existing = await prisma.inviteCode.findUnique({ where: { code } });

    if (existing) {
      console.warn(`🚫 Code "${code}" already exists.`);
      return NextResponse.json(
        { error: "Code already exists." },
        { status: 409 }
      );
    }

    console.log(`✅ Code "${code}" is unique. Proceeding to create it.`);
    await prisma.inviteCode.create({ data: { code } });

    console.log(`🎉 Code "${code}" created successfully.`);
    return NextResponse.json({ message: "Code created." }, { status: 201 });
  } catch (error) {
    console.error("❌ Error while creating invite code:", error);
    return NextResponse.json(
      { error: "Failed to create code." },
      { status: 500 }
    );
  }
}
