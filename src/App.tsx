import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import ResetarSenha from './pages/ResetarSenha';
import ConectarWhatsapp from './pages/ConectarWhatsapp';
import ConfigurarAgente from './pages/ConfigurarAgente';
import PainelControle from './pages/PainelControle';

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  
  if (!session) {
    // Verifica se é um redirecionamento manual (logout)
    const manualRedirect = localStorage.getItem('manual_redirect');
    if (manualRedirect) {
      localStorage.removeItem('manual_redirect');
      return null;
    }
    return <Navigate to="/login/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login/" element={<Login />} />
        <Route path="/resetar-senha" element={<ResetarSenha />} />
        <Route
          path="/minha-conta"
          element={<Navigate to="/painel-controle" />}
        />
        <Route
          path="/conectar-whatsapp"
          element={
            <RotaProtegida>
              <ConectarWhatsapp />
            </RotaProtegida>
          }
        />
        <Route
          path="/"
          element={<Navigate to="/painel-controle" />}
        />
        <Route
          path="/painel-controle"
          element={
            <RotaProtegida>
              <PainelControle />
            </RotaProtegida>
          }
        />
        <Route
          path="/configurar-agente"
          element={
            <RotaProtegida>
              <ConfigurarAgente />
            </RotaProtegida>
          }
        />
        <Route
          path="/configurar-agente/:id"
          element={
            <RotaProtegida>
              <ConfigurarAgente />
            </RotaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
