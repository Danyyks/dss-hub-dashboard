export type StatusCliente = "ativo" | "pausado" | "encerrado";

export type FormaPagamento =
  | "pix"
  | "boleto"
  | "cartao"
  | "transferencia"
  | "dinheiro"
  | "outro";

/** Um link do projeto do cliente, com descrição e comentário próprios. */
export interface LinkProjeto {
  id: string;
  descricao: string; // ex.: "Deploy Vercel", "Repositório", "Design"
  url: string;
  comentario: string; // observação sobre este link
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  formaPagamento: FormaPagamento;
  diaVencimento: number; // 1..31
  valorMensalidade: number; // em reais
  status: StatusCliente;
  observacoes: string;
  links: LinkProjeto[];
  criadoEm: number; // timestamp
}

export type TipoLancamento = "recorrente" | "avulso";

export interface Lancamento {
  id: string;
  clienteId: string | null;
  tipo: TipoLancamento;
  valor: number;
  data: number; // timestamp da entrada
  descricao: string;
  criadoEm: number;
}

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: "Pix",
  boleto: "Boleto",
  cartao: "Cartão",
  transferencia: "Transferência",
  dinheiro: "Dinheiro",
  outro: "Outro",
};

export const STATUS_CLIENTE_LABEL: Record<StatusCliente, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  encerrado: "Encerrado",
};
