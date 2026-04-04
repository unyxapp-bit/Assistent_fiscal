import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SplashGate from './SplashGate';
import { RequireAuth } from '../features/auth/RequireAuth';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import DashboardHome from '../features/dashboard/DashboardHome';
import LojaHub from '../features/hubs/LojaHub';
import PizzariaHub from '../features/hubs/PizzariaHub';
import CaixasPage from '../features/caixas/CaixasPage';
import AlocacaoPage from '../features/alocacoes/AlocacaoPage';
import CafePage from '../features/cafe/CafePage';
import ChecklistPage from '../features/checklists/ChecklistPage';
import ChecklistTemplateFormPage from '../features/checklists/ChecklistTemplateFormPage';
import ChecklistExecucaoPage from '../features/checklists/ChecklistExecucaoPage';
import ColaboradoresPage from '../features/colaboradores/ColaboradoresPage';
import ColaboradorDetailPage from '../features/colaboradores/ColaboradorDetailPage';
import ConfiguracoesPage from '../features/conta/ConfiguracoesPage';
import EntregasPage from '../features/entregas/EntregasPage';
import EntregaFormPage from '../features/entregas/EntregaFormPage';
import EntregaDetailPage from '../features/entregas/EntregaDetailPage';
import EscalaPage from '../features/escala/EscalaPage';
import EscalaDiaPage from '../features/escala/EscalaDiaPage';
import ImportarEscalaPage from '../features/escala/ImportarEscalaPage';
import FormulariosPage from '../features/formularios/FormulariosPage';
import FormularioEditorPage from '../features/formularios/FormularioEditorPage';
import FormularioPreenchimentoPage from '../features/formularios/FormularioPreenchimentoPage';
import FormularioRespostasPage from '../features/formularios/FormularioRespostasPage';
import GestaoPage from '../features/gestao/GestaoPage';
import GuiaRapidoPage from '../features/guiaRapido/GuiaRapidoPage';
import GuiaRapidoFormPage from '../features/guiaRapido/GuiaRapidoFormPage';
import MapaCaixasPage from '../features/mapa/MapaCaixasPage';
import NotasPage from '../features/notas/NotasPage';
import NotaFormPage from '../features/notas/NotaFormPage';
import NotaDetailPage from '../features/notas/NotaDetailPage';
import NotificacoesPage from '../features/notificacoes/NotificacoesPage';
import OcorrenciasPage from '../features/ocorrencias/OcorrenciasPage';
import OcorrenciaFormPage from '../features/ocorrencias/OcorrenciaFormPage';
import OcorrenciaDetailPage from '../features/ocorrencias/OcorrenciaDetailPage';
import PassagemTurnoPage from '../features/passagemTurno/PassagemTurnoPage';
import ProcedimentosPage from '../features/procedimentos/ProcedimentosPage';
import ProcedimentoFormPage from '../features/procedimentos/ProcedimentoFormPage';
import ProcedimentoDetailPage from '../features/procedimentos/ProcedimentoDetailPage';
import ProfilePage from '../features/conta/ProfilePage';
import RelatoriosPage from '../features/relatorios/RelatoriosPage';
import TimelinePage from '../features/timeline/TimelinePage';
import CupomConfigPage from '../features/cupom/CupomConfigPage';
import FolgaPage from '../features/folga/FolgaPage';
import PedidosPage from '../features/pizzaria/PedidosPage';
import NovoPedidoPage from '../features/pizzaria/NovoPedidoPage';
import PizzasCadastroPage from '../features/pizzaria/PizzasCadastroPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SplashGate>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />
          </Route>
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="/principal" element={<Navigate to="/" replace />} />
            <Route path="/operacoes" element={<Navigate to="/" replace />} />
            <Route path="/loja" element={<LojaHub />} />
            <Route path="/pizzaria" element={<PizzariaHub />} />
            <Route path="/pizzaria/pedidos" element={<PedidosPage />} />
            <Route path="/pizzaria/novo" element={<NovoPedidoPage />} />
            <Route path="/pizzaria/pizzas" element={<PizzasCadastroPage />} />
            <Route path="/mapa" element={<MapaCaixasPage />} />
            <Route path="/alocacao" element={<AlocacaoPage />} />
            <Route path="/cafe" element={<CafePage />} />
            <Route path="/caixas" element={<CaixasPage />} />
          <Route path="/colaboradores" element={<ColaboradoresPage />} />
          <Route path="/colaboradores/:id" element={<ColaboradorDetailPage />} />
            <Route path="/escala" element={<EscalaPage />} />
          <Route path="/escala/dia/:data" element={<EscalaDiaPage />} />
          <Route path="/escala/importar" element={<ImportarEscalaPage />} />
            <Route path="/gestao" element={<GestaoPage />} />
            <Route path="/entregas" element={<EntregasPage />} />
          <Route path="/entregas/nova" element={<EntregaFormPage />} />
          <Route path="/entregas/:id" element={<EntregaDetailPage />} />
            <Route path="/ocorrencias" element={<OcorrenciasPage />} />
          <Route path="/ocorrencias/nova" element={<OcorrenciaFormPage />} />
          <Route path="/ocorrencias/:id" element={<OcorrenciaDetailPage />} />
            <Route path="/checklists" element={<ChecklistPage />} />
          <Route path="/checklists/novo" element={<ChecklistTemplateFormPage />} />
          <Route path="/checklists/:id/editar" element={<ChecklistTemplateFormPage />} />
          <Route path="/checklists/execucao/:execId" element={<ChecklistExecucaoPage />} />
            <Route path="/passagem-turno" element={<PassagemTurnoPage />} />
            <Route path="/guia-rapido" element={<GuiaRapidoPage />} />
          <Route path="/guia-rapido/novo" element={<GuiaRapidoFormPage />} />
          <Route path="/guia-rapido/:id/editar" element={<GuiaRapidoFormPage />} />
            <Route path="/notas" element={<NotasPage />} />
          <Route path="/notas/nova" element={<NotaFormPage />} />
          <Route path="/notas/:id" element={<NotaDetailPage />} />
            <Route path="/formularios" element={<FormulariosPage />} />
          <Route path="/formularios/novo" element={<FormularioEditorPage />} />
          <Route path="/formularios/:id/editar" element={<FormularioEditorPage />} />
          <Route path="/formularios/:id/preencher" element={<FormularioPreenchimentoPage />} />
          <Route path="/formularios/:id/respostas" element={<FormularioRespostasPage />} />
            <Route path="/procedimentos" element={<ProcedimentosPage />} />
          <Route path="/procedimentos/novo" element={<ProcedimentoFormPage />} />
          <Route path="/procedimentos/:id/editar" element={<ProcedimentoFormPage />} />
          <Route path="/procedimentos/:id" element={<ProcedimentoDetailPage />} />
            <Route path="/notificacoes" element={<NotificacoesPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/relatorio-diario" element={<RelatoriosPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/cupom" element={<CupomConfigPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/folga" element={<FolgaPage />} />
          </Route>
        </Routes>
      </SplashGate>
    </BrowserRouter>
  );
}
