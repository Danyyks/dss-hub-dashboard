import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";
import { Button } from "./ui";

/**
 * Aviso flutuante "Nova versão disponível — Atualizar".
 * Aparece quando o service worker detecta uma versão nova publicada.
 * Verifica atualizações ao abrir o app (foreground) e a cada hora.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const checar = () => registration.update().catch(() => {});
      // checa periodicamente e sempre que o app volta pro primeiro plano
      setInterval(checar, 60 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checar();
      });
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6">
      <div className="animate-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-modal">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <RefreshCw className="h-4 w-4" />
        </div>
        <p className="min-w-0 flex-1 text-sm font-medium text-text">
          Nova versão disponível
        </p>
        <Button tamanho="sm" onClick={() => void updateServiceWorker(true)}>
          Atualizar
        </Button>
        <button
          onClick={() => setNeedRefresh(false)}
          aria-label="Agora não"
          className="shrink-0 text-muted hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
