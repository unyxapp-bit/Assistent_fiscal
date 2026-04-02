import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { useAuth } from './AuthProvider';

export default function ResetPasswordPage() {
  const { resetPassword, error } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const ok = await resetPassword(email);
    setSubmitting(false);
    if (ok) setStatus('sent');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Fiscal Assistant</p>
          <h1 className="font-display text-3xl text-primary">Recuperar senha</h1>
          <p className="text-sm text-muted mt-2">
            Enviaremos um link para redefinir a senha.
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
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {status === 'sent' ? (
            <p className="text-sm text-success">Email enviado. Verifique sua caixa de entrada.</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar link'}
          </Button>
        </form>
        <div className="text-sm text-muted">
          <Link to="/login" className="hover:text-ink">
            Voltar para login
          </Link>
        </div>
      </Card>
    </div>
  );
}

