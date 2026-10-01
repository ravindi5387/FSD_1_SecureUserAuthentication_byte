import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../config/db";
import { env } from "../config/env";
import { AuthRequest } from "../types/auth";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72)
});

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(100)
});

function validationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    message: "Validation failed",
    errors: error.issues.map(i => ({ field: i.path.join("."), message: i.message }))
  });
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const { name, email, password } = parsed.data;

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rowCount) return res.status(409).json({ message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email.toLowerCase(), passwordHash]
    );

    return res.status(201).json({
      message: "Registration successful",
      user: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (!result.rowCount) return res.status(401).json({ message: "Invalid email or password" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { email: user.email },
      env.jwtSecret,
      { subject: String(user.id), expiresIn: env.jwtExpiresIn } as jwt.SignOptions
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (!result.rowCount) return res.status(401).json({ message: "User no longer exists" });

    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
