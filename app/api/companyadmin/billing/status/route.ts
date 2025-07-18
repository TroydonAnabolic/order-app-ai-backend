import { prisma } from "@/lib/prisma";

// gets the user based on firebaseUid
export async function GET(request: Request) {
  const url = new URL(request.url);
  const firebaseUid = url.searchParams.get("firebaseUid");
  if (!firebaseUid) {
    return new Response(JSON.stringify({ error: "firebaseUid is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.log("Received firebaseUid on server:", firebaseUid);

  try {
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      select: {
        stripeConnectedLinked: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(user), {
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
