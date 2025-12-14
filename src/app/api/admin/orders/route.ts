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

    // 3️⃣ Fetch ORDERS (NOT USERS)
    const orders = await prisma.order.findMany({
      select: {
        userName: true,
        userEmail: true,
        userRole: true,
        sweetName: true,
        sweetCategory: true,
        pricePerUnit: true,
        quantity: true,
        totalPrice: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
