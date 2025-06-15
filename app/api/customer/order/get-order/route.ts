import { PrismaClient } from "@/prisma/generated/client";

export async function GET(request: Request) {
  console.log("Reached get orders GET req on server");

  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  console.log("Received orderId for list order:", orderId);

  if (!orderId) {
    return new Response(JSON.stringify({ error: "orderId is required" }), {
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
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        orderItems: {
          select: {
            id: true,
            itemName: true,
            size: true,
            quantity: true,
            pricePerItem: true,
            totalPrice: true,
            specialInstructions: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(order), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch order" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
