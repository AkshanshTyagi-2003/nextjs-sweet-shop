import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory.service";
import { requireAuth } from "@/middleware/auth.middleware";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(req);

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await req.json();

    const quantity = Number(body.quantity);
    if (!quantity || quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    // ✅ Correct: pass authenticated user to service
    const result = await InventoryService.purchaseSweet(
      id,
      quantity,
      user
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}
