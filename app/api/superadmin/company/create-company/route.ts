import { PrismaClient } from "@/prisma/generated/client";

export async function POST(request: Request) {
  const { name, address, firebaseUid } = await request.json();

  if (!name || typeof name !== "string") {
    return new Response(
      JSON.stringify({ error: "Company name is required." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // generate unique shortcode:
    let code: string = "";
    let exists = true;

    while (exists) {
      code = Math.floor(1000 + Math.random() * 9000).toString(); // Generates 4-digit string
      exists =
        (await prisma.company.findUnique({ where: { shortCode: code } })) !==
        null;
    }

    await prisma.company.create({
      data: {
        name,
        address,
        shortCode: code,
        currency: "USD",
      },
    });

    return new Response(JSON.stringify({ message: "Company created." }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to create company." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
