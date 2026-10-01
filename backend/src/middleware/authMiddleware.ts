import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthRequest } from "../types/auth";

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as {
      sub: string;
      email: string;
    };

    req.user = {
      id: Number(payload.sub),
      name: "",
      email: payload.email
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
