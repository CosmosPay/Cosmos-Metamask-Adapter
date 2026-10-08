import { setTheme, useTheme } from '@/lib/theme';

/** Light / dark switch for the nav; shows the mode it switches to. */
export function ThemeToggle() {
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={next === 'dark' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={next === 'dark' ? 'Modo oscuro' : 'Modo claro'}
      onClick={() => setTheme(next)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {next === 'dark' ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
