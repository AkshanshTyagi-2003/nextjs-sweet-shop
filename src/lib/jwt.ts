import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "defaultsecret";

export function signToken(
  payload: object,
  options: SignOptions = { expiresIn: "7d" }
): string {
  return jwt.sign(payload, SECRET as jwt.Secret, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET as jwt.Secret) as JwtPayload;
  } catch {
    return null;
  }
}
