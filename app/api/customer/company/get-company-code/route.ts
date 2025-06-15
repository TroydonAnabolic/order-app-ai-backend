import { PrismaClient } from "@/prisma/generated/client";

// Gets menu items based on company name
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  console.log(" Received company name from the server: " + code);

  if (!code) {
    return new Response(JSON.stringify({ error: "code is required" }), {
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
    const company = await prisma.company.findFirst({
      where: { shortCode: code },
      select: {
        id: true,
        name: true,
        address: true,
        // items: {
        //   select: {
        //     id: true,
        //     name: true,
        //     description: true,
        //     price: true,
        //     createdAt: true,
        //   },
        // },
      },
    });

    return new Response(JSON.stringify(company ?? null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch menu items" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
