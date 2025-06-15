import { PrismaClient } from "@/prisma/generated/client";

// gets the user based on firebaseUid
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return new Response(JSON.stringify({ error: "email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log("Received email:", email);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  try {
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { email },
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
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
