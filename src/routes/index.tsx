import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { answer, SUGGESTIONS, type Block } from "@/services/assistant";
import { localFinanceService } from "@/services/finance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banco Kauan · Chat com o Kau" },
      { name: "description", content: "Demonstração educacional de chat financeiro com dados fictícios." },
      { property: "og:title", content: "Banco Kauan · Chat com o Kau" },
      { property: "og:description", content: "Demonstração educacional de IA e APIs financeiras com dados fictícios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chat,
});

type Msg = { id: string; role: "user" | "kau"; blocks: Block[]; error?: boolean };
const KEY = "banco-kauan-chat";
const GREETING: Msg = { id: "hi", role: "kau", blocks: [{ kind: "text", text: "Olá! Sou o Kau. O que você quer entender sobre suas finanças?" }] };

function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (Array.isArray(saved) && saved.length) setMsgs(saved);
    } catch { /* ignora histórico corrompido */ }
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(msgs));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    setInput("");
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", blocks: [{ kind: "text", text }] }]);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const blocks = await answer(text, localFinanceService);
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "kau", blocks }]);
    } catch {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "kau", error: true, blocks: [{ kind: "text", text: "Não consegui ler os dados fictícios agora. Tente novamente em instantes." }] }]);
    } finally {
      setLoading(false);
      taRef.current?.focus();
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-primary-foreground font-bold text-primary">K</div>
            <div>
              <h1 className="font-semibold leading-tight">Banco Kauan</h1>
              <p className="text-xs opacity-80">Kau · assistente simulado</p>
            </div>
          </div>
          <button
            onClick={() => { setMsgs([GREETING]); taRef.current?.focus(); }}
            className="rounded-full border border-primary-foreground/40 px-3 py-1.5 text-sm hover:bg-primary-foreground/10"
          >
            Nova conversa
          </button>
        </div>
        <div className="bg-accent py-1.5 text-center text-xs font-medium text-accent-foreground">
          Demonstração · Dados fictícios · Não é o Open Finance real
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-5">
          {msgs.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex"}>
              <div className={m.role === "user"
                ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground"
                : `w-full max-w-full space-y-3 rounded-2xl rounded-bl-sm border bg-card px-4 py-3 ${m.error ? "border-destructive text-destructive" : ""}`}>
                {m.blocks.map((b, i) => <BlockView key={i} b={b} />)}
              </div>
            </div>
          ))}
          {msgs.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-primary/30 bg-card px-3 py-1.5 text-sm text-primary hover:bg-secondary">{s}</button>
              ))}
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
              Kau está analisando…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <footer className="border-t bg-card">
        <form className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <textarea
            ref={taRef}
            autoFocus
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Pergunte ao Kau…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="submit" disabled={!input.trim() || loading} className="h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground disabled:opacity-40">
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}

function BlockView({ b }: { b: Block }) {
  if (b.kind === "text") return <p className="whitespace-pre-wrap">{b.text}</p>;
  if (b.kind === "note") return <p className="text-xs text-muted-foreground">{b.text}</p>;
  if (b.kind === "cards")
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {b.cards.map((c) => (
          <div key={c.title} className="rounded-xl bg-secondary p-3">
            <p className="font-semibold text-primary">{c.title}</p>
            <p className="mb-2 text-xs text-muted-foreground">{c.subtitle}</p>
            {c.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-medium tabular-nums">{v}</span></div>
            ))}
          </div>
        ))}
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left">
          <tr>{b.headers.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {b.rows.map((r, i) => (
            <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="whitespace-nowrap px-3 py-2 tabular-nums">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
