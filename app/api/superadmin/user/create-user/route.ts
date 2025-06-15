import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client"; // Adjust path if needed

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firebaseUid, phoneNumber, givenName, familyName, address } =
      body;

    console.log("Received registration data from server:", email);

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firebaseUid,
        givenName,
        familyName,
        phoneNumber,
        address,
        role: "SUPER_ADMIN",
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
