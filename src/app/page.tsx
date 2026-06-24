"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TOKEN_KEY = "rag_token";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const uploadSchema = z.object({ file: z.any().refine((f) => f instanceof FileList && f.length > 0, "File required") });
const askSchema = z.object({ question: z.string().min(3, "Enter a question") });

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [chunks, setChunks] = useState(0);

  const authForm = useForm<z.infer<typeof authSchema>>({ resolver: zodResolver(authSchema), defaultValues: { email: "", password: "" } });
  const uploadForm = useForm<{ file: FileList }>({ resolver: zodResolver(uploadSchema) });
  const askForm = useForm<{ question: string }>({ resolver: zodResolver(askSchema), defaultValues: { question: "" } });

  useEffect(() => {
    setAuthed(!!localStorage.getItem(TOKEN_KEY));
  }, []);

  async function onAuth(values: z.infer<typeof authSchema>) {
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error ?? "Auth failed");
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuthed(true);
    setStatus("");
  }

  async function onUpload(values: { file: FileList }) {
    setStatus("Indexing…");
    const fd = new FormData();
    fd.append("file", values.file[0]);
    const res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: fd });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error);
    setChunks((c) => c + data.chunks);
    setStatus(`Indexed ${data.chunks} chunks from ${data.source}`);
  }

  async function onAsk(values: { question: string }) {
    setStatus("Thinking…");
    setAnswer("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ question: values.question }),
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error);
    setAnswer(data.answer);
    setChunks(data.chunks);
    setStatus("Done");
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-md space-y-4 p-8">
        <h1 className="text-2xl font-bold text-primary">RAG Document Chatbot</h1>
        <form onSubmit={authForm.handleSubmit(onAuth)} className="space-y-3 rounded-xl border border-border bg-card p-6">
          <input {...authForm.register("email")} type="email" placeholder="Email" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input {...authForm.register("password")} type="password" placeholder="Password (min 8)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{mode === "login" ? "Login" : "Register"}</button>
          <button type="button" className="text-xs text-muted-foreground" onClick={() => setMode(mode === "login" ? "register" : "login")}>Switch to {mode === "login" ? "register" : "login"}</button>
        </form>
        {status && <p className="text-sm text-destructive">{status}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 p-8 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">RAG Document Chatbot</h1>
          <button type="button" className="text-xs text-muted-foreground" onClick={() => { localStorage.removeItem(TOKEN_KEY); setAuthed(false); }}>Logout</button>
        </div>
        <p className="text-sm text-muted-foreground">Hono API · JWT · RBAC · Prisma · PostgreSQL</p>
        <form onSubmit={uploadForm.handleSubmit(onUpload)} className="space-y-3">
          <label className="text-sm font-medium">Upload PDF / TXT</label>
          <input type="file" accept=".pdf,.txt,.md" {...uploadForm.register("file")} className="block w-full text-sm" />
          <button type="submit" className={cn("rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground")}>Upload & Index</button>
        </form>
        <p className="text-xs text-muted-foreground">Chunks indexed: {chunks}</p>
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow">
        <form onSubmit={askForm.handleSubmit(onAsk)} className="space-y-3">
          <label className="text-sm font-medium">Question</label>
          <textarea {...askForm.register("question")} rows={4} className="w-full rounded-md border border-input bg-background p-3 text-sm" placeholder="Ask about your documents…" />
          {askForm.formState.errors.question && <p className="text-sm text-destructive">{askForm.formState.errors.question.message}</p>}
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Ask</button>
        </form>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
        {answer && <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">{answer}</div>}
      </section>
    </main>
  );
}
