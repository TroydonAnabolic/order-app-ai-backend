import { PrismaClient } from "@/prisma/generated/client";

export async function GET(request: Request) {
  console.log("Reached list reservations GET req on server");

  const url = new URL(request.url);
  const firebaseUid = url.searchParams.get("firebaseUid");
  console.log("Received firebaseUid for list reservations:", firebaseUid);

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
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        diningDate: true,
        preferredTime: true,
        seatNumbers: true,
        specialInstructions: true,
        createdAt: true,
        companyId: true,
      },
      orderBy: {
        diningDate: "desc",
      },
    });

    return new Response(JSON.stringify(reservations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch reservations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
