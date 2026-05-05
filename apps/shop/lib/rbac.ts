import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE, type Role } from "./session";

export type SessionUser = { username: string; userId: string; role: Role };

const ORDER: Role[] = ["viewer", "staff", "owner"];

export function roleAtLeast(actual: Role, min: Role): boolean {
  return ORDER.indexOf(actual) >= ORDER.indexOf(min);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return { username: session.sub, userId: session.uid, role: session.role };
}

/** For server components — redirects to login if missing or to /backoffice if role too low. */
export async function requireRole(min: Role): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/backoffice/login");
  if (!roleAtLeast(user.role, min)) redirect("/backoffice");
  return user;
}

/** For route handlers — returns NextResponse on failure, or the user. */
export async function requireApiRole(
  min: Role
): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roleAtLeast(user.role, min)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}
