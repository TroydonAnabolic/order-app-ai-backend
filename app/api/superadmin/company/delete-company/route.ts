import { PrismaClient } from "@/prisma/generated/client";

export async function DELETE(request: Request) {
  const { companyId } = await request.json();

  if (!companyId || typeof companyId !== "string") {
    return new Response(JSON.stringify({ error: "companyId is required." }), {
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
    const existing = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existing) {
      return new Response(JSON.stringify({ error: "Company not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.company.delete({
      where: { id: companyId },
    });

    return new Response(
      JSON.stringify({ message: "Company deleted successfully." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting company:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete company." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
