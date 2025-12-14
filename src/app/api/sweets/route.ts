import { NextRequest, NextResponse } from "next/server";
import { SweetService } from "@/services/sweet.service";
import { validateSweet } from "@/validators/sweet.validator";
import { requireAdmin } from "@/middleware/admin.middleware";

// GET all sweets
export async function GET() {
  const sweets = await SweetService.getAllSweets();
  return NextResponse.json(sweets, { status: 200 });
}

// CREATE a new sweet (Admin only)
export async function POST(req: NextRequest) {
  try {
    // ✅ ADMIN AUTH CHECK (COOKIE BASED)
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await req.json();

    // Validate using your validator
    if (!validateSweet(body)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const sweet = await SweetService.createSweet(body);

    return NextResponse.json(sweet, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
