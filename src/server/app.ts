import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import pdf from "pdf-parse";
import { z } from "zod";
import { prisma } from "@/db";
import { chunkText, embed, chatWithRag } from "@/lib/rag";
import { hashPassword, signToken, verifyPassword } from "./auth";
import { authenticate, onError, requireRole, validateJson, type AppVariables } from "./middleware";
import { Role } from "@prisma/client";

const app = new Hono<{ Variables: AppVariables }>().basePath("/api");

app.use("*", secureHeaders());
app.onError(onError);

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const askSchema = z.object({ question: z.string().min(3).max(4000) });

app.post("/auth/register", validateJson(registerSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof registerSchema>;
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return c.json({ error: "Email already registered" }, 409);
  const user = await prisma.user.create({
    data: { email: body.email, password: await hashPassword(body.password), role: Role.USER },
  });
  const token = await signToken(user);
  return c.json({ token, user: { id: user.id, email: user.email, role: user.role } }, 201);
});

app.post("/auth/login", validateJson(loginSchema), async (c) => {
  const body = c.get("validatedBody") as z.infer<typeof loginSchema>;
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const token = await signToken(user);
  return c.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

app.get("/auth/me", authenticate, (c) => c.json({ user: c.get("user") }));

app.post("/upload", authenticate, async (c) => {
  const user = c.get("user");
  const form = await c.req.parseBody();
  const file = form.file;
  if (!file || typeof file === "string") return c.json({ error: "No file" }, 400);
  const f = file as File;
  if (f.size > 15 * 1024 * 1024) return c.json({ error: "File too large (max 15MB)" }, 413);

  const buf = Buffer.from(await f.arrayBuffer());
  const text = f.name.endsWith(".pdf") ? (await pdf(buf)).text : buf.toString("utf8");
  if (!text.trim()) return c.json({ error: "Empty document" }, 400);

  const doc = await prisma.document.create({ data: { filename: f.name, userId: user.id } });
  let count = 0;
  for (const piece of chunkText(text)) {
    await prisma.chunk.create({ data: { documentId: doc.id, content: piece, embedding: await embed(piece) } });
    count++;
  }
  return c.json({ ok: true, chunks: count, source: f.name });
});

app.post("/chat", authenticate, validateJson(askSchema), async (c) => {
  const user = c.get("user");
  const { question } = c.get("validatedBody") as z.infer<typeof askSchema>;
  try {
    const answer = await chatWithRag(question);
    await prisma.chatMessage.createMany({
      data: [
        { role: "user", content: question, userId: user.id },
        { role: "assistant", content: answer, userId: user.id },
      ],
    });
    const chunks = await prisma.chunk.count();
    return c.json({ answer, chunks });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "RAG failed" }, 503);
  }
});

app.get("/chat", authenticate, async (c) => {
  const chunks = await prisma.chunk.count();
  return c.json({ chunks });
});

app.get("/admin/documents", authenticate, requireRole(Role.ADMIN), async (c) => {
  const docs = await prisma.document.findMany({ include: { _count: { select: { chunks: true } } } });
  return c.json({ documents: docs });
});

export default app;
