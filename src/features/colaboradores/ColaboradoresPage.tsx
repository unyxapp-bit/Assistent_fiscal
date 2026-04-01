import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import type { DepartamentoTipo } from '../../shared/types';
import { useColaboradores } from './useColaboradores';
import { cn } from '../../shared/lib/cn';

const departamentos: DepartamentoTipo[] = [
  'caixa',
  'fiscal',
  'pacote',
  'self',
  'gerencia',
  'acougue',
  'padaria',
  'hortifruti',
  'deposito',
  'limpeza',
  'seguranca',
  'outro',
];

export default function ColaboradoresPage() {
  const { data, isLoading, createColaborador, updateColaborador, creating, updating } =
    useColaboradores();
  const [nome, setNome] = useState('');
  const [departamento, setDepartamento] = useState<DepartamentoTipo>('caixa');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [busca, setBusca] = useState('');
  const [filtroDepto, setFiltroDepto] = useState('todos');
  const [status, setStatus] = useState<'ativos' | 'inativos'>('ativos');
  const colaboradores = data ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome.trim()) return;
    await createColaborador({
      nome: nome.trim(),
      departamento,
      telefone: telefone.trim() || null,
      cargo: cargo.trim() || null,
    });
    setNome('');
    setTelefone('');
    setCargo('');
  };

  const filtrados = useMemo(() => {
    return colaboradores
      .filter((c) => (status === 'ativos' ? c.ativo : !c.ativo))
      .filter((c) => (filtroDepto === 'todos' ? true : c.departamento === filtroDepto))
      .filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()));
  }, [colaboradores, status, filtroDepto, busca]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Gestão</p>
        <h1 className="font-display text-3xl text-ink">Colaboradores</h1>
        <p className="text-sm text-muted mt-2">
          Cadastro de equipe ativa para alocação, escala e módulos operacionais.
        </p>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-5 gap-3" onSubmit={handleCreate}>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />
          <select
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value as DepartamentoTipo)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            {departamentos.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <div className="flex gap-3 md:col-span-5">
            <input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Cargo (opcional)"
              className="flex-1 rounded-xl border border-cloud px-4 py-2"
            />
            <Button type="submit" disabled={creating}>
              Adicionar
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-wrap gap-3 items-center">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome"
          className="rounded-xl border border-cloud px-4 py-2"
        />
        <select
          value={filtroDepto}
          onChange={(e) => setFiltroDepto(e.target.value)}
          className="rounded-xl border border-cloud px-4 py-2"
        >
          <option value="todos">Todos departamentos</option>
          {departamentos.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {(['ativos', 'inativos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={cn(
                'rounded-full px-4 py-2 text-sm border',
                status === tab ? 'bg-primary text-white border-primary' : 'border-cloud'
              )}
            >
              {tab === 'ativos' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <Card>Carregando colaboradores...</Card>
        ) : filtrados.length === 0 ? (
          <Card>Nenhum colaborador encontrado.</Card>
        ) : (
          filtrados.map((col) => (
            <Card key={col.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl">{col.nome}</h3>
                  <p className="text-sm text-muted">Departamento: {col.departamento}</p>
                  {col.cargo ? <p className="text-xs text-muted">Cargo: {col.cargo}</p> : null}
                  {col.telefone ? (
                    <p className="text-xs text-muted">Contato: {col.telefone}</p>
                  ) : null}
                </div>
                <span className="rounded-full border border-cloud px-3 py-1 text-xs">
                  {col.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() =>
                    updateColaborador({
                      id: col.id,
                      patch: { ativo: !col.ativo },
                    })
                  }
                >
                  {col.ativo ? 'Desativar' : 'Ativar'}
                </Button>
                <Link to={`/colaboradores/${col.id}`} className="text-sm font-semibold text-primary">
                  Ver detalhes →
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
