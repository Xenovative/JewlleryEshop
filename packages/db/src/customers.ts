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
      // Don't overwrite a name we already have unless it's empty.
      name: input.name || undefined,
      phone: input.phone || undefined,
    },
    create: {
      email,
      name: input.name || null,
      phone: input.phone || null,
    },
  });
  return customer.id;
}
