import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/prisma/generated/client"; // adjust if your path is different

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const firebaseUid = req.nextUrl.searchParams.get("firebaseUid");

  if (!firebaseUid) {
    return NextResponse.json(
      { error: "firebaseUid is required" },
      { status: 400 }
    );
  }

  console.log("Received firebaseUid on server:", firebaseUid);

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        email: true,
        firebaseUid: true,
        phoneNumber: true,
        givenName: true,
        familyName: true,
        address: true,
        role: true,
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
