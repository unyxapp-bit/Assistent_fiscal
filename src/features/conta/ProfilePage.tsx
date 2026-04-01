import React from 'react';
import { Card } from '../../shared/ui/Card';
import { Button } from '../../shared/ui/Button';
import { useAuth } from '../auth/AuthProvider';
import { useFiscal } from './useFiscal';

export default function ProfilePage() {
  const { user, resetPassword } = useAuth();
  const { fiscal, isLoading } = useFiscal();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Conta</p>
        <h1 className="font-display text-3xl text-ink">Perfil</h1>
        <p className="text-sm text-muted mt-2">
          Informações da sua conta Supabase e dados do fiscal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h2 className="font-display text-lg mb-2">Conta</h2>
          <p className="text-sm text-muted">ID: {user?.id ?? '—'}</p>
          <p className="text-sm text-muted">Email: {user?.email ?? '—'}</p>
          {user?.email ? (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => resetPassword(user.email)}
            >
              Enviar redefinição de senha
            </Button>
          ) : null}
        </Card>
        <Card>
          <h2 className="font-display text-lg mb-2">Fiscal</h2>
          {isLoading ? (
            <p className="text-sm text-muted">Carregando...</p>
          ) : fiscal ? (
            <div className="text-sm text-muted space-y-1">
              <p>Nome: {fiscal.nome}</p>
              <p>Telefone: {fiscal.telefone ?? '—'}</p>
              <p>Loja: {fiscal.loja ?? '—'}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">Nenhum registro fiscal encontrado.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
