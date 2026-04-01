import React from 'react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f4f0]">
      <div className="surface px-10 py-8 text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Fiscal Assistant</p>
        <h1 className="font-display text-3xl text-ink">Preparando o turno</h1>
        <p className="text-sm text-muted">Aguarde alguns instantes...</p>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-cloud">
          <div className="h-full w-1/2 animate-pulse bg-primary" />
        </div>
      </div>
    </div>
  );
}
