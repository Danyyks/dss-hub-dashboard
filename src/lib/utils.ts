import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
}

export function formatData(ts: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(ts));
}

export function formatMesAno(ts: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(ts));
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

/** Iniciais para avatar (ex.: "Ana Paula" -> "AP"). */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

/**
 * Classifica o vencimento de um cliente com base no dia do mês.
 * Retorna quantos dias faltam (negativo = atrasado).
 */
export function diasParaVencimento(diaVencimento: number, hoje = new Date()): number {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  const dia = Math.min(diaVencimento, ultimoDia);
  const venc = new Date(ano, mes, dia);
  const diff = Math.round(
    (venc.getTime() - new Date(ano, mes, hoje.getDate()).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return diff;
}

export type SituacaoVencimento = "atrasado" | "hoje" | "proximo" | "em-dia";

export function situacaoVencimento(diaVencimento: number): SituacaoVencimento {
  const d = diasParaVencimento(diaVencimento);
  if (d < 0) return "atrasado";
  if (d === 0) return "hoje";
  if (d <= 5) return "proximo";
  return "em-dia";
}

type LancamentoMin = { clienteId: string | null; data: number };

/** Verifica se o cliente tem algum lançamento (pagamento) no mês de referência. */
export function pagouNoMes(
  clienteId: string,
  lancamentos: LancamentoMin[],
  hoje = new Date(),
): boolean {
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getTime();
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1).getTime();
  return lancamentos.some(
    (l) => l.clienteId === clienteId && l.data >= inicio && l.data < fim,
  );
}

export type SituacaoPagamento = "pago" | SituacaoVencimento;

/**
 * Situação de cobrança do cliente: "pago" quando já há lançamento dele no mês
 * atual; caso contrário, classifica pelo dia de vencimento.
 */
export function situacaoPagamento(
  cliente: { id: string; diaVencimento: number },
  lancamentos: LancamentoMin[],
): SituacaoPagamento {
  if (pagouNoMes(cliente.id, lancamentos)) return "pago";
  return situacaoVencimento(cliente.diaVencimento);
}
