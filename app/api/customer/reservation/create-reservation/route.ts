import { PrismaClient } from "@/prisma/generated/client";
import { generateUniqueReservationShortCode } from "@/util/shortCode";

export async function POST(request: Request) {
  console.log(
    "Received create reservation request. Initializing Prisma client..."
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
      firebaseUid,
      companyId,
      diningDate,
      preferredTime,
      seatNumbers,
      specialInstructions,
    } = body;

    console.log("firebaseUid:", firebaseUid);
    console.log("companyId:", companyId);
    console.log("diningDate:", diningDate);

    if (!firebaseUid || !companyId || !diningDate || !preferredTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        id: true,
        givenName: true,
        familyName: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const shortCode = await generateUniqueReservationShortCode(prisma);
    console.log("Generated short code:", shortCode);

    console.log("Creating reservation...");
    const reservation = await prisma.reservation.create({
      data: {
        shortCode: shortCode,
        user: { connect: { id: user.id } },
        company: { connect: { id: companyId } },
        name: `${user.givenName} ${user.familyName}`,
        phoneNumber: user.phoneNumber || "",
        diningDate: new Date(diningDate),
        preferredTime,
        seatNumbers,
        specialInstructions,
      },
    });

    console.log("Reservation created successfully:", reservation.id);
    return new Response(JSON.stringify(reservation), { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create reservation" }),
      {
        status: 500,
      }
    );
  }
}
