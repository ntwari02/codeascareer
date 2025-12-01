// Frontend-only stub for Supabase.
// You said you're not using a backend right now, so this file is made safe
// to import without requiring any environment variables.

// If you later add a real Supabase backend, replace this stub with the
// official client setup using your project URL and anon key.

// Minimal "no-op" supabase object that matches the methods your code may call.
// All methods just log a warning and return a safe placeholder.

type AnyFn = (...args: any[]) => Promise<{ data: null; error: Error }>;

const makeNoopFn =
  (name: string): AnyFn =>
  async () => {
    console.warn(`[Supabase stub] Called ${name} but Supabase is not configured.`);
    return { data: null, error: new Error('Supabase is not configured (frontend-only mode).') };
  };

export const supabase = {
  auth: {
    signInWithPassword: makeNoopFn('auth.signInWithPassword'),
    signUp: makeNoopFn('auth.signUp'),
    signOut: makeNoopFn('auth.signOut'),
    resetPasswordForEmail: makeNoopFn('auth.resetPasswordForEmail'),
    verifyOtp: makeNoopFn('auth.verifyOtp'),
    updateUser: makeNoopFn('auth.updateUser'),
    getUser: makeNoopFn('auth.getUser'),
    getSession: makeNoopFn('auth.getSession'),
  },
  from(_table: string) {
    // Return an object with common query methods as no-ops
    return {
      select: makeNoopFn('from().select'),
      insert: makeNoopFn('from().insert'),
      update: makeNoopFn('from().update'),
      delete: makeNoopFn('from().delete'),
      eq: makeNoopFn('from().eq'),
      in: makeNoopFn('from().in'),
      ilike: makeNoopFn('from().ilike'),
      limit: makeNoopFn('from().limit'),
      order: makeNoopFn('from().order'),
      single: makeNoopFn('from().single'),
    };
  },
};
