import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { uid } from "./utils";

export interface Entidade {
  id: string;
  criadoEm: number;
}

/**
 * Repositório genérico com dois backends transparentes:
 *  - Firestore (tempo real) quando o Firebase está configurado
 *  - localStorage (modo demo) caso contrário
 * A API é idêntica nos dois casos.
 */
export function createRepo<T extends Entidade>(nome: string) {
  const chaveLocal = `dsshub:${nome}`;

  // ---------- MODO DEMO (localStorage) ----------
  const lerLocal = (): T[] => {
    try {
      const raw = localStorage.getItem(chaveLocal);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  };
  const escreverLocal = (itens: T[]) => {
    try {
      localStorage.setItem(chaveLocal, JSON.stringify(itens));
    } catch {
      /* ignora quota */
    }
    // notifica assinantes desta aba
    window.dispatchEvent(new CustomEvent(`repo:${nome}`));
  };

  function subscribe(cb: (itens: T[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, nome), orderBy("criadoEm", "desc"));
      return onSnapshot(q, (snap) => {
        cb(snap.docs.map((d) => d.data() as T));
      });
    }
    const emit = () => {
      const itens = lerLocal().sort((a, b) => b.criadoEm - a.criadoEm);
      cb(itens);
    };
    emit();
    const handler = () => emit();
    window.addEventListener(`repo:${nome}`, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(`repo:${nome}`, handler);
      window.removeEventListener("storage", handler);
    };
  }

  async function add(dados: Omit<T, "id" | "criadoEm">): Promise<string> {
    const id = uid();
    const item = { ...dados, id, criadoEm: Date.now() } as T;
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, nome, id), item);
    } else {
      escreverLocal([item, ...lerLocal()]);
    }
    return id;
  }

  async function update(id: string, patch: Partial<T>): Promise<void> {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, nome, id), patch as Record<string, unknown>);
    } else {
      escreverLocal(lerLocal().map((i) => (i.id === id ? { ...i, ...patch } : i)));
    }
  }

  async function remove(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, nome, id));
    } else {
      escreverLocal(lerLocal().filter((i) => i.id !== id));
    }
  }

  return { subscribe, add, update, remove };
}
