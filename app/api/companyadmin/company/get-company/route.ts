import { PrismaClient } from "@/prisma/generated/client/edge";

// GET: Get a single company by companyId, including menu items
export async function GET(request: Request) {
  console.log("➡️ Received GET request to fetch company");

  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId");

  if (!companyId) {
    console.warn("⚠️ Missing companyId in query params.");
    return new Response(JSON.stringify({ error: "companyId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `🔧 Initializing Prisma client with Accelerate for companyId: ${companyId}`
  );
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log(`🔍 Looking up company with ID: ${companyId}`);
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        address: true,
        currency: true,
        items: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) {
      console.warn(`❌ Company with ID ${companyId} not found.`);
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Company data retrieved successfully for ID: ${companyId}`);
    return new Response(JSON.stringify(company), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Failed to fetch company:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch company" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
