// https://docs.stripe.com/payments/accept-a-payment?platform=react-native&ui=payment-sheet

import { ai } from "@/lib/gemini";
import { stripe } from "@/lib/stripe";
import { Order } from "@/types/order";
import { CURRENCY } from "@/util/config";

export async function POST(req: Request) {
  // Use an existing Customer ID if this is a returning customer.
  const reqBody = await req.json();

  console.log("Received message on server:", reqBody);

  const prompt = `
You are a backend assistant AI. Your job is to convert a plain-English order summary into a valid JSON object matching this schema. Avoid filling in any fields that you do not have enough information for, and use empty strings or nulls for those fields, please leave all ID fields empty.

Here is the order summary:

"""
${reqBody.orderSummary}
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

  // first try to find a stripe customer by email
  const existingCustomer = await stripe.customers.list({
    email: order.email,
  });

  // use existing customer if found, otherwise create a new one
  const customer =
    existingCustomer.data[0] ||
    (await stripe.customers.create({
      name: order.customerName!,
      phone: order.phoneNumber!,
      email: order.email || undefined,
    }));

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2025-04-30.basil" }
  );

  //   const session = await stripe.checkout.sessions.create({
  //     payment_method_types: ["card"],
  //     mode: "payment",
  //     customer: customer.id,
  //     line_items: [
  //       {
  //         price_data: {
  //           currency: CURRENCY,
  //           product_data: {
  //             name: `Order #${order.id.slice(0, 8).toUpperCase()}`,
  //           },
  //           unit_amount: order.totalOrderCost * 100, // Convert to cents
  //         },
  //         quantity: 1,
  //       },
  //     ],
  //     success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
  //     cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
  //   });
  // TODO: Uncomment the following code to create a Checkout Session instead of a Payment Intent

  const paymentIntentData: any = {
    amount: Math.floor(order.totalOrderCost * 100),
    currency: CURRENCY,
    automatic_payment_methods: { enabled: true },
  };

  if (order.email) {
    // Only attach customer if you have a unique identifier
    paymentIntentData.customer = customer.id;
  }

  const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

  return Response.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });
}
