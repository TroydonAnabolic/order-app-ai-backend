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
    // Ensure the company is currently linked to the specified admin
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || company.userId !== adminId) {
      return new Response(
        JSON.stringify({
          error: "Company is not linked to the specified admin.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Unlink the user by setting userId to null
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        user: {
          disconnect: true,
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "User unlinked from company.",
        company: updatedCompany,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unlink Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to unlink user from company." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
