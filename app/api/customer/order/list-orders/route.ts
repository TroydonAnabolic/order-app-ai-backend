import { PrismaClient } from "@/prisma/generated/client";

export async function GET(request: Request) {
  console.log("Reached list orders GET req on server");

  const url = new URL(request.url);
  const firebaseUid = url.searchParams.get("firebaseUid");
  console.log("Received firebaseUid for list order:", firebaseUid);

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
    // Fetch the user then the order from the database
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
      },
    });

    const order = await prisma.order.findMany({
      where: { userId: user?.id },
      select: {
        id: true,
        userId: true,
        companyId: true,
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

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
