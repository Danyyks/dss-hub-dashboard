import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Clientes } from "@/pages/Clientes";
import { Financeiro } from "@/pages/Financeiro";

function Splash() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <img src="/symbol.svg" alt="DSS Hub Tech" className="h-14 w-14 animate-pulse rounded-2xl" />
    </div>
  );
}

export function App() {
  const { usuario, carregando } = useAuth();

  if (carregando) return <Splash />;
  if (!usuario) return <Login />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="financeiro" element={<Financeiro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
