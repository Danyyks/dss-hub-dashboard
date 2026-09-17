import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Tema = "claro" | "escuro";
const CHAVE = "dsshub:tema";

interface ThemeState {
  tema: Tema;
  alternar: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE) as Tema | null;
    if (salvo) return salvo;
  } catch {
    /* noop */
  }
  const prefereEscuro =
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  return prefereEscuro ? "escuro" : "claro";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", tema === "escuro");
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      /* noop */
    }
  }, [tema]);

  const alternar = () => setTema((t) => (t === "escuro" ? "claro" : "escuro"));

  return (
    <ThemeContext.Provider value={{ tema, alternar }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
