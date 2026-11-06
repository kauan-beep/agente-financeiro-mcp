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
});
