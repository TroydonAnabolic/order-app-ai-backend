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
    // Update the company to link the admin user
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        user: {
          connect: { id: adminId },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "User linked to company.",
        company: updatedCompany,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Failed to link user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to link user to company." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
