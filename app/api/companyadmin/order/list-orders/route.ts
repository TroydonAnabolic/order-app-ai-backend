import { PrismaClient } from "@/prisma/generated/client";

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
    // Get the user and their company
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        company: true,
      },
    });

    if (!user || !user.company) {
      return new Response(
        JSON.stringify({ error: "User or company not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch orders for that company
    const orders = await prisma.order.findMany({
      where: { companyId: user.company.id },
      select: {
        id: true,
        shortCode: true,
        userId: true,
        companyId: true,
        company: true,
        customerName: true,
        phoneNumber: true,
        diningType: true,
        seatNo: true,
        preferredDiningTime: true,
        preferredDeliveryTime: true,
        preferredPickupTime: true,
        deliveryAddress: true,
        totalOrderCost: true,
        specialInstructions: true,
        orderDate: true,
        createdAt: true,
      },
    });

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
