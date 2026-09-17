import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Link2,
  ExternalLink,
  MessageSquare,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Modal,
  Badge,
  EmptyState,
} from "@/components/ui";
import { clientesRepo, useClientes } from "@/hooks/useColecoes";
import {
  type Cliente,
  type FormaPagamento,
  type StatusCliente,
  type LinkProjeto,
  FORMA_PAGAMENTO_LABEL,
  STATUS_CLIENTE_LABEL,
} from "@/types";
import { formatBRL, iniciais, situacaoVencimento, uid } from "@/lib/utils";

type Form = Omit<Cliente, "id" | "criadoEm">;

const formVazio: Form = {
  nome: "",
  telefone: "",
  email: "",
  formaPagamento: "pix",
  diaVencimento: 5,
  valorMensalidade: 0,
  status: "ativo",
  observacoes: "",
  links: [],
};

const corStatus: Record<StatusCliente, "verde" | "amarelo" | "cinza"> = {
  ativo: "verde",
  pausado: "amarelo",
  encerrado: "cinza",
};

function linkVazio(): LinkProjeto {
  return { id: uid(), descricao: "", url: "", comentario: "" };
}

export function Clientes() {
  const { clientes, carregando } = useClientes();
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Form>(formVazio);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telefone.includes(q),
    );
  }, [clientes, busca]);

  function abrirNovo() {
    setEditando(null);
    setForm({ ...formVazio, links: [] });
    setModalAberto(true);
  }

  function abrirEdicao(c: Cliente) {
    setEditando(c);
    const { id: _id, criadoEm: _criadoEm, ...resto } = c;
    void _id;
    void _criadoEm;
    setForm({ ...resto, links: resto.links ?? [] });
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.nome.trim()) return;
    // remove links totalmente vazios
    const links = form.links.filter((l) => l.url.trim() || l.descricao.trim());
    const dados = { ...form, links };
    if (editando) {
      await clientesRepo.update(editando.id, dados);
    } else {
      await clientesRepo.add(dados);
    }
    setModalAberto(false);
  }

  async function excluir(c: Cliente) {
    if (confirm(`Excluir o cliente "${c.nome}"? Esta ação não pode ser desfeita.`)) {
      await clientesRepo.remove(c.id);
    }
  }

  // ---- edição de links dentro do form ----
  function addLink() {
    setForm((f) => ({ ...f, links: [...f.links, linkVazio()] }));
  }
  function updateLink(id: string, patch: Partial<LinkProjeto>) {
    setForm((f) => ({
      ...f,
      links: f.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }
  function removeLink(id: string) {
    setForm((f) => ({ ...f, links: f.links.filter((l) => l.id !== id) }));
  }

  return (
    <div className="animate-in">
      <PageHeader
        titulo="Clientes"
        descricao={`${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"} cadastrados`}
        acao={
          <Button onClick={abrirNovo}>
            <Plus className="h-4 w-4" /> Novo cliente
          </Button>
        }
      />

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Buscar por nome, e-mail ou telefone…"
          className="pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {carregando ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : filtrados.length === 0 ? (
        <EmptyState
          icone={<Users className="h-6 w-6" />}
          titulo={busca ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          descricao={
            busca
              ? "Tente outro termo de busca."
              : "Use o botão Novo cliente, no topo, para cadastrar o primeiro cliente da DSS Hub."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((c) => {
            const sit = situacaoVencimento(c.diaVencimento);
            const links = c.links ?? [];
            return (
              <Card key={c.id} className="group flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary">
                    {iniciais(c.nome)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-text">{c.nome}</h3>
                      <Badge cor={corStatus[c.status]}>{STATUS_CLIENTE_LABEL[c.status]}</Badge>
                    </div>
                    <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted">
                      {c.telefone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" /> {c.telefone}
                        </span>
                      )}
                      {c.email && (
                        <span className="flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3" /> {c.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-lg font-semibold text-text">
                      {formatBRL(c.valorMensalidade)}
                    </p>
                    <p className="text-[11px] text-muted">
                      vence dia {c.diaVencimento} · {FORMA_PAGAMENTO_LABEL[c.formaPagamento]}
                    </p>
                  </div>
                  {c.status === "ativo" && (
                    <Badge
                      cor={
                        sit === "atrasado"
                          ? "vermelho"
                          : sit === "hoje" || sit === "proximo"
                            ? "amarelo"
                            : "verde"
                      }
                    >
                      {sit === "atrasado"
                        ? "Atrasado"
                        : sit === "hoje"
                          ? "Vence hoje"
                          : sit === "proximo"
                            ? "A vencer"
                            : "Em dia"}
                    </Badge>
                  )}
                </div>

                {links.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-border pt-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                      <Link2 className="h-3 w-3" /> Links do projeto
                    </p>
                    {links.map((l) => (
                      <div key={l.id} className="rounded-lg bg-surface-2 px-3 py-2">
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{l.descricao || l.url}</span>
                        </a>
                        {l.comentario && (
                          <p className="mt-1 flex items-start gap-1.5 text-[11px] text-muted">
                            <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                            <span>{l.comentario}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {c.observacoes && (
                  <p className="line-clamp-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
                    {c.observacoes}
                  </p>
                )}

                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variante="secondary" tamanho="sm" className="flex-1" onClick={() => abrirEdicao(c)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button variante="ghost" tamanho="sm" onClick={() => void excluir(c)}>
                    <Trash2 className="h-3.5 w-3.5 text-danger" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo={editando ? "Editar cliente" : "Novo cliente"}
      >
        <div className="flex flex-col gap-4">
          <Field label="Nome *">
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do cliente ou empresa"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefone">
              <Input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="cliente@email.com"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mensalidade (R$)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.valorMensalidade || ""}
                onChange={(e) =>
                  setForm({ ...form, valorMensalidade: Number(e.target.value) })
                }
                placeholder="0,00"
              />
            </Field>
            <Field label="Dia de vencimento">
              <Input
                type="number"
                min={1}
                max={31}
                value={form.diaVencimento}
                onChange={(e) =>
                  setForm({ ...form, diaVencimento: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Forma de pagamento">
              <Select
                value={form.formaPagamento}
                onChange={(e) =>
                  setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })
                }
              >
                {Object.entries(FORMA_PAGAMENTO_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as StatusCliente })
                }
              >
                {Object.entries(STATUS_CLIENTE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* ---- Links do projeto ---- */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2/50 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-medium text-text">
                <Link2 className="h-4 w-4" /> Links do projeto
              </span>
              <Button variante="secondary" tamanho="sm" onClick={addLink}>
                <Plus className="h-3.5 w-3.5" /> Adicionar link
              </Button>
            </div>

            {form.links.length === 0 && (
              <p className="text-xs text-muted">
                Nenhum link ainda. Adicione o link do deploy (Vercel), repositório, design…
              </p>
            )}

            {form.links.map((l, i) => (
              <div key={l.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted">Link {i + 1}</span>
                  <button
                    onClick={() => removeLink(l.id)}
                    aria-label="Remover link"
                    className="text-muted hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  value={l.descricao}
                  onChange={(e) => updateLink(l.id, { descricao: e.target.value })}
                  placeholder="Descrição (ex.: Deploy Vercel, Repositório…)"
                />
                <Input
                  value={l.url}
                  onChange={(e) => updateLink(l.id, { url: e.target.value })}
                  placeholder="https://…"
                />
                <Textarea
                  className="min-h-16"
                  value={l.comentario}
                  onChange={(e) => updateLink(l.id, { comentario: e.target.value })}
                  placeholder="Comentário sobre este link…"
                />
              </div>
            ))}
          </div>

          <Field label="Observações" hint="Anotações internas (acessos, combinados, etc.)">
            <Textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              placeholder="Ex.: acesso ao painel, senhas, detalhes do contrato…"
            />
          </Field>

          <div className="mt-2 flex gap-3">
            <Button variante="secondary" className="flex-1" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={() => void salvar()} disabled={!form.nome.trim()}>
              {editando ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
