import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@/prisma/generated/client";

// TODO: Implement this for staff registration app instead, super admin must not have registration
export async function POST(request: Request) {
  const body = await request.json();
  const {
    email,
    firebaseUid,
    phoneNumber,
    givenName,
    familyName,
    address,
    inviteCode,
  } = body;

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

    // Validate invite code once super admin registration is implemented

    console.log("Checking invite code:", inviteCode);
    const code = await prisma.inviteCode.findUnique({
      where: { code: inviteCode },
    });
    console.log("Invite code found:", code);

    if (!code || code.isUsed) {
      return new Response(
        JSON.stringify({ error: "Invalid or already used invite code" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    // create stripe account
    const account = await stripe.accounts.create({
      email: email as string,
      controller: {
        losses: {
          payments: "application",
        },
        fees: {
          payer: "application",
        },
        stripe_dashboard: {
          type: "express",
        },
      },
    });

    // Create an admin user in the database
    console.log("Creating user in the database with email:", email);
    const user = await prisma.user.create({
      data: {
        email,
        firebaseUid,
        givenName,
        familyName,
        phoneNumber,
        address,
        role: "COMPANY_ADMIN",
        createdAt: new Date(),
        connectedAccountId: account.id, // link stripe account
      },
    });

    // update the invite code to mark it as used
    await prisma.inviteCode.update({
      where: { code: inviteCode },
      data: { isUsed: true },
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
