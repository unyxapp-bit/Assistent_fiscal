import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
    hidden: true,
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
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const activeLinks = useMemo(() => {
    return navSections.find((section) => section.title === activeSection)?.links ?? [];
  }, [activeSection]);

  const visibleSections = useMemo(() => {
    return navSections.filter((section) => !section.hidden);
  }, []);

  const accountLinks = useMemo(() => {
    return navSections.find((section) => section.title === 'Conta')?.links ?? [];
  }, []);

  const menuLinks = useMemo(() => {
    if (!menuOpen) return [];
    return navSections.find((section) => section.title === menuOpen)?.links ?? [];
  }, [menuOpen]);

  const nomeFiscal = fiscal?.nome || user?.email?.split('@')[0] || 'Fiscal';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const pathname = location.pathname;
    const matched = navSections.find((section) =>
      section.links.some((link) =>
        link.to === '/'
          ? pathname === '/'
          : pathname === link.to || pathname.startsWith(`${link.to}/`)
      )
    );
    if (matched && matched.title !== activeSection) {
      setActiveSection(matched.title);
    }
    setMenuOpen(null);
  }, [location.pathname, activeSection]);

  return (
    <div className="min-h-screen bg-chalk">
      <div className="min-h-screen">
        <header className="sticky top-0 z-20 border-b border-cloud bg-white/95 backdrop-blur shadow-[0_12px_30px_-24px_rgba(12,13,16,0.35)]">
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
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
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-cloud bg-white px-3 py-2 text-sm hover:border-primary/60"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    {nomeFiscal.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm">{nomeFiscal}</span>
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-cloud bg-white p-2 shadow-[0_18px_40px_-28px_rgba(12,13,16,0.45)]">
                    {accountLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-cloud/60"
                        onClick={() => setProfileOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </div>
          </div>

          <nav
            className="px-6 pb-4 pt-3 bg-[#f7f2e8] border-t border-cloud/60 relative"
            ref={navRef}
          >
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3">
              <div className="inline-flex items-center rounded-full bg-[#efe7da] p-1 border border-cloud/70 shadow-[0_8px_20px_-18px_rgba(12,13,16,0.45)]">
                {visibleSections.map((section) => (
                  <button
                    key={section.title}
                    type="button"
                    onClick={() => {
                      setActiveSection(section.title);
                      setMenuOpen((prev) => (prev === section.title ? null : section.title));
                    }}
                    className={cn(
                      'relative px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] transition rounded-full',
                      activeSection === section.title
                        ? 'bg-white text-ink shadow-sm border border-cloud'
                        : 'text-muted hover:text-ink'
                    )}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
            {menuOpen ? (
              <div className="absolute left-6 top-full z-30 mt-2 w-64 rounded-2xl border border-cloud bg-white p-2 shadow-[0_18px_40px_-28px_rgba(12,13,16,0.45)]">
                <p className="px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-muted">
                  {menuOpen}
                </p>
                <div className="space-y-1">
                  {menuLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-xl px-3 py-2 text-sm transition',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-ink hover:bg-cloud/60'
                        )
                      }
                      end={link.to === '/'}
                      onClick={() => setMenuOpen(null)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : null}
          </nav>
        </header>

        <main className="px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
