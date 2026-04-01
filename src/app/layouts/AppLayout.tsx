import React, { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider';
import { useFiscal } from '../../features/conta/useFiscal';
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const { fiscal } = useFiscal();
  const [activeSection, setActiveSection] = useState(navSections[0]?.title ?? '');

  const activeLinks = useMemo(() => {
    return navSections.find((section) => section.title === activeSection)?.links ?? [];
  }, [activeSection]);

  const nomeFiscal = fiscal?.nome || user?.email?.split('@')[0] || 'Fiscal';

  return (
    <div className="min-h-screen bg-chalk">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-64 flex-col gap-6 border-r border-cloud bg-gradient-to-b from-ink to-[#0B1A2B] text-white">
          <div className="px-6 pt-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Fiscal Hub</p>
            <h2 className="font-display text-2xl mt-2">Painel</h2>
          </div>
          <nav className="flex-1 px-4 pb-6 space-y-5 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 px-2">
                  {section.title}
                </p>
                <div className="flex flex-col gap-1">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'rounded-xl px-3 py-2 text-sm transition',
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        )
                      }
                      end={link.to === '/'}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="px-6 pb-6">
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-cloud bg-white/95 backdrop-blur">
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted">Home / {activeSection}</p>
                <h1 className="font-display text-xl text-ink">
                  {getGreeting()}, {nomeFiscal}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 rounded-full border border-cloud bg-white px-4 py-2 text-sm text-muted">
                  <span>Buscar</span>
                  <input
                    className="bg-transparent outline-none text-ink placeholder:text-muted w-44"
                    placeholder="buscar no painel"
                  />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-cloud bg-white px-3 py-2 text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    {nomeFiscal.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm">{nomeFiscal}</span>
                </div>
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => signOut()}>
                  Sair
                </Button>
              </div>
            </div>

            <nav className="px-6 pb-4 lg:hidden">
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
                        'rounded-full px-3 py-2 text-xs font-semibold transition whitespace-nowrap',
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
            </nav>
          </header>

          <main className="px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
