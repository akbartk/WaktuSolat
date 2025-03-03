declare module 'next/font/google' {
  export interface FontOptions {
    weight?: string | string[];
    style?: string | string[];
    subsets?: string[];
    display?: string;
    variable?: string;
    preload?: boolean;
    fallback?: string[];
    adjustFontFallback?: boolean;
    [key: string]: any;
  }

  export function Inter(options: FontOptions): {
    className: string;
    style: { fontFamily: string };
  };
} 