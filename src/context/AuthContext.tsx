import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured, allowedEmails } from "@/lib/firebase";

export interface Usuario {
  nome: string;
  email: string;
  foto: string | null;
}

interface AuthState {
  usuario: Usuario | null;
  carregando: boolean;
  erro: string | null;
  modoDemo: boolean;
  entrar: () => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const CHAVE_DEMO = "dsshub:demo-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // ---------- MODO DEMO ----------
    if (!isFirebaseConfigured || !auth) {
      const salvo = localStorage.getItem(CHAVE_DEMO);
      if (salvo) setUsuario(JSON.parse(salvo));
      setCarregando(false);
      return;
    }
    // ---------- MODO NUVEM ----------
    // Conclui um login iniciado por redirecionamento (celular/PWA) e mostra erros.
    getRedirectResult(auth).catch((e) => {
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/unauthorized-domain") {
        setErro(
          "Este endereço ainda não está autorizado no Firebase (Authentication → Authorized domains).",
        );
      }
    });
    return onAuthStateChanged(auth, (u: User | null) => {
      if (u && u.email && ehPermitido(u.email)) {
        setUsuario({
          nome: u.displayName ?? u.email,
          email: u.email,
          foto: u.photoURL,
        });
        setErro(null);
      } else {
        setUsuario(null);
        if (u) {
          // logou mas não está na allowlist
          setErro("Acesso não autorizado para este e-mail.");
          void signOut(auth!);
        }
      }
      setCarregando(false);
    });
  }, []);

  function ehPermitido(email: string): boolean {
    if (allowedEmails.length === 0) return true; // sem lista = libera (dev)
    return allowedEmails.includes(email.toLowerCase());
  }

  async function entrar() {
    setErro(null);
    if (!isFirebaseConfigured || !auth) {
      // login demo
      const demo: Usuario = {
        nome: "Equipe DSS",
        email: "demo@dsshub.tech",
        foto: null,
      };
      localStorage.setItem(CHAVE_DEMO, JSON.stringify(demo));
      setUsuario(demo);
      return;
    }
    const provider = new GoogleAuthProvider();

    // Popup é o padrão em todas as plataformas (inclusive celular e PWA). O
    // redirecionamento do Firebase trava quando o app e o authDomain são domínios
    // diferentes (bloqueio de armazenamento entre sites), então fica só de reserva.
    try {
      const cred = await signInWithPopup(auth, provider);
      if (cred.user.email && !ehPermitido(cred.user.email)) {
        await signOut(auth);
        setErro("Acesso não autorizado para este e-mail.");
      }
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return; // usuário fechou o popup, sem erro
      }
      // popup bloqueado ou não suportado → tenta redirecionamento
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (er) {
          tratarErroLogin(er);
          return;
        }
      }
      tratarErroLogin(e);
    }
  }

  function tratarErroLogin(e: unknown) {
    const code = (e as { code?: string }).code ?? "";
    if (code === "auth/unauthorized-domain") {
      setErro(
        "Este endereço ainda não está autorizado no Firebase (Authentication → Authorized domains).",
      );
    } else {
      setErro("Não foi possível entrar. Tente novamente.");
    }
  }

  async function sair() {
    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem(CHAVE_DEMO);
      setUsuario(null);
      return;
    }
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, erro, modoDemo: !isFirebaseConfigured, entrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
