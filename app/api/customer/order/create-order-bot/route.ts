// https://docs.stripe.com/payments/accept-a-payment?platform=react-native&ui=payment-sheet

import { Order, OrderItem } from "@/types/order";
import { PrismaClient } from "@/prisma/generated/client";
import { Reservation } from "@/types/reservation";
import { generateUniqueOrderShortCode } from "@/util/shortCode";

export async function POST(req: Request) {
  // Use an existing Customer ID if this is a returning customer.
  const {
    order,
    reservation,
    email,
    companyId,
  }: {
    order: Order;
    reservation: Reservation;
    email: string;
    companyId: string;
  } = await req.json();

  console.log("Received create ordermessage on server:", order);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  if (
    !order ||
    !order.customerName ||
    !order.phoneNumber ||
    !order.totalOrderCost ||
    !order.orderItems ||
    order.orderItems.length === 0
  ) {
    throw new Error("Order data missing required fields.");
  }

  try {
    // Build the data object for order creation
    const shortCode = await generateUniqueOrderShortCode(prisma);

    const orderData: any = {
      shortCode: shortCode,
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      diningType: order.diningType,
      seatNo: order.seatNo ?? null,
      orderDate: new Date(),
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

    const reservationData: any = {
      name: reservation.name,
      phoneNumber: reservation.phoneNumber,
      diningDate: new Date(reservation.diningDate),
      preferredTime: reservation.preferredTime,
      seatNumbers: reservation.seatNumbers ?? "",
      specialInstructions: reservation.specialInstructions ?? "",
      createdAt: reservation.createdAt
        ? new Date(reservation.createdAt)
        : new Date(),
    };

    // Only connect user if email is defined and not empty
    if (email && email.trim() !== "") {
      orderData.user = { connect: { email: email } };
      reservationData.user = { connect: { email: email } };
    }

    // Only connect company if companyId is defined and not empty
    if (companyId && companyId.trim() !== "") {
      orderData.company = { connect: { id: companyId } };
      reservationData.company = { connect: { id: companyId } };
    }

    const createdOrder = await prisma.order.create({
      data: orderData,
    });

    const createdReservation = await prisma.reservation.create({
      data: reservationData,
    });

    // send email to the customer if email is provided
    // if (email && email.trim() !== "") {
    //   const sendgrid = require("@sendgrid/mail");
    //   sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    //   const msg = {
    //     to: email,
    //     from: "no-reply@yourdomain.com",
    //     subject: "Order Confirmation",
    //     text: `Thank you for your order, ${order.customerName}! Your order ID is ${createdOrder.id}.`,
    //   };

    //   try {
    //     await sendgrid.send(msg);
    //     console.log("Order confirmation email sent successfully.");
    //   } catch (error) {
    //     console.error("Error sending order confirmation email:", error);
    //   }
    // }

    console.log("Order created successfully:", createdOrder.id);
    console.log("Reservation created successfully:", createdReservation.id);
    return new Response(
      JSON.stringify({
        order: createdOrder,
        reservation: createdReservation,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during order processing:", error);
    return new Response(JSON.stringify({ error: "Failed to process order" }), {
      status: 500,
    });
  }
}
