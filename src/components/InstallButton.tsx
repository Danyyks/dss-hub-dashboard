import { Download, Share } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "./ui";

/** Botão "Instalar aplicativo" que aparece só quando faz sentido. */
export function InstallButton({ className }: { className?: string }) {
  const { podeInstalar, instalar, instalado, iOS } = useInstallPrompt();

  if (instalado) return null;

  if (podeInstalar) {
    return (
      <Button
        variante="secondary"
        className={className ?? "w-full"}
        onClick={() => void instalar()}
      >
        <Download className="h-4 w-4" /> Instalar aplicativo
      </Button>
    );
  }

  if (iOS) {
    return (
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <Share className="h-3.5 w-3.5 shrink-0" />
        Para instalar: toque em Compartilhar e depois em “Adicionar à Tela de Início”.
      </p>
    );
  }

  return null;
}
