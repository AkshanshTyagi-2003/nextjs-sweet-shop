import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SECRET = process.env.JWT_SECRET || "defaultsecret";

export async function GET(req: Request) {
  try {
    let token: string | undefined;

    // 1️⃣ Try Authorization header first (CLIENT FETCH)
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2️⃣ Fallback to Cookie (SSR / MIDDLEWARE)
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      token = cookieHeader
        ?.split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
