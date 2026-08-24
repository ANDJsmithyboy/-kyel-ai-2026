/* TypeScript module declarations for zustand */
declare module 'zustand' {
  export function create<T = any>(fn?: any): any;
  export default create;
}

declare module 'zustand/middleware' {
  export function persist<T = any>(fn: any, options: any): any;
}
