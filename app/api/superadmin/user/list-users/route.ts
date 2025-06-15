import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@/prisma/generated/client"; // Adjust path if needed

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");

  if (!role) {
    return NextResponse.json({ error: "role is required" }, { status: 400 });
  }

  const roleEnum = role.toUpperCase() as UserRole;

  console.log("Received role:", roleEnum);

  try {
    const users = await prisma.user.findMany({
      where: { role: roleEnum },
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

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
