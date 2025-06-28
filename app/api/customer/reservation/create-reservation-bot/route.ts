// https://docs.stripe.com/payments/accept-a-payment?platform=react-native&ui=payment-sheet

import { PrismaClient } from "@/prisma/generated/client";
import { Reservation } from "@/types/reservation";
import {
  generateUniqueOrderShortCode,
  generateUniqueReservationShortCode,
} from "@/util/shortCode";

export async function POST(req: Request) {
  // Use an existing Customer ID if this is a returning customer.
  const {
    reservation,
    email,
    companyId,
  }: {
    reservation: Reservation;
    email: string;
    companyId: string;
  } = await req.json();

  console.log("Received create reservation on server:", reservation);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  if (!reservation || !reservation.name || !reservation.phoneNumber) {
    throw new Error("Order data missing required fields.");
  }

  try {
    const shortCode = await generateUniqueReservationShortCode(prisma);
    console.log("Generated short code:", shortCode);

    // Build the data object for order creation
    const reservationData: any = {
      name: reservation.name,
      shortCode: shortCode,
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
      reservationData.user = { connect: { email: email } };
    }

    // Only connect company if companyId is defined and not empty
    if (companyId && companyId.trim() !== "") {
      reservationData.company = { connect: { id: companyId } };
    }

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

    console.log("Reservation created successfully:", createdReservation.id);
    return new Response(
      JSON.stringify({
        reservation: createdReservation,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during reservation processing:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process reservation" }),
      {
        status: 500,
      }
    );
  }
}
