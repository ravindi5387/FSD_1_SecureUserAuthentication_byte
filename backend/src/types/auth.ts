import { Request } from "express";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
