import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireAdmin } from "@/middleware/admin.middleware";

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Authenticate
    const user = requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Authorize
    if (!requireAdmin(user)) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    // 3️⃣ Fetch safe user data
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
