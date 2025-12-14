import { NextRequest, NextResponse } from "next/server";
import { SweetService } from "../../../../services/sweet.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name") || undefined;
  const category = searchParams.get("category") || undefined;
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;

  const sweets = await SweetService.searchSweet({
    name,
    category,
    minPrice,
    maxPrice,
  });

  return NextResponse.json(sweets, { status: 200 });
}
