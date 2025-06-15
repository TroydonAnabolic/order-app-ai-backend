import { PrismaClient } from "@/prisma/generated/client/edge";

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id || typeof id !== "string") {
    return new Response(JSON.stringify({ error: "id is required" }), {
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
    const existing = await prisma.menuItem.findUnique({ where: { id } });

    if (!existing) {
      return new Response(JSON.stringify({ error: "Menu item not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.menuItem.delete({ where: { id } });

    return new Response(
      JSON.stringify({ message: "Menu item deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Delete menu item error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete menu item" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
