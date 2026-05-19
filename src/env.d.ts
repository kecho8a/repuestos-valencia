declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
    // otras variables VITE_ que necesites
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Ambient module declaration to avoid TS2307 until package is installed
declare module '@supabase/supabase-js' {
  type SupabaseClient = any;
  export function createClient(url: string, key: string): SupabaseClient;
  const _default: { createClient: typeof createClient };
  export default _default;
}

export {};
