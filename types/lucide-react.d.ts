declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type Icon = ComponentType<IconProps>;

  export const Clock: Icon;
  export const Moon: Icon;
  export const Sun: Icon;
  export const MapPin: Icon;
} 