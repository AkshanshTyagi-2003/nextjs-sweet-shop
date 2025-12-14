import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let user: any;
  try {
    user = jwt.verify(token, SECRET);
  } catch {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(orders, { status: 200 });
}
