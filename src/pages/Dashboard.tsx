import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Repeat,
  Users,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, Badge, EmptyState } from "@/components/ui";
import { useClientes, useLancamentos } from "@/hooks/useColecoes";
import { useAuth } from "@/context/AuthContext";
import {
  formatBRL,
  situacaoVencimento,
  diasParaVencimento,
  pagouNoMes,
  iniciais,
} from "@/lib/utils";

export function Dashboard() {
  const { usuario } = useAuth();
  const { clientes } = useClientes();
  const { lancamentos } = useLancamentos();

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).getTime();

  const caixaMes = useMemo(
    () => lancamentos.filter((l) => l.data >= inicioMes).reduce((s, l) => s + l.valor, 0),
    [lancamentos, inicioMes],
  );

  const ativos = clientes.filter((c) => c.status === "ativo");
  const mrr = ativos.reduce((s, c) => s + c.valorMensalidade, 0);

  const vencimentos = useMemo(() => {
    return ativos
      .filter((c) => !pagouNoMes(c.id, lancamentos))
      .map((c) => ({ cliente: c, dias: diasParaVencimento(c.diaVencimento), sit: situacaoVencimento(c.diaVencimento) }))
      .filter((v) => v.sit !== "em-dia")
      .sort((a, b) => a.dias - b.dias)
      .slice(0, 6);
  }, [ativos, lancamentos]);

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "";
  const hora = agora.getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="animate-in">
      <PageHeader
        titulo={`${saudacao}${primeiroNome ? ", " + primeiroNome : ""} 👋`}
        descricao="Aqui está o resumo da DSS Hub hoje"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <MetricaLink
          para="/financeiro"
          icone={<Wallet className="h-5 w-5" />}
          rotulo="Caixa do mês"
          valor={formatBRL(caixaMes)}
          cor="text-success"
        />
        <MetricaLink
          para="/financeiro"
          icone={<Repeat className="h-5 w-5" />}
          rotulo="Receita recorrente"
          valor={formatBRL(mrr)}
          cor="text-primary"
        />
        <MetricaLink
          para="/clientes"
          icone={<Users className="h-5 w-5" />}
          rotulo="Clientes ativos"
          valor={String(ativos.length)}
          cor="text-text"
        />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted" />
            <h2 className="font-semibold text-text">Próximos vencimentos</h2>
          </div>
          <Link to="/clientes" className="flex items-center gap-1 text-sm text-primary hover:underline">
            Ver clientes <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {vencimentos.length === 0 ? (
          <EmptyState
            icone={<CalendarClock className="h-6 w-6" />}
            titulo="Tudo em dia por aqui"
            descricao="Nenhum vencimento próximo ou atrasado entre os clientes ativos."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {vencimentos.map(({ cliente, dias, sit }) => (
              <div key={cliente.id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
                  {iniciais(cliente.nome)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{cliente.nome}</p>
                  <p className="tabular text-xs text-muted">
                    {formatBRL(cliente.valorMensalidade)} · vence dia {cliente.diaVencimento}
                  </p>
                </div>
                <Badge
                  cor={sit === "atrasado" ? "vermelho" : sit === "hoje" ? "vermelho" : "amarelo"}
                >
                  {sit === "atrasado"
                    ? `Atrasado ${Math.abs(dias)}d`
                    : sit === "hoje"
                      ? "Vence hoje"
                      : `Em ${dias}d`}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricaLink({
  para,
  icone,
  rotulo,
  valor,
  cor,
}: {
  para: string;
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  cor: string;
}) {
  return (
    <Link to={para} className="rounded-2xl">
      <Card className="flex h-full flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-muted ring-1 ring-inset ring-border">
          {icone}
        </div>
        <div>
          <p className="text-xs font-medium text-muted">{rotulo}</p>
          <p className={"tabular mt-0.5 text-2xl font-extrabold tracking-tight " + cor}>{valor}</p>
        </div>
      </Card>
    </Link>
  );
}
