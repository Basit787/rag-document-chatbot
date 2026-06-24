import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { ZodError, type ZodSchema } from "zod";
import type { Role } from "@prisma/client";
import { bearerToken, verifyToken } from "./auth";

export type AuthUser = { id: string; email: string; role: Role };

export type AppVariables = {
  user: AuthUser;
  validatedBody: unknown;
};

export function validateJson<T>(schema: ZodSchema<T>) {
  return createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    const body = await c.req.json().catch(() => null);
    const result = schema.safeParse(body);
    if (!result.success) {
      throw new HTTPException(400, { message: JSON.stringify({ error: "Validation failed", details: result.error.flatten().fieldErrors }) });
    }
    c.set("validatedBody", result.data);
    await next();
  });
}

export const authenticate = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const token = bearerToken(c.req.header("Authorization"));
  if (!token) throw new HTTPException(401, { message: "Authentication required" });
  try {
    c.set("user", await verifyToken(token));
    await next();
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
});

export function requireRole(...roles: Role[]) {
  return createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) throw new HTTPException(403, { message: "Insufficient permissions" });
    await next();
  });
}

export function onError(err: Error, c: { json: (data: unknown, status?: number) => Response }) {
  if (err instanceof HTTPException) {
    try {
      return c.json(JSON.parse(err.message), err.status);
    } catch {
      return c.json({ error: err.message }, err.status);
    }
  }
  if (err instanceof ZodError) return c.json({ error: "Validation failed", details: err.flatten().fieldErrors }, 400);
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
}
