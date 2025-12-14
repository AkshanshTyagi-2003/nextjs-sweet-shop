import { JwtPayload } from "jsonwebtoken";

export function requireAdmin(user: JwtPayload | null) {
  if (!user) return null;

  if (user.role !== "ADMIN") return null;

  return user;
}
