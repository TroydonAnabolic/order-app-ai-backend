import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client"; // Use your actual Prisma path

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  console.log("Received id on server:", id);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firebaseUid: true,
        phoneNumber: true,
        givenName: true,
        familyName: true,
        address: true,
        role: true,
        companies: true, // Assumes correct relation set in Prisma schema
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
