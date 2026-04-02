import React, { useEffect, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useFiscal } from './useFiscal';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { fiscal, isLoading, salvarFiscal, saving } = useFiscal();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loja, setLoja] = useState('');

  useEffect(() => {
    if (!fiscal) return;
    setNome(fiscal.nome ?? '');
    setTelefone(fiscal.telefone ?? '');
    setLoja(fiscal.loja ?? '');
  }, [fiscal]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id || !user.email) return;
    await salvarFiscal({
      id: user.id,
      email: user.email,
      nome: nome.trim() || user.email,
      telefone: telefone.trim() || null,
      loja: loja.trim() || null,
      ativo: true,
      created_at: fiscal?.created_at ?? null,
      updated_at: fiscal?.updated_at ?? null,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Conta</p>
        <h1 className="font-display text-3xl text-primary">ConfiguraÃ§Ãµes</h1>
        <p className="text-sm text-muted mt-2">
          Dados do fiscal, loja e preferÃªncias principais.
        </p>
      </div>

      <Card>
        {isLoading ? (
          <p className="text-sm text-muted">Carregando dados...</p>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSave}>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome"
              className="rounded-xl border border-cloud px-4 py-2"
            />
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Telefone"
              className="rounded-xl border border-cloud px-4 py-2"
            />
            <input
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              placeholder="Loja"
              className="rounded-xl border border-cloud px-4 py-2 md:col-span-2"
            />
            <Button type="submit" disabled={saving} className="md:col-span-2">
              Salvar configuraÃ§Ãµes
            </Button>
          </form>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-lg mb-2">Perfil</h2>
          <p className="text-sm text-muted">
            Atualize dados pessoais, telefone e informaÃ§Ãµes da loja.
          </p>
          <Link
            to="/perfil"
            className="inline-flex mt-4 text-sm font-semibold text-primary"
          >
            Abrir perfil â†’
          </Link>
        </Card>
        <Card>
          <h2 className="font-display text-lg mb-2">Cupom Fiscal</h2>
          <p className="text-sm text-muted">
            Ajuste textos, flags e mensagens exibidas no cupom.
          </p>
          <Link
            to="/cupom"
            className="inline-flex mt-4 text-sm font-semibold text-primary"
          >
            Configurar cupom â†’
          </Link>
        </Card>
      </div>
    </div>
  );
}

