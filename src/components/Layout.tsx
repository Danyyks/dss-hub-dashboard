import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn, iniciais } from "@/lib/utils";
import { Button } from "./ui";
import { InstallButton } from "./InstallButton";

const navItens = [
  { para: "/", rotulo: "Início", icone: LayoutDashboard, exato: true },
  { para: "/clientes", rotulo: "Clientes", icone: Users },
  { para: "/financeiro", rotulo: "Financeiro", icone: Wallet },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/symbol.svg" alt="DSS Hub Tech" className="h-9 w-9 rounded-xl" />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-text">DSS Hub</p>
        <p className="text-[11px] text-muted">Tech</p>
      </div>
    </div>
  );
}

export function Layout() {
  const { usuario, sair, modoDemo } = useAuth();
  const { tema, alternar } = useTheme();

  return (
    <div className="flex min-h-full">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {navItens.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              end={item.exato}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted hover:bg-surface-2 hover:text-text",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icone
                    className={cn("h-5 w-5", !isActive && "opacity-90")}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  {item.rotulo}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          {modoDemo && (
            <div className="rounded-xl bg-warning/10 px-3 py-2.5 text-[11px] leading-snug text-warning ring-1 ring-inset ring-warning/20">
              Modo demo — dados salvos só neste navegador. Configure o Firebase para
              sincronizar.
            </div>
          )}
          <InstallButton className="w-full justify-start gap-3 px-3" />
          <button
            onClick={alternar}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            {tema === "escuro" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {tema === "escuro" ? "Tema claro" : "Tema escuro"}
          </button>
          <UsuarioBox nome={usuario?.nome} email={usuario?.email} foto={usuario?.foto} aoSair={sair} />
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        {/* Header mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/75 pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-xl md:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            <Button variante="ghost" tamanho="icon" onClick={alternar} aria-label="Alternar tema">
              {tema === "escuro" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variante="ghost" tamanho="icon" onClick={sair} aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Barra inferior mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/85 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur-xl md:hidden">
        <div className="flex items-stretch justify-around px-2 py-1.5">
          {navItens.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              end={item.exato}
              className="flex flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-semibold"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                      isActive ? "bg-primary/12 text-primary" : "text-muted",
                    )}
                  >
                    <item.icone className="h-5 w-5" />
                  </span>
                  <span className={isActive ? "text-primary" : "text-muted"}>
                    {item.rotulo}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function UsuarioBox({
  nome,
  email,
  foto,
  aoSair,
}: {
  nome?: string;
  email?: string;
  foto?: string | null;
  aoSair: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
      {foto ? (
        <img src={foto} alt="" className="h-8 w-8 rounded-full" />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {iniciais(nome ?? "?")}
        </div>
      )}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-xs font-medium text-text">{nome}</p>
        <p className="truncate text-[11px] text-muted">{email}</p>
      </div>
      <button onClick={aoSair} aria-label="Sair" className="text-muted hover:text-danger">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
