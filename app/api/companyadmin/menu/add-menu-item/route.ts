import { PrismaClient } from "@/prisma/generated/client";

// POST: Add a menu item to a company
export async function POST(request: Request) {
  const body = await request.json();
  const { companyId, name, description, price, currency } = body;

  if (!companyId || !name || typeof price !== "number") {
    return new Response(
      JSON.stringify({ error: "companyId, name, and price are required" }),
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
    // Create a product and a pricing item in stripe each time a menu item is created
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        address: true,
        items: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // save product
    // const stripeProduct = await stripe.products.create({
    //   name: name,
    //   description: description,
    // });

    // const stripePrice = await stripe.prices.create({
    //   currency: currency, // todo: get prices currency input from UI
    //   unit_amount: price,
    //   product: stripeProduct.id,
    // });

    const menuItem = await prisma.menuItem.create({
      data: {
        companyId,
        name,
        description,
        price,
        currency,
      },
    });

    return new Response(JSON.stringify(menuItem), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to add menu item" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
