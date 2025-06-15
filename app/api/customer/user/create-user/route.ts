import { PrismaClient } from "@/prisma/generated/client";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, firebaseUid, phoneNumber, givenName, familyName, address } =
    body;

  console.log("Received registration data from server:");

  // Here you would typically handle the registration logic
  // For example, you might create a user in your database
  // and return a success response.
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a new user
    await prisma.user.create({
      data: {
        email,
        firebaseUid,
        givenName,
        familyName,
        phoneNumber,
        address,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ error: "Registration failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(
    JSON.stringify({ message: "User registered successfully" }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}
