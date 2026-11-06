import { describe, it, expect } from "vitest";
import { answer } from "@/services/assistant";
import { formatUSD, localFinanceService } from "@/services/finance";

const text = async (q: string) => JSON.stringify(await answer(q, localFinanceService));

describe("Kau", () => {
  it("formata USD em pt-BR", () => {
    expect(formatUSD(5020)).toBe("US$ 5.020,00");
    expect(formatUSD(null)).toBe("Não informado");
  });
  it("disponível ausente vira Não informado", async () => {
    expect(await text("Mostrar minhas contas")).toContain("Não informado");
  });
  it("disponível não soma dívida", async () => {
    expect(await text("Consultar meus saldos")).toContain("disponível nas contas de depósito: US$ 300,00");
  });
  it("soma alimentação só com saídas", async () => {
    expect(await text("Quanto gastei com alimentação?")).toContain("US$ 516,33");
  });
  it("recusa transferências", async () => {
    expect(await text("faça uma transferência")).toContain("somente leitura");
  });
  it("reports three food transactions out of nine over the analyzed period", async () => {
    const blocks = await answer("Quanto gastei com alimentação?", localFinanceService);
    expect(blocks.find((b) => b.kind === "note")).toEqual({ kind: "note", text: "3 transações de alimentação de um total de 9 analisadas, de 05/09/2026 a 24/09/2026" });
  });
  it("provides all six transaction fields for mobile food cards", async () => {
    const blocks = await answer("Quanto gastei com alimentação?", localFinanceService);
    const table = blocks.find((b) => b.kind === "table");
    if (!table || table.kind !== "table") throw new Error("Missing food table");
    expect(table.mobileHeaders).toEqual(["Data", "Descrição", "Conta", "Categoria", "Valor", "Status"]);
    expect(table.mobileRows).toHaveLength(3);
    expect(table.mobileRows?.[0]).toEqual(["20/09/2026", "KFC", "Plaid Credit Card", "Alimentação", "US$ 500,00", "Confirmada"]);
  });
  it("food total equals the sum of exactly the listed transactions", async () => {
    const blocks = await answer("Quanto gastei com alimentação?", localFinanceService);
    const table = blocks.find((b) => b.kind === "table");
    if (!table || table.kind !== "table") throw new Error("Missing food table");
    expect(table.rows.map((r) => r[3])).toEqual(["US$ 500,00", "US$ 4,33", "US$ 12,00"]);
    expect(blocks[0]).toEqual({ kind: "text", text: `Você gastou ${formatUSD(500 + 4.33 + 12)} com alimentação.` });
  });
  it("latest total counts only the five listed rows, not all nine", async () => {
    const blocks = await answer("Ver minhas últimas transações", localFinanceService);
    const table = blocks.find((b) => b.kind === "table");
    if (!table || table.kind !== "table") throw new Error("Missing transaction table");
    expect(table.rows).toHaveLength(5);
    expect(blocks).toContainEqual({ kind: "text", text: `Total das transações listadas: ${formatUSD(6.33 + 500 + 2078.5 + 500 + 500)}.` });
    expect(blocks).toContainEqual({ kind: "note", text: "5 transações de um total de 9 analisadas, de 05/09/2026 a 24/09/2026" });
  });
});
