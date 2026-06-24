import { prisma } from "@/db";

const OLLAMA = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const EMBED_MODEL = process.env.EMBED_MODEL || "nomic-embed-text";
const CHAT_MODEL = process.env.CHAT_MODEL || "llama3.2";

export function chunkText(text: string, size = 500, overlap = 80): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    const piece = text.slice(i, i + size).trim();
    if (piece) chunks.push(piece);
  }
  return chunks;
}

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text }),
  });
  if (!res.ok) throw new Error("Embedding failed — run: ollama pull nomic-embed-text");
  const data = await res.json();
  return data.embedding as number[];
}

function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

export async function retrieve(query: string, k = 4): Promise<string[]> {
  const qEmb = await embed(query);
  const chunks = await prisma.chunk.findMany({ take: 500, orderBy: { createdAt: "desc" } });
  return chunks
    .map((c) => ({ text: c.content, score: cosine(qEmb, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.text);
}

export async function chatWithRag(question: string): Promise<string> {
  const context = (await retrieve(question)).join("\n\n");
  const prompt = context
    ? `Answer using context. If unknown, say so.\n\nContext:\n${context}\n\nQuestion: ${question}`
    : question;

  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error("Ollama chat failed");
  const data = await res.json();
  return data.message?.content ?? "No response";
}

export { CHAT_MODEL, EMBED_MODEL, OLLAMA };
