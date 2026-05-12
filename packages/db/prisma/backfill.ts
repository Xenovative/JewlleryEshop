// One-time backfill after the unified back-office schema migration.
//   - Expand Product.rentCopiesCount into RentalCopy rows.
//   - Upsert Customer rows from existing Order/Booking emails and link FKs.
//   - Create the first AdminUser (owner) from ADMIN_USER / ADMIN_PASS env if the
//     AdminUser table is empty.
//
// Idempotent: safe to run repeatedly.

import "../src/sqliteDatabaseUrl";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureDefaultCategories() {
  const categories = [
    { slug: "rings", name: "Rings" },
    { slug: "necklaces", name: "Necklaces" },
    { slug: "earrings", name: "Earrings" },
    { slug: "bracelets", name: "Bracelets" },
    { slug: "other", name: "Other" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log("[backfill] default categories ensured.");
}

async function expandRentalCopies() {
  const products = await prisma.product.findMany({
    where: { rentable: true },
    include: { rentalCopies: true },
  });
  let created = 0;
  for (const p of products) {
    const want = Math.max(0, p.rentCopiesCount);
    const have = p.rentalCopies.length;
    if (have >= want) continue;
    const toCreate = want - have;
    for (let i = 0; i < toCreate; i++) {
      const idx = have + i + 1;
      await prisma.rentalCopy.create({
        data: {
          productId: p.id,
          label: `Copy ${idx}`,
          status: "available",
        },
      });
      created++;
    }
  }
  console.log(`[backfill] rental copies created: ${created}`);
}

async function upsertCustomers() {
  let linkedOrders = 0;
  let linkedBookings = 0;

  const orders = await prisma.order.findMany({
    where: { customerId: null, email: { not: null } },
  });
  for (const o of orders) {
    if (!o.email) continue;
    const c = await prisma.customer.upsert({
      where: { email: o.email.toLowerCase() },
      update: {},
      create: { email: o.email.toLowerCase() },
    });
    await prisma.order.update({ where: { id: o.id }, data: { customerId: c.id } });
    linkedOrders++;
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId: null },
  });
  for (const b of bookings) {
    if (!b.email) continue;
    const c = await prisma.customer.upsert({
      where: { email: b.email.toLowerCase() },
      update: { name: b.customerName || undefined },
      create: { email: b.email.toLowerCase(), name: b.customerName || undefined },
    });
    await prisma.booking.update({
      where: { id: b.id },
      data: { customerId: c.id },
    });
    linkedBookings++;
  }

  console.log(
    `[backfill] customers linked — orders: ${linkedOrders}, bookings: ${linkedBookings}`
  );
}

async function ensureOwner() {
  const count = await prisma.adminUser.count();
  if (count > 0) {
    console.log(`[backfill] AdminUser table already has ${count} row(s); skipping owner seed.`);
    return;
  }
  const username = process.env.ADMIN_USER ?? "admin";
  const password = process.env.ADMIN_PASS ?? "changeme";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({
    data: { username, passwordHash, role: "owner" },
  });
  console.log(`[backfill] Created owner AdminUser '${username}'.`);
}

async function main() {
  await ensureDefaultCategories();
  await expandRentalCopies();
  await upsertCustomers();
  await ensureOwner();
  console.log("[backfill] done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
