import { PrismaClient } from "@/prisma/generated/client";

export async function GET(request: Request) {
  console.log("Reached get reservation GET req on server");

  const url = new URL(request.url);
  const reservationId = url.searchParams.get("reservationId");
  console.log("Received reservationId:", reservationId);

  if (!reservationId) {
    return new Response(
      JSON.stringify({ error: "reservationId is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        userId: true,
        companyId: true,
        name: true,
        phoneNumber: true,
        diningDate: true,
        preferredTime: true,
        seatNumbers: true,
        specialInstructions: true,
        createdAt: true,
      },
    });

    return new Response(JSON.stringify(reservation), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch reservation" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
