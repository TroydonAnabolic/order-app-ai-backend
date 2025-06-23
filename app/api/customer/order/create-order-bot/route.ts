// https://docs.stripe.com/payments/accept-a-payment?platform=react-native&ui=payment-sheet

import { ai } from "@/lib/gemini";
import { Order, OrderItem } from "@/types/order";
import { PrismaClient } from "@/prisma/generated/client";

export async function POST(req: Request) {
  // Use an existing Customer ID if this is a returning customer.
  const reqBody = await req.json();

  console.log("Received message on server:", reqBody);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  const prompt = `
You are a backend assistant AI. Your job is to convert a plain-English order summary into a valid JSON object matching this schema. Avoid filling in any fields that you do not have enough information for, and use empty strings or nulls for those fields, please leave ID fields empty.

Here is the order summary:

"""
${reqBody.order}
"""

Return this summary as a valid JSON object of the following exact TypeScript interfaces:

\`\`\`ts
interface Order {
  id: string;
  userId?: string;
  companyId: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  diningType: string;
  seatNo?: string;
  preferredDiningTime?: string | null;
  preferredDeliveryTime?: string | null;
  preferredPickupTime?: string | null;
  deliveryAddress?: string;
  totalOrderCost: number;
  specialInstructions?: string;
  orderDate: string;
  createdAt: string;
  user?: User;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: string;
  orderId: string;
  itemId?: string;
  itemName: string;
  size: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  specialInstructions?: string;
  order: Order;
  item?: MenuItem;
}
\`\`\`

Instructions:
- Return **only valid JSON**, no markdown or explanation.
- Use empty strings or nulls for unknown values.
- Use similar names to find mapping, e.g."Small" as size and "Coffee" as itemName.
- Use ISO 8601 format for orderDate and createdAt.

Output:
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  // convert the JSON response to type Order
  if (!response.text) {
    throw new Error("AI response did not return any text.");
  }
  // Clean up AI response to extract JSON
  let raw = response.text.trim();
  // Remove triple backticks and optional 'json' language hint
  if (raw.startsWith("```")) {
    raw = raw
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();
  }

  console.log("Cleaned AI response:", raw);

  const order: Order = JSON.parse(raw);

  // use zod to validate the order object
  if (
    !order ||
    !order.customerName ||
    !order.phoneNumber ||
    !order.totalOrderCost ||
    !order.orderItems ||
    order.orderItems.length === 0
  ) {
    throw new Error("Invalid order data received from AI.");
  }

  try {
    // Build the data object for order creation
    const orderData: any = {
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      diningType: order.diningType,
      seatNo: order.seatNo ?? null,
      orderDate: new Date(order.orderDate),
      totalOrderCost: order.totalOrderCost,
      preferredDiningTime: order.preferredDiningTime ?? null,
      preferredDeliveryTime: order.preferredDeliveryTime ?? null,
      preferredPickupTime: order.preferredPickupTime ?? null,
      deliveryAddress: order.deliveryAddress ?? "",
      specialInstructions: order.specialInstructions ?? "",
      orderItems: {
        create: order.orderItems.map((item: OrderItem) => ({
          itemName: item.itemName,
          size: item.size,
          quantity: item.quantity,
          pricePerItem: item.pricePerItem,
          totalPrice: item.totalPrice,
          specialInstructions: item.specialInstructions ?? "",
        })),
      },
    };

    // Only connect user if email is defined and not empty
    if (order.email && order.email.trim() !== "") {
      orderData.user = { connect: { email: order.email } };
    }

    // Only connect company if companyId is defined and not empty
    if (order.companyId && order.companyId.trim() !== "") {
      orderData.company = { connect: { id: order.companyId } };
    }

    const createdOrder = await prisma.order.create({
      data: orderData,
    });

    console.log("Order created successfully:", createdOrder.id);
    return new Response(JSON.stringify(createdOrder), { status: 201 });
  } catch (error) {
    console.error("Error during order processing:", error);
    return new Response(JSON.stringify({ error: "Failed to process order" }), {
      status: 500,
    });
  }
}
