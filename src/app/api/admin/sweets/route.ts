import { NextRequest, NextResponse } from "next/server";
import { SweetService } from "@/services/sweet.service";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireAdmin } from "@/middleware/admin.middleware";

export async function POST(req: NextRequest) {
  // 🔒 AUTH FIRST (DO NOT REMOVE)
  const user = requireAuth(req);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 🔒 ADMIN CHECK (FIXED)
  if (!requireAdmin(user)) {
    return NextResponse.json(
      { error: "Admin only" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, category, price, quantity } = body;

    // 🛑 VALIDATION (UNCHANGED)
    if (!name || !category || price == null || quantity == null) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (price <= 0 || quantity <= 0) {
      return NextResponse.json(
        { error: "Price and quantity must be greater than zero" },
        { status: 400 }
      );
    }

    const sweet = await SweetService.createSweet({
      name,
      category,
      price,
      quantity,
    });

    return NextResponse.json(sweet, { status: 201 });
  } catch (error) {
    console.error("Add sweet error:", error);
    return NextResponse.json(
      { error: "Failed to add sweet" },
      { status: 500 }
    );
  }
}
