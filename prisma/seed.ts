import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  // Step 1: Create users (individually to avoid duplicate phone/email errors)
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
      },
    }),
  ]);

  // Step 2: Filter out only COMPANY_ADMINs
  const companyAdmins = users.filter((u) => u.role === UserRole.COMPANY_ADMIN);

  // Step 3: Create a company for each COMPANY_ADMIN
  await Promise.all(
    companyAdmins.map((admin, index) =>
      prisma.company.create({
        data: {
          name: `Test Company ${index + 1}`,
          shortCode: `${1000 + index}`, // e.g., "1000", "1001", ...
          currency: "NZD",
          address: "Company Address",
          createdById: admin.id,
          admins: {
            connect: [{ id: admin.id }],
          },
        },
      })
    )
  );

  console.log("✅ Seed completed");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(() => prisma.$disconnect());
