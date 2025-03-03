declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initialArg: I,
    init?: (arg: I) => React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export function useLayoutEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  export function useImperativeHandle<T, R extends T>(
    ref: React.Ref<T> | undefined,
    init: () => R,
    deps?: React.DependencyList
  ): void;
  export function useDebugValue<T>(value: T, format?: (value: T) => any): void;
  export function useDeferredValue<T>(value: T): T;
  export function useTransition(): [boolean, React.TransitionStartFunction];
  export function useId(): string;
  export function useInsertionEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  export function useSyncExternalStore<Snapshot>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    getServerSnapshot?: () => Snapshot
  ): Snapshot;
  export const createContext: any;
  export const createElement: any;
  export const Fragment: any;
  
  // ForwardRef type
  export interface ForwardRefExoticComponent<P = {}> {
    (props: P): React.ReactNode;
    displayName?: string;
  }
  
  export function forwardRef<T, P = {}>(
    render: (props: P, ref: React.Ref<T>) => React.ReactNode
  ): ForwardRefExoticComponent<P & { ref?: React.Ref<T> }>;
  
  export const memo: any;
  export const lazy: any;
  export const Suspense: any;
  export const Component: any;
  export const PureComponent: any;
  export type FC<P = {}> = FunctionComponent<P>;
  export type FunctionComponent<P = {}> = (props: P) => any;
  export type ReactNode = any;
  export type EffectCallback = () => (void | (() => void));
  export type DependencyList = ReadonlyArray<any>;
  export type Reducer<S, A> = (prevState: S, action: A) => S;
  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  export type Dispatch<A> = (value: A) => void;
  export type Ref<T> = { current: T | null } | ((instance: T | null) => void);
  export type TransitionStartFunction = (callback: () => void) => void;
  export type Context<T> = {
    Provider: any;
    Consumer: any;
    displayName?: string;
  };

  // HTML Attributes
  export interface HTMLAttributes<T> {
    className?: string;
    id?: string;
    style?: any;
    onClick?: (event: any) => void;
    onMouseDown?: (event: any) => void;
    onMouseUp?: (event: any) => void;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: (event: any) => void;
    onFocus?: (event: any) => void;
    onBlur?: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onKeyUp?: (event: any) => void;
    onKeyPress?: (event: any) => void;
    tabIndex?: number;
    role?: string;
    [key: string]: any;
  }

  // Button HTML Attributes
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    form?: string;
    formAction?: string;
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    name?: string;
    value?: string | string[] | number;
  }

  // Input HTML Attributes
  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    accept?: string;
    alt?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    capture?: boolean | string;
    checked?: boolean;
    disabled?: boolean;
    form?: string;
    formAction?: string;
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    height?: number | string;
    list?: string;
    max?: number | string;
    maxLength?: number;
    min?: number | string;
    minLength?: number;
    multiple?: boolean;
    name?: string;
    pattern?: string;
    placeholder?: string;
    readOnly?: boolean;
    required?: boolean;
    size?: number;
    src?: string;
    step?: number | string;
    type?: string;
    value?: string | string[] | number;
    width?: number | string;
  }

  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
    type: string;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }

  export interface Element {}
} 