// Assistente simulado (respostas por regras, sem IA real). Pode ser trocado por um agente com MCP.
import { formatDate, formatUSD, NOT_INFORMED, type FinanceService, type Transaction } from "./finance";

export type Block =
  | { kind: "text"; text: string }
  | { kind: "cards"; cards: { title: string; subtitle: string; rows: [string, string][] }[] }
  | { kind: "table"; headers: string[]; rows: string[][]; mobileHeaders?: string[]; mobileRows?: string[][] }
  | { kind: "note"; text: string };

export const SUGGESTIONS = [
  "Mostrar minhas contas",
  "Consultar meus saldos",
  "Ver minhas últimas transações",
  "Quanto gastei com alimentação?",
  "Resumir minhas movimentações",
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function period(txs: Transaction[]): string {
  if (!txs.length) return "nenhum registro";
  const dates = txs.map((t) => t.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) return "nenhum registro";
  return `${formatDate(first)} a ${formatDate(last)}`;
}

function meta(listed: Transaction[], analyzed: Transaction[], category?: string): Block {
  return { kind: "note", text: `${listed.length} transações${category ? ` de ${category}` : ""} de um total de ${analyzed.length} analisadas, ${analyzed.length ? `de ${period(analyzed)}` : "sem período disponível"}` };
}

export async function answer(question: string, svc: FinanceService): Promise<Block[]> {
  const q = norm(question);
  const ref = formatDate(svc.referenceDate());

  if (/(pag(ar|amento)|transfer|pix|enviar dinheiro|boleto|depositar)/.test(q) && !/pagamento de divida/.test(q)) {
    return [{ kind: "text", text: "Esta demonstração é somente leitura: não faço pagamentos, transferências ou qualquer operação. Posso ajudar consultando contas, saldos e transações." }];
  }

  const accounts = await svc.getAccounts();
  const txs = (await svc.getTransactions()).sort((a, b) => b.date.localeCompare(a.date));
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? NOT_INFORMED;
  const transactionHeaders = ["Data", "Descrição", "Conta", "Categoria", "Valor", "Status"];
  const transactionRows = (listed: Transaction[]) => listed.map((t) => [formatDate(t.date), t.name, accName(t.accountId), t.category ?? NOT_INFORMED, formatUSD(t.amount), t.pending ? "Pendente" : "Confirmada"]);

  if (/(conta|saldo|disponivel)/.test(q)) {
    const isSaldo = /saldo|disponivel/.test(q);
    const deposit = accounts.filter((a) => a.type === "depository");
    const totalAvail = deposit.reduce((s, a) => s + (a.available ?? 0), 0);
    return [
      { kind: "text", text: isSaldo ? `Seus saldos em ${ref}:` : `Você tem ${accounts.length} contas nesta demonstração:` },
      {
        kind: "cards",
        cards: accounts.map((a) => ({
          title: a.name,
          subtitle: a.subtype,
          rows: a.type === "credit"
            ? [["Saldo devedor", formatUSD(a.current)], ["Crédito disponível", formatUSD(a.available)]]
            : [["Saldo atual", formatUSD(a.current)], ["Disponível", formatUSD(a.available)]],
        })),
      },
      { kind: "text", text: `Dinheiro disponível nas contas de depósito: ${formatUSD(totalAvail)}. Saldo devedor de cartão não é dinheiro disponível.` },
      meta(txs, txs),
    ];
  }

  if (/aliment|comida|restaurante|lanche/.test(q)) {
    const food = txs.filter((t) => t.category === "Alimentação" && t.amount > 0);
    const total = food.reduce((s, t) => s + t.amount, 0);
    return [
      { kind: "text", text: `Você gastou ${formatUSD(total)} com alimentação.` },
      { kind: "table", headers: ["Data", "Descrição", "Conta", "Valor"], rows: food.map((t) => [formatDate(t.date), t.name, accName(t.accountId), formatUSD(t.amount)]), mobileHeaders: transactionHeaders, mobileRows: transactionRows(food) },
      meta(food, txs, "alimentação"),
    ];
  }

  if (/transac|extrato|ultimas|movimenta(c|)o(es)? recentes/.test(q)) {
    const last = txs.slice(0, 5);
    return [
      { kind: "text", text: "Suas últimas transações (valor positivo = saída, negativo = entrada):" },
      {
        kind: "table",
        headers: transactionHeaders,
        rows: transactionRows(last),
      },
      { kind: "text", text: `Total das transações listadas: ${formatUSD(last.reduce((sum, t) => sum + t.amount, 0))}.` },
      meta(last, txs),
    ];
  }

  if (/resum|moviment|gast|categoria/.test(q)) {
    const out = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const inn = txs.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
    const byCat = new Map<string, number>();
    txs.filter((t) => t.amount > 0).forEach((t) => {
      const c = t.category ?? NOT_INFORMED;
      byCat.set(c, (byCat.get(c) ?? 0) + t.amount);
    });
    return [
      {
        kind: "cards",
        cards: [{ title: "Resumo", subtitle: "Movimentações", rows: [["Saídas", formatUSD(out)], ["Entradas", formatUSD(inn)]] }],
      },
      { kind: "table", headers: ["Categoria (saídas)", "Total"], rows: [...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([c, v]) => [c, formatUSD(v)]) },
      { kind: "text", text: "Pagamentos de dívida aparecem como saída, mas quitam a fatura do cartão." },
      meta(txs, txs),
    ];
  }

  return [
    { kind: "text", text: "Não consigo responder isso com os dados desta demonstração. Tenho apenas contas, saldos e transações fictícias. Experimente perguntar:" },
    { kind: "text", text: SUGGESTIONS.map((s) => `• ${s}`).join("\n") },
  ];
}
