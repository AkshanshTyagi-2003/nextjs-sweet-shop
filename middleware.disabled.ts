import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ PUBLIC ROUTES
  const publicRoutes = ["/login", "/register", "/"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ PUBLIC AUTH APIs
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  // ✅ API ROUTES: RETURN JSON
  if (pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  // ✅ PAGE ROUTES
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = jwt.verify(token, SECRET) as any;

    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/orders/:path*",
    "/api/:path*",
  ],
};
