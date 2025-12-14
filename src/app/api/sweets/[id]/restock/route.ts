import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory.service";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireAdmin } from "@/middleware/admin.middleware";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!requireAdmin(user))
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const { id } = await context.params; // ⭐ FIX

    const body = await req.json();
    const amount = body?.amount || 0;

    const result = await InventoryService.restockSweet(id, amount);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
