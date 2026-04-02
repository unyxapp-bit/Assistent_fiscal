import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { usePizzaria } from './usePizzaria';

const tamanhos = ['media', 'grande', 'familia'];

export default function PizzasCadastroPage() {
  const { pizzas, isLoading, criarPizza, atualizarPizza } = usePizzaria();
  const [nome, setNome] = useState('');
  const [tamanho, setTamanho] = useState('media');
  const [ingredientes, setIngredientes] = useState('');
  const [busca, setBusca] = useState('');

  const filtered = useMemo(() => {
    if (!busca.trim()) return pizzas;
    const term = busca.trim().toLowerCase();
    return pizzas.filter((p) => `${p.nome} ${p.tamanho}`.toLowerCase().includes(term));
  }, [pizzas, busca]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome.trim()) return;
    await criarPizza({
      nome: nome.trim(),
      tamanho,
      ingredientes: ingredientes.trim() || null,
    });
    setNome('');
    setIngredientes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Pizzaria</p>
          <h1 className="font-display text-3xl text-primary">Cardápio</h1>
          <p className="text-sm text-muted mt-2">Cadastre pizzas e tamanhos.</p>
        </div>
        <Link to="/pizzaria">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <Card>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleCreate}>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
          />
          <select
            value={tamanho}
            onChange={(e) => setTamanho(e.target.value)}
            className="rounded-xl border border-cloud px-4 py-2"
          >
            {tamanhos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            value={ingredientes}
            onChange={(e) => setIngredientes(e.target.value)}
            placeholder="Ingredientes"
            className="rounded-xl border border-cloud px-4 py-2"
          />
          <Button type="submit" className="md:col-span-4">
            Adicionar pizza
          </Button>
        </form>
      </Card>

      <Card className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou tamanho"
          className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
        />
        <div className="text-xs text-muted flex items-center">Total: {pizzas.length}</div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <Card>Carregando pizzas...</Card>
        ) : filtered.length === 0 ? (
          <Card>Nenhuma pizza cadastrada.</Card>
        ) : (
          filtered.map((pizza) => (
            <Card
              key={pizza.id}
              className="flex h-full flex-col justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold text-ink text-base">
                  {pizza.nome?.trim() || 'Pizza sem nome'}
                </p>
                <p className="text-xs text-muted">{pizza.tamanho}</p>
                {pizza.ingredientes ? (
                  <p className="text-xs text-muted">{pizza.ingredientes}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  {pizza.ativa ? 'Ativa' : 'Inativa'}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => atualizarPizza({ id: pizza.id, patch: { ativa: !pizza.ativa } })}
                >
                  {pizza.ativa ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


