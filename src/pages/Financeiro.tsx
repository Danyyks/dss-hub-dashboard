import { useMemo, useState } from "react";
import {
  Plus,
  Wallet,
  TrendingUp,
  Repeat,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
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
import {
  lancamentosRepo,
  useLancamentos,
  useClientes,
} from "@/hooks/useColecoes";
import { type Lancamento, type TipoLancamento } from "@/types";
import { formatBRL, formatData } from "@/lib/utils";

type Form = {
  clienteId: string;
  tipo: TipoLancamento;
  valor: number;
  data: string; // yyyy-mm-dd
  descricao: string;
};

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

const formVazio: Form = {
  clienteId: "",
  tipo: "recorrente",
  valor: 0,
  data: hojeISO(),
  descricao: "",
};

export function Financeiro() {
  const { lancamentos, carregando } = useLancamentos();
  const { clientes } = useClientes();
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState<Form>(formVazio);

  const mapaCliente = useMemo(
    () => new Map(clientes.map((c) => [c.id, c.nome])),
    [clientes],
  );

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).getTime();

  const caixaMes = useMemo(
    () =>
      lancamentos
        .filter((l) => l.data >= inicioMes)
        .reduce((s, l) => s + l.valor, 0),
    [lancamentos, inicioMes],
  );

  const totalAno = useMemo(() => {
    const inicioAno = new Date(agora.getFullYear(), 0, 1).getTime();
    return lancamentos
      .filter((l) => l.data >= inicioAno)
      .reduce((s, l) => s + l.valor, 0);
  }, [lancamentos, agora]);

  const mrr = useMemo(
    () =>
      clientes
        .filter((c) => c.status === "ativo")
        .reduce((s, c) => s + c.valorMensalidade, 0),
    [clientes],
  );

  // Últimos 6 meses para o gráfico
  const dadosGrafico = useMemo(() => {
    const meses: { mes: string; valor: number; chave: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const ini = d.getTime();
      const fim = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      const valor = lancamentos
        .filter((l) => l.data >= ini && l.data < fim)
        .reduce((s, l) => s + l.valor, 0);
      meses.push({
        mes: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        valor,
        chave: ini,
      });
    }
    return meses;
  }, [lancamentos, agora]);

  async function salvar() {
    if (!form.valor) return;
    await lancamentosRepo.add({
      clienteId: form.clienteId || null,
      tipo: form.tipo,
      valor: form.valor,
      data: new Date(form.data + "T12:00:00").getTime(),
      descricao: form.descricao,
    });
    setForm(formVazio);
    setModalAberto(false);
  }

  async function excluir(l: Lancamento) {
    if (confirm("Excluir este lançamento?")) await lancamentosRepo.remove(l.id);
  }

  return (
    <div className="animate-in">
      <PageHeader
        titulo="Financeiro"
        descricao="Balanço de caixa e receita recorrente"
        acao={
          <Button onClick={() => setModalAberto(true)}>
            <Plus className="h-4 w-4" /> Registrar entrada
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metrica
          icone={<Wallet className="h-5 w-5" />}
          rotulo="Caixa do mês"
          valor={formatBRL(caixaMes)}
          cor="text-success"
        />
        <Metrica
          icone={<Repeat className="h-5 w-5" />}
          rotulo="Receita recorrente (MRR)"
          valor={formatBRL(mrr)}
          cor="text-primary"
        />
        <Metrica
          icone={<TrendingUp className="h-5 w-5" />}
          rotulo="Total no ano"
          valor={formatBRL(totalAno)}
          cor="text-text"
        />
      </div>

      <Card className="mb-5">
        <p className="mb-4 text-sm font-semibold text-text">Entradas dos últimos 6 meses</p>
        <div className="h-48 min-w-0">
          {dadosGrafico.every((d) => d.valor === 0) ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm text-muted">Sem entradas ainda</p>
              <p className="text-xs text-muted">
                Os valores registrados aparecerão aqui, mês a mês.
              </p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico}>
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgb(var(--muted))", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "rgb(var(--surface-2))" }}
                contentStyle={{
                  background: "rgb(var(--surface))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: 12,
                  color: "rgb(var(--text))",
                }}
                formatter={(v: number) => [formatBRL(v), "Entradas"]}
              />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} maxBarSize={48}>
                {dadosGrafico.map((_, i) => (
                  <Cell
                    key={i}
                    fill="rgb(var(--primary))"
                    fillOpacity={i === dadosGrafico.length - 1 ? 1 : 0.28}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-text">Lançamentos</h2>
      {carregando ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : lancamentos.length === 0 ? (
        <EmptyState
          icone={<Wallet className="h-6 w-6" />}
          titulo="Nenhuma entrada registrada"
          descricao="Use o botão Registrar entrada, no topo, para lançar os pagamentos recebidos."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {lancamentos.map((l) => (
            <div
              key={l.id}
              className="group flex items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-surface-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15 text-success">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 truncate text-sm font-medium text-text">
                    {l.descricao || (l.clienteId ? mapaCliente.get(l.clienteId) : "Entrada avulsa")}
                  </span>
                  <span className="shrink-0">
                    <Badge cor={l.tipo === "recorrente" ? "azul" : "cinza"}>
                      {l.tipo === "recorrente" ? "Recorrente" : "Avulso"}
                    </Badge>
                  </span>
                </div>
                <span className="block truncate text-xs text-muted">
                  {formatData(l.data)}
                  {l.clienteId && mapaCliente.get(l.clienteId)
                    ? ` · ${mapaCliente.get(l.clienteId)}`
                    : ""}
                </span>
              </div>
              <span className="tabular shrink-0 font-bold text-success">{formatBRL(l.valor)}</span>
              <button
                onClick={() => void excluir(l)}
                aria-label="Excluir lançamento"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-all hover:bg-danger/10 hover:text-danger md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal aberto={modalAberto} aoFechar={() => setModalAberto(false)} titulo="Registrar entrada">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor (R$) *">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.valor || ""}
                onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
                placeholder="0,00"
                autoFocus
              />
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo">
              <Select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLancamento })}
              >
                <option value="recorrente">Recorrente</option>
                <option value="avulso">Avulso</option>
              </Select>
            </Field>
            <Field label="Cliente">
              <Select
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
              >
                <option value="">— sem cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex.: mensalidade de setembro, projeto X…"
            />
          </Field>

          <div className="mt-2 flex gap-3">
            <Button variante="secondary" className="flex-1" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={() => void salvar()} disabled={!form.valor}>
              Registrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Metrica({
  icone,
  rotulo,
  valor,
  cor,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-muted">
        {icone}
      </div>
      <div>
        <p className="text-xs font-medium text-muted">{rotulo}</p>
        <p className={"tabular mt-0.5 text-2xl font-extrabold tracking-tight " + cor}>{valor}</p>
      </div>
    </Card>
  );
}
