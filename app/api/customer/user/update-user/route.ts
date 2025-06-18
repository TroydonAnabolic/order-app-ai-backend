import { PrismaClient } from "@/prisma/generated/client";

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, email, phoneNumber, givenName, familyName, address } = body;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing user ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        givenName,
        familyName,
        phoneNumber,
        address,
      },
      include: {
        orders: true,
        reservations: true,
      },
    });

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update error:", error);
    return new Response(JSON.stringify({ error: "Failed to update user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
