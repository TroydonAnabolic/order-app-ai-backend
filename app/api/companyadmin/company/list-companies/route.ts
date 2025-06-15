import { PrismaClient } from "@/prisma/generated/client";

// GET: List companies linked to the user by firebaseUid
export async function GET(request: Request) {
  const url = new URL(request.url);
  const firebaseUid = url.searchParams.get("firebaseUid");
  if (!firebaseUid) {
    return new Response(JSON.stringify({ error: "firebaseUid is required" }), {
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
    // Find the user and include their companies (as admin)
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        email: true,
        firebaseUid: true,
        companies: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      return new Response(JSON.stringify([]), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return only the companies array
    return new Response(JSON.stringify(user.companies ?? []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch companies" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
