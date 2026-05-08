import { NextResponse } from "next/server";
import { prisma } from "@lumiere/db";
import { requireApiRole } from "@/lib/rbac";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const guard = await requireApiRole("staff");
  if (guard instanceof NextResponse) return guard;

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    ["email", "name", "phone", "notes"],
    customers.map((c) => [c.email, c.name ?? "", c.phone ?? "", c.notes ?? ""])
  );

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="customers.csv"`,
    },
  });
}
