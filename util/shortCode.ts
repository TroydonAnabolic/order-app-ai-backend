import { PrismaClient } from "@/prisma/generated/client";

/**
 * Generates a unique 4-digit short code for orders.
 * Retries until a unique code is found.
 */
export async function generateUniqueOrderShortCode(
  prisma: PrismaClient
): Promise<string> {
  let isUnique = false;
  let code = "";
  const maxAttempts = 10;
  let attempts = 0;

  while (!isUnique && attempts < maxAttempts) {
    code = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
    const existing = await prisma.order.findUnique({
      where: { shortCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      "Failed to generate a unique 4-digit short code after multiple attempts."
    );
  }

  return code;
}
