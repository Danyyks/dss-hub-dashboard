import { useEffect, useState } from "react";
import { createRepo, type Entidade } from "@/lib/repo";
import type { Cliente, Lancamento } from "@/types";

export const clientesRepo = createRepo<Cliente>("clientes");
export const lancamentosRepo = createRepo<Lancamento>("lancamentos");

function useRepo<T extends Entidade>(repo: ReturnType<typeof createRepo<T>>) {
  const [dados, setDados] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = repo.subscribe((itens) => {
      setDados(itens);
      setCarregando(false);
    });
    return unsub;
  }, [repo]);

  return { dados, carregando };
}

export function useClientes() {
  const { dados, carregando } = useRepo(clientesRepo);
  return { clientes: dados, carregando };
}

export function useLancamentos() {
  const { dados, carregando } = useRepo(lancamentosRepo);
  return { lancamentos: dados, carregando };
}
