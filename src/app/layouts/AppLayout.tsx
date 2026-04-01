import React, { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { Button } from '../../shared/ui/Button';
import { cn } from '../../shared/lib/cn';

const navSections = [
  {
    title: 'Turno',
    links: [
      { label: 'Início', to: '/' },
      { label: 'Principal', to: '/principal' },
      { label: 'Pizzaria', to: '/pizzaria' },
      { label: 'Operações', to: '/operacoes' },
      { label: 'Loja', to: '/loja' },
    ],
  },
  {
    title: 'Gestão',
    links: [
      { label: 'Mapa de Caixas', to: '/mapa' },
      { label: 'Alocação', to: '/alocacao' },
      { label: 'Café/Intervalos', to: '/cafe' },
      { label: 'Folga', to: '/folga' },
      { label: 'Caixas', to: '/caixas' },
      { label: 'Colaboradores', to: '/colaboradores' },
      { label: 'Escala', to: '/escala' },
    ],
  },
  {
    title: 'Operacional',
    links: [
      { label: 'Entregas', to: '/entregas' },
      { label: 'Ocorrências', to: '/ocorrencias' },
      { label: 'Checklists', to: '/checklists' },
      { label: 'Passagem de Turno', to: '/passagem-turno' },
      { label: 'Guia Rápido', to: '/guia-rapido' },
      { label: 'Notas', to: '/notas' },
      { label: 'Formulários', to: '/formularios' },
      { label: 'Procedimentos', to: '/procedimentos' },
      { label: 'Notificações', to: '/notificacoes' },
    ],
  },
  {
    title: 'Relatórios',
    links: [
      { label: 'Timeline', to: '/timeline' },
      { label: 'Relatórios', to: '/relatorios' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { label: 'Configurações', to: '/configuracoes' },
      { label: 'Cupom Fiscal', to: '/cupom' },
      { label: 'Perfil', to: '/perfil' },
    ],
  },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? 'Fiscal';
  const [activeSection, setActiveSection] = useState(navSections[0]?.title ?? '');

  const activeLinks = useMemo(() => {
    return navSections.find((section) => section.title === activeSection)?.links ?? [];
  }, [activeSection]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-cloud bg-white/90 backdrop-blur">
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">
              Fiscal Assistant
            </p>
            <h1 className="font-display text-xl text-ink">Painel Web</h1>
            <p className="text-xs text-muted mt-0.5">{email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sair
          </Button>
        </div>

        <nav className="px-4 pb-3">
          <div className="hidden md:block">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-cloud pb-2">
              {navSections.map((section) => (
                <button
                  key={section.title}
                  onClick={() => setActiveSection(section.title)}
                  className={cn(
                    'px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition',
                    activeSection === section.title
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  {section.title}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-3">
              {activeLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-xs font-semibold transition whitespace-nowrap',
                      isActive
                        ? 'bg-primary text-white'
                        : 'border border-cloud text-ink hover:border-primary hover:text-primary'
                    )
                  }
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="md:hidden space-y-2">
            {navSections.map((section) => (
              <details key={section.title} className="rounded-xl border border-cloud bg-white">
                <summary className="cursor-pointer px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted">
                  {section.title}
                </summary>
                <div className="flex flex-wrap gap-2 px-3 pb-3">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'rounded-full px-3 py-2 text-xs font-semibold transition',
                          isActive
                            ? 'bg-primary text-white'
                            : 'border border-cloud text-ink hover:border-primary hover:text-primary'
                        )
                      }
                      end={link.to === '/'}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </nav>
      </header>

      <main className="px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
