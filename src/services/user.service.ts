import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";

export class UserService {
  static async register(name: string, email: string, password: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    });

    const token = signToken({ id: user.id, role: user.role });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Incorrect password");

    const token = signToken({ id: user.id, role: user.role });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  }
}
