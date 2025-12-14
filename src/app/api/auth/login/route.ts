import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";
import { loginSchema } from "@/validators/auth.validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await UserService.login(email, password);

    const response = NextResponse.json(
      {
        message: "Login successful",
        token: user.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // ✅ FINAL CORRECT COOKIE CONFIG
    response.cookies.set("token", user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // 🔥 THIS WAS THE MISSING PIECE
      path: "/",       // 🔥 REQUIRED
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
