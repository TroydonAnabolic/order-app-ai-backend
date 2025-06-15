import { PrismaClient } from "@/prisma/generated/client";

export async function POST(request: Request) {
  const { adminId, companyId } = await request.json();

  if (!adminId || !companyId) {
    return new Response(
      JSON.stringify({ error: "adminId and companyId are required." }),
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
    // Disconnect the user from the company's admins list
    await prisma.company.update({
      where: { id: companyId },
      data: {
        admins: {
          disconnect: { id: adminId },
        },
      },
    });

    return new Response(
      JSON.stringify({ message: "Admin unlinked from company." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unlink Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to unlink admin from company." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
