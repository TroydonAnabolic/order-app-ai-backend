import { PrismaClient } from "@/prisma/generated/client";

export async function POST(request: Request) {
  console.log(
    "Received create order on the server. Initializing Prisma client..."
  );
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log("Parsing request body...");
    const body = await request.json();
    const {
      items,
      firebaseUid,
      companyId,
      diningType,
      seatNo,
      preferredDiningTime,
      preferredDeliveryTime,
      preferredPickupTime,
      deliveryAddress,
    } = body;

    console.log("Received items:", items);

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("No items in order.");
      return new Response(JSON.stringify({ error: "No items in order" }), {
        status: 400,
      });
    }

    // Log individual fields before validation
    console.log("firebaseUid:", firebaseUid);
    console.log("companyId:", companyId);
    console.log("diningType:", diningType);

    if (!firebaseUid || !companyId || !diningType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    // get necessary user info
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        givenName: true,
        familyName: true,
        phoneNumber: true,
      },
    });

    console.log("Creating order...");
    const totalCost = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    console.log("Total order cost calculated:", totalCost);

    const order = await prisma.order.create({
      data: {
        user: { connect: { id: user?.id } },
        company: { connect: { id: companyId } },
        customerName: `${user?.givenName} ${user?.familyName}`,
        phoneNumber: user?.phoneNumber || "",
        diningType,
        seatNo: seatNo ?? null,
        orderDate: new Date(),
        totalOrderCost: totalCost,
        preferredDiningTime,
        preferredDeliveryTime,
        preferredPickupTime,
        deliveryAddress,
        orderItems: {
          create: items.map((item: any) => {
            const mappedItem = {
              item: { connect: { id: item.id } },
              quantity: item.quantity,
              itemName: item.name,
              size: item.size,
              pricePerItem: item.price,
              totalPrice: item.price * item.quantity!,
              specialInstructions: item.specialInstructions,
            };
            console.log("Mapped order item:", mappedItem);
            return mappedItem;
          }),
        },
      },
      include: { orderItems: true },
    });

    console.log("Order created successfully:", order.id);
    return new Response(JSON.stringify(order), { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(JSON.stringify({ error: "Failed to create order" }), {
      status: 500,
    });
  }
}
