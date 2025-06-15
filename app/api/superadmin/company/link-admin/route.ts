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
    // Connect the user to the company as an admin
    await prisma.company.update({
      where: { id: companyId },
      data: {
        admins: {
          connect: { id: adminId },
        },
      },
    });

    return new Response(
      JSON.stringify({ message: "Admin linked to company." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to link admin to company." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
