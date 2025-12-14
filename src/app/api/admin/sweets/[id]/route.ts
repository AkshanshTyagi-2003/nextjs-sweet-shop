import { NextRequest, NextResponse } from "next/server";
import { SweetService } from "@/services/sweet.service";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireAdmin } from "@/middleware/admin.middleware";

// UPDATE sweet (Admin only)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 AUTH FIRST (DO NOT REMOVE)
    const user = requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔐 ADMIN CHECK (FIXED)
    if (!requireAdmin(user)) {
      return NextResponse.json(
        { error: "Admin only" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const { name, category, price, quantity } = body;

    if (
      !name ||
      !category ||
      typeof price !== "number" ||
      typeof quantity !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    const existingSweet = await SweetService.getSweetById(id);
    if (!existingSweet) {
      return NextResponse.json(
        { error: "Sweet not found" },
        { status: 404 }
      );
    }

    const updatedSweet = await SweetService.updateSweet(id, {
      name,
      category,
      price,
      quantity,
    });

    return NextResponse.json(updatedSweet, { status: 200 });
  } catch (error) {
    console.error("Update sweet error:", error);
    return NextResponse.json(
      { error: "Failed to update sweet" },
      { status: 500 }
    );
  }
}

// DELETE sweet (Admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 AUTH FIRST
    const user = requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔐 ADMIN CHECK (FIXED)
    if (!requireAdmin(user)) {
      return NextResponse.json(
        { error: "Admin only" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const existingSweet = await SweetService.getSweetById(id);
    if (!existingSweet) {
      return NextResponse.json(
        { error: "Sweet not found" },
        { status: 404 }
      );
    }

    await SweetService.deleteSweet(id);

    return NextResponse.json(
      { message: "Sweet deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete sweet error:", error);
    return NextResponse.json(
      { error: "Failed to delete sweet" },
      { status: 500 }
    );
  }
}
