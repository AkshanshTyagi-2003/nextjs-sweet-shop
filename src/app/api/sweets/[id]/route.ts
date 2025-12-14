import { NextRequest, NextResponse } from "next/server";
import { SweetService } from "@/services/sweet.service";
import { validateSweet } from "@/validators/sweet.validator";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireAdmin } from "@/middleware/admin.middleware";

/* ============================
   GET Sweet by ID
============================ */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⭐ IMPORTANT FIX

  const sweet = await SweetService.getSweetById(id);
  if (!sweet)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(sweet, { status: 200 });
}

/* ============================
   UPDATE Sweet by ID
============================ */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!requireAdmin(user))
      return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { id } = await context.params; // ⭐ FIX HERE

    const body = await req.json();

    if (!validateSweet({ ...body, quantity: body.quantity ?? 0 }))
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const updated = await SweetService.updateSweet(id, body);

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

/* ============================
   DELETE Sweet by ID
============================ */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!requireAdmin(user))
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await context.params; // ⭐ FIX HERE

  await SweetService.deleteSweet(id);

  return NextResponse.json({ message: "Deleted" }, { status: 200 });
}
