import { prisma } from "./prisma";

/**
 * Upsert a Customer by lower-cased email and return its id.
 * Designed to be called from order/booking webhooks.
 */
export async function upsertCustomerByEmail(input: {
  email: string;
  name?: string | null;
  phone?: string | null;
}): Promise<string> {
  const email = input.email.toLowerCase().trim();
  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      name: input.name?.trim() ? input.name.trim() : undefined,
      phone: input.phone?.trim() ? input.phone.trim() : undefined,
    },
    create: {
      email,
      name: input.name?.trim() || null,
      phone: input.phone?.trim() || null,
    },
  });
  return customer.id;
}
