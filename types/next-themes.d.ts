declare module 'next-themes' {
  import type { ReactNode } from 'react';

  export interface ThemeProviderProps {
    children: ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    forcedTheme?: string;
    storageKey?: string;
    themes?: string[];
    value?: { [themeName: string]: string };
  }

  export interface UseThemeProps {
    themes?: string[];
    forcedTheme?: string;
    enableSystem?: boolean;
    defaultTheme?: string;
    attribute?: string;
    value?: { [themeName: string]: string };
  }

  export interface ThemeProviderState {
    theme: string;
    resolvedTheme: string;
    setTheme: (theme: string) => void;
    themes: string[];
    systemTheme?: string;
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
  export function useTheme(): ThemeProviderState;
} 