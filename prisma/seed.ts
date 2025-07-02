import { PrismaClient, UserRole } from "./generated/client";

const prisma = new PrismaClient();

async function seed() {
  // Step 1: Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "troyincarnate@gmail.com",
        firebaseUid: "puQ5ijlHVjMM8KEjqyFJ32vIYZ12",
        givenName: "Super",
        familyName: "Admin",
        phoneNumber: "+64212345678",
        address: "123 Main Street, Auckland",
        role: "SUPER_ADMIN",
        connectedAccountId: "conn-1",
      },
    }),
    prisma.user.create({
      data: {
        email: "tluicien@yahoo.co.nz",
        firebaseUid: "1UCUO6TkfDgVYaDoCyePetrfP5q1",
        givenName: "Troydon",
        familyName: "Luicien",
        phoneNumber: "+64224319560",
        address: "123 Main Street, Auckland",
        role: "CUSTOMER",
        connectedAccountId: "conn-2",
      },
    }),
    prisma.user.create({
      data: {
        email: "bobtroybo@gmail.com",
        firebaseUid: "YomPnBfydoTGt90rOOJYlZQVVl13",
        givenName: "Bob",
        familyName: "Troy",
        phoneNumber: "+64243345678",
        address: "123 Main Street, Auckland",
        role: "COMPANY_ADMIN",
        connectedAccountId: "conn-3",
      },
    }),
    prisma.user.create({
      data: {
        email: "troydon10@outlook.co.nz",
        firebaseUid: "Frcwmap0TiYZOcOR4dyzRLCg7jh2",
        givenName: "Troydon",
        familyName: "Luicien",
        phoneNumber: "+64209345679",
        address: "123 Main Street, Auckland",
        role: "COMPANY_ADMIN",
        connectedAccountId: "conn-4",
      },
    }),
    prisma.user.create({
      data: {
        email: "troydon993@gmail.com",
        firebaseUid: "5GvUSvteZGU4MKVAzz3ROpEEUA43",
        givenName: "Troydon",
        familyName: "Luicien",
        phoneNumber: "+64209345680",
        address: "123 Main Street, Auckland",
        role: "COMPANY_ADMIN",
        connectedAccountId: "conn-5",
      },
    }),
    prisma.user.create({
      data: {
        email: "troydon81@gmail.com",
        firebaseUid: "Wh5qChg9jEc2bnWR6But8FvBC9Z2",
        givenName: "Troydon",
        familyName: "Luicien",
        phoneNumber: "+64209345681",
        address: "123 Main Street, Auckland",
        role: "COMPANY_ADMIN",
        connectedAccountId: "conn-6",
      },
    }),
    prisma.user.create({
      data: {
        email: "t94017605@gmail.com",
        firebaseUid: "D1nvpul6KmdEsRVpliYwWwor2y43",
        givenName: "Troydon",
        familyName: "Luicien",
        phoneNumber: "+64209345682",
        address: "123 Main Street, Auckland",
        role: "COMPANY_ADMIN",
        connectedAccountId: "conn-7",
      },
    }),
  ]);

  const customerUser = users.find((u) => u.email === "tluicien@yahoo.co.nz");
  if (!customerUser) throw new Error("Customer user not found");

  const companyAdmins = users.filter((u) => u.role === UserRole.COMPANY_ADMIN);

  // Step 2: Create companies with direct one-to-one user assignment
  const companies = await Promise.all(
    companyAdmins.map((admin, index) =>
      prisma.company.create({
        data: {
          name: `Test Company ${index + 1}`,
          shortCode: `${1000 + index}`,
          currency: "NZD",
          address: "Company Address",
          user: {
            connect: { id: admin.id },
          },
        },
      })
    )
  );

  // Step 3: Create menu items
  await Promise.all(
    companies.map((company) =>
      prisma.menuItem.createMany({
        data: [
          {
            companyId: company.id,
            name: "Flat White",
            description: "Classic NZ coffee",
            price: 4.5,
            quantity: 100,
            currency: "NZD",
            size: "Medium",
            specialInstructions: "No sugar",
          },
          {
            companyId: company.id,
            name: "Latte",
            description: "Smooth and creamy",
            price: 5.0,
            quantity: 80,
            currency: "NZD",
            size: "Large",
            specialInstructions: "Extra hot",
          },
        ],
      })
    )
  );

  // Step 4: Create orders and reservations for the customer
  await Promise.all(
    companies.map(async (company, idx) => {
      await prisma.order.create({
        data: {
          shortCode: `${2000 + idx}`,
          customerName: `${customerUser.givenName} ${customerUser.familyName}`,
          phoneNumber: customerUser.phoneNumber ?? "",
          diningType: "Dine In",
          seatNo: "5",
          orderDate: new Date(),
          totalOrderCost: 9.5,
          preferredDiningDate: "2025-07-01",
          preferredDiningTime: "12:00",
          preferredDeliveryTime: null,
          preferredPickupTime: null,
          deliveryAddress: "123 Main Street, Auckland",
          specialInstructions: "Window seat",
          company: { connect: { id: company.id } },
          user: { connect: { id: customerUser.id } },
          orderItems: {
            create: [
              {
                itemName: "Flat White",
                size: "Medium",
                quantity: 1,
                pricePerItem: 4.5,
                totalPrice: 4.5,
              },
              {
                itemName: "Latte",
                size: "Large",
                quantity: 1,
                pricePerItem: 5.0,
                totalPrice: 5.0,
              },
            ],
          },
        },
      });

      await prisma.reservation.create({
        data: {
          companyId: company.id,
          userId: customerUser.id,
          shortCode: `${3000 + idx}`,
          name: `${customerUser.givenName} ${customerUser.familyName}`,
          phoneNumber: customerUser.phoneNumber ?? "",
          diningDate: new Date("2025-07-01T12:00:00.000Z"),
          preferredTime: "12:00",
          seatNumbers: "5",
          specialInstructions: "Window seat",
          createdAt: new Date(),
        },
      });
    })
  );

  console.log("✅ Seed completed");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(() => prisma.$disconnect());
