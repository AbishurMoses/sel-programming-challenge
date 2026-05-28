import { useEffect, useState } from 'react';
import { apiService } from '@/services/apiService';
import type { ResolvedTheme, Theme } from '@/types/api';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(theme: Theme): ResolvedTheme {
  if (theme === 'auto') return systemPrefersDark() ? 'dark' : 'light';
  return theme;
}

export function getInitialTheme(): Theme {
  const stored = apiService.getSettings().theme;
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  return 'auto';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', resolve(theme) === 'dark');
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return {
    theme,
    resolvedTheme: resolve(theme),
    setTheme: setThemeState,
  };
}
