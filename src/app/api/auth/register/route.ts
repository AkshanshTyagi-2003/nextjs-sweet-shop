import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";
import { registerSchema } from "@/validators/auth.validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate incoming data
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Register user
    const user = await UserService.register(name, email, password);

    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: user.token,
      },
      { status: 200 }
    );

    // Set JWT cookie after registration
    response.cookies.set("token", user.token, {
      httpOnly: true,
      secure: false,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}
