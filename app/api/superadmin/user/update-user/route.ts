import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client"; // Adjust path if needed+

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      email,
      firebaseUid,
      phoneNumber,
      givenName,
      familyName,
      address,
      role,
    } = body;

    if (!id || !email || !firebaseUid || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        firebaseUid,
        phoneNumber,
        givenName,
        familyName,
        address,
        role,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("PUT /api/user/update-user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
