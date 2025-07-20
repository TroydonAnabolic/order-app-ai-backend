import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// gets the user based on firebaseUid
export async function POST(request: Request) {
  const body = await request.json();
  const firebaseUid = body.firebaseUid;

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
        connectedAccountId: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    //const origin = request.headers.get("origin");
    //console.log("Origin URL:", origin);

    // const accountLink = await stripe.accountLinks.create({
    //   account: user?.connectedAccountId as string,
    //   refresh_url:
    //     process.env.NODE_ENV === `development`
    //       ? `exp://192.168.1.12:8081/--/billing`
    //       : `orderappcompany://billing`,
    //   return_url:
    //     process.env.NODE_ENV === `development`
    //       ? `exp://192.168.1.12:8081/--/return/${user?.connectedAccountId}`
    //       : `orderappcompany://return/${user?.connectedAccountId}`,
    //   type: "account_onboarding",
    // });

    // TODO: Create the pages for the refresh url and return url, and have a button on it
    // that deep links back to the expo app
    const accountLink = await stripe.accountLinks.create({
      account: user?.connectedAccountId as string,
      refresh_url:
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/billing`
          : `https://order-app-ai-backend.vercel.app/billing`,
      return_url:
        process.env.NODE_ENV === "development"
          ? // ? `http://localhost:3000/return/${user?.connectedAccountId}`
            // : `https://order-app-ai-backend.vercel.app/return/${user?.connectedAccountId}`,
            `http://localhost:3000/billing`
          : `https://order-app-ai-backend.vercel.app/billing`,

      type: "account_onboarding",
    });

    console.log("Stripe account link created on the server:", accountLink.url);

    return new Response(JSON.stringify({ url: accountLink.url }), {
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
