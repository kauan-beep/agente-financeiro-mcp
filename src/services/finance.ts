// Camada de serviços financeiros (dados locais fictícios, inspirados na Plaid Sandbox).
// Substitua esta implementação por um cliente real (ex.: servidor MCP) mantendo a interface.

export type AccountType = "depository" | "credit";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  subtype: string;
  current: number; // saldo (depósito) ou dívida (crédito)
  available: number | null;
  currency: "USD";
}

export interface Transaction {
  id: string;
  date: string; // ISO
  name: string;
  accountId: string;
  amount: number; // positivo = saída, negativo = entrada
  category: string | null;
  pending: boolean;
}

export interface FinanceService {
  referenceDate(): string;
  getAccounts(): Promise<Account[]>;
  getTransactions(): Promise<Transaction[]>;
}

const ACCOUNTS: Account[] = [
  { id: "chk", name: "Plaid Checking", type: "depository", subtype: "Conta corrente", current: 110, available: 100, currency: "USD" },
  { id: "sav", name: "Plaid Saving", type: "depository", subtype: "Poupança", current: 210, available: 200, currency: "USD" },
  { id: "cc", name: "Plaid Credit Card", type: "credit", subtype: "Cartão de crédito", current: 410, available: null, currency: "USD" },
  { id: "bcc", name: "Plaid Business Credit Card", type: "credit", subtype: "Cartão empresarial", current: 5020, available: 4980, currency: "USD" },
];

const TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "2026-09-24", name: "Uber 072515 SF**POOL**", accountId: "chk", amount: 6.33, category: "Transporte", pending: false },
  { id: "t2", date: "2026-09-21", name: "Tectra Inc", accountId: "cc", amount: 500, category: null, pending: false },
  { id: "t3", date: "2026-09-20", name: "AUTOMATIC PAYMENT - THANK", accountId: "cc", amount: 2078.5, category: "Pagamento de dívida", pending: false },
  { id: "t4", date: "2026-09-20", name: "KFC", accountId: "cc", amount: 500, category: "Alimentação", pending: false },
  { id: "t5", date: "2026-09-20", name: "Madison Bicycle Shop", accountId: "cc", amount: 500, category: null, pending: false },
  { id: "t6", date: "2026-09-15", name: "Starbucks", accountId: "chk", amount: 4.33, category: "Alimentação", pending: false },
  { id: "t7", date: "2026-09-12", name: "United Airlines (reembolso)", accountId: "chk", amount: -500, category: "Viagem", pending: false },
  { id: "t8", date: "2026-09-10", name: "McDonald's", accountId: "chk", amount: 12, category: "Alimentação", pending: false },
  { id: "t9", date: "2026-09-05", name: "INTRST PYMNT", accountId: "sav", amount: -4.22, category: "Rendimentos", pending: false },
];

export const localFinanceService: FinanceService = {
  referenceDate: () => "2026-09-25",
  getAccounts: async () => ACCOUNTS.map((a) => ({ ...a })),
  getTransactions: async () => TRANSACTIONS.map((t) => ({ ...t })),
};

export const NOT_INFORMED = "Não informado";

export function formatUSD(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_INFORMED;
  const s = Math.abs(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : ""}US$ ${s}`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
