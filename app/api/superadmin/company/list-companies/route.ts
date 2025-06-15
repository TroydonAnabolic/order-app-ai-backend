import { PrismaClient } from "@/prisma/generated/client";

export async function GET() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, address: true },
    });
    return new Response(JSON.stringify(companies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
