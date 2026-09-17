import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Controla a instalação do PWA:
 *  - podeInstalar: navegador ofereceu instalação (Android/desktop) → mostra botão
 *  - instalado: já está rodando como app
 *  - iOS: precisa de instrução manual (Compartilhar → Adicionar à Tela de Início)
 */
export function useInstallPrompt() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [iOS, setIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalado(standalone);
    setIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent) && !standalone);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalado(true);
      setEvento(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    setEvento(null);
  }

  return { podeInstalar: !!evento, instalar, instalado, iOS };
}
