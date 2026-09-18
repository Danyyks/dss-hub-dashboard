import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------- Button ----------------------------- */
type Variante = "primary" | "secondary" | "ghost" | "danger";
type Tamanho = "sm" | "md" | "lg" | "icon";

const variantes: Record<Variante, string> = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover shadow-sm shadow-primary/20",
  secondary:
    "bg-surface text-text border border-border-strong hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
  danger: "bg-danger text-white hover:brightness-95 shadow-sm shadow-danger/20",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-10 w-10",
};

export function Button({
  variante = "primary",
  tamanho = "md",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanho?: Tamanho;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] cursor-pointer",
        variantes[variante],
        tamanhos[tamanho],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ----------------------------- Card ----------------------------- */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ----------------------------- Field / Input ----------------------------- */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
      {hint && <span className="text-xs leading-snug text-muted">{hint}</span>}
    </label>
  );
}

const campoBase =
  "w-full rounded-xl border border-border bg-surface-2 px-3.5 text-sm text-text placeholder:text-muted transition-all " +
  "focus-visible:outline-none focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/15";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(campoBase, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(campoBase, "min-h-24 resize-y py-2.5", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          campoBase,
          "h-11 cursor-pointer appearance-none pr-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

/* ----------------------------- Badge ----------------------------- */
type Cor = "cinza" | "verde" | "amarelo" | "vermelho" | "azul";
const cores: Record<Cor, string> = {
  cinza: "bg-surface-2 text-muted ring-1 ring-inset ring-border",
  verde: "bg-success/12 text-success ring-1 ring-inset ring-success/20",
  amarelo: "bg-warning/12 text-warning ring-1 ring-inset ring-warning/25",
  vermelho: "bg-danger/12 text-danger ring-1 ring-inset ring-danger/20",
  azul: "bg-accent/12 text-accent ring-1 ring-inset ring-accent/25",
};

export function Badge({ cor = "cinza", children }: { cor?: Cor; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        cores[cor],
      )}
    >
      {children}
    </span>
  );
}

/* ----------------------------- Modal ----------------------------- */
export function Modal({
  aberto,
  aoFechar,
  titulo,
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!aberto) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-backdrop"
        onClick={aoFechar}
      />
      <div className="relative flex min-h-full items-end justify-center sm:items-center sm:p-4">
        <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl border border-border bg-surface shadow-modal animate-sheet sm:max-h-[85vh] sm:rounded-3xl">
          {/* Alça (mobile) */}
          <div className="flex justify-center pt-2.5 sm:hidden">
            <span className="h-1.5 w-10 rounded-full bg-border-strong" />
          </div>
          <div className="flex shrink-0 items-center justify-between gap-4 px-6 py-4">
            <h2 className="text-lg font-bold tracking-tight text-text">{titulo}</h2>
            <Button variante="ghost" tamanho="icon" onClick={aoFechar} aria-label="Fechar">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-px shrink-0 bg-border" />
          <div className="min-h-0 overflow-y-auto overscroll-contain px-6 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ----------------------------- EmptyState ----------------------------- */
export function EmptyState({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone: ReactNode;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted ring-1 ring-inset ring-border">
        {icone}
      </div>
      <h3 className="text-base font-bold text-text">{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
