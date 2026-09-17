import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  useEffect,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------- Button ----------------------------- */
type Variante = "primary" | "secondary" | "ghost" | "danger";
type Tamanho = "sm" | "md" | "lg" | "icon";

const variantes: Record<Variante, string> = {
  primary:
    "bg-primary text-primary-fg hover:opacity-90 shadow-sm shadow-primary/20",
  secondary:
    "bg-surface-2 text-text hover:bg-border border border-border",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
  danger: "bg-danger text-white hover:opacity-90",
};

const tamanhos: Record<Tamanho, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
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
        "inline-flex items-center justify-center rounded-xl font-medium transition-all",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer",
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
        "rounded-2xl border border-border bg-surface p-5 shadow-sm",
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
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

const campoBase =
  "w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text placeholder:text-muted transition-colors focus:border-primary focus:bg-surface";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(campoBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(campoBase, "min-h-24 resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(campoBase, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}

/* ----------------------------- Badge ----------------------------- */
type Cor = "cinza" | "verde" | "amarelo" | "vermelho" | "azul";
const cores: Record<Cor, string> = {
  cinza: "bg-surface-2 text-muted",
  verde: "bg-success/15 text-success",
  amarelo: "bg-warning/15 text-warning",
  vermelho: "bg-danger/15 text-danger",
  azul: "bg-primary/15 text-primary",
};

export function Badge({ cor = "cinza", children }: { cor?: Cor; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
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
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in"
        onClick={aoFechar}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-surface p-6 shadow-xl animate-in sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">{titulo}</h2>
          <Button variante="ghost" tamanho="icon" onClick={aoFechar} aria-label="Fechar">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-muted">
        {icone}
      </div>
      <h3 className="text-base font-semibold text-text">{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
