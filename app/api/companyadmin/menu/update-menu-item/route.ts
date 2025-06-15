import { PrismaClient } from "@/prisma/generated/client/edge";

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, name, description, price, currency } = body;

  if (!id || typeof price !== "number" || !name) {
    return new Response(
      JSON.stringify({ error: "id, name, and price are required" }),
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
    const existing = await prisma.menuItem.findUnique({ where: { id } });

    if (!existing) {
      return new Response(JSON.stringify({ error: "Menu item not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price,
        currency,
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update menu item" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
