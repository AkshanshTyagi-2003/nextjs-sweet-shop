import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { verifyToken } from "../lib/jwt";

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAuth(req: NextRequest) {
  try {
    /* 1️⃣ FIRST: Authorization header (KEEP THIS – your tables depend on it) */
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const user = verifyToken(token);
      if (user) return user;
    }

    /* 2️⃣ FALLBACK: Cookie-based auth (needed for admin routes) */
    const cookieToken = req.cookies.get("token")?.value;
    if (cookieToken) {
      const decoded = jwt.verify(cookieToken, JWT_SECRET) as any;
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
}
