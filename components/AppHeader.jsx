import Link from 'next/link';
import { Brand, Button } from './ui';

// Pestañas de la barra principal (v2). `/shared` es un marcador hasta que exista su diseño.
const TABS = [
  ['vaults', '/vaults', 'Bóvedas'],
  ['shared', '/shared', 'Compartidas conmigo'],
  ['audit', '/audit', 'Auditoría'],
  ['security', '/security', 'Seguridad'],
];

/**
 * Encabezado de las pantallas con sesión (v2).
 * No guarda estado ni sesión: recibe la pestaña activa, el correo y qué hacer al salir.
 */
export default function AppHeader({ active, email, onLogout }) {
  return (
    <header className="h-[60px] border-b border-niebla bg-white">
      <div className="mx-auto flex h-full max-w-[1152px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Brand small />
          <nav aria-label="Principal" className="flex gap-1 overflow-x-auto">
            {TABS.map(([key, href, label]) => {
              const isActive = key === active;
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm leading-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia ${
                    isActive ? 'bg-niebla font-medium text-bosque' : 'text-bosque-soft hover:bg-niebla/60'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {email && <span className="hidden text-sm text-bosque-soft sm:inline">{email}</span>}
          <Button variant="secondary" onClick={onLogout}>Salir</Button>
        </div>
      </div>
    </header>
  );
}
