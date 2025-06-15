import { PrismaClient } from "@/prisma/generated/client";

// POST: Update company address
export async function POST(request: Request) {
  const body = await request.json();
  const { companyId, address, currency } = body;

  if (!companyId) {
    return new Response(JSON.stringify({ error: "companyId is required" }), {
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

  console.log("Updating currency from server: " + currency);

  try {
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: { address, currency },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update company" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
