import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { useAuth } from './AuthProvider';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const ok = await signIn(email, password);
    setSubmitting(false);
    if (ok) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Fiscal Assistant</p>
          <h1 className="font-display text-3xl text-primary">Bem-vindo de volta</h1>
          <p className="text-sm text-muted mt-2">
            Acesse sua central de turno para iniciar o monitoramento.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-cloud px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            Senha
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-cloud px-4 py-3"
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="flex items-center justify-between text-sm text-muted">
          <Link to="/reset" className="hover:text-ink">
            Esqueci a senha
          </Link>
          <Link to="/register" className="hover:text-ink">
            Criar conta
          </Link>
        </div>
      </Card>
    </div>
  );
}

