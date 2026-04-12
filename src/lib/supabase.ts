import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from '@/config/env'

/**
 * If VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing, fall back to an
 * offline stub client. The stub satisfies the call signatures used in
 * AppContext + supabaseApi (auth + chainable PostgREST query builder) so the
 * app can render the landing page and other static UI without a backend.
 *
 * Auth calls return "no session". Data queries return empty arrays. To enable
 * real auth + data, copy .env.example → .env and fill in the Supabase keys.
 */

const FALLBACK_ERROR = {
  message:
    'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable auth and data features.',
  name: 'SupabaseNotConfigured',
}

function createStubQueryBuilder() {
  const emptyArrayResult = { data: [], error: null }
  const emptyArrayPromise = Promise.resolve(emptyArrayResult)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    upsert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    lt: () => builder,
    gte: () => builder,
    lte: () => builder,
    in: () => builder,
    or: () => builder,
    and: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    not: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    // Make the builder itself awaitable so any point in the chain resolves.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: (onfulfilled: any, onrejected: any) => emptyArrayPromise.then(onfulfilled, onrejected),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch: (onrejected: any) => emptyArrayPromise.catch(onrejected),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finally: (onfinally: any) => emptyArrayPromise.finally(onfinally),
  }
  return builder
}

const stubClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signInWithPassword: () =>
      Promise.resolve({ data: { user: null, session: null }, error: FALLBACK_ERROR }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: FALLBACK_ERROR }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: (_table: string) => createStubQueryBuilder(),
}

export const supabase: SupabaseClient = (() => {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    if (typeof console !== 'undefined') {
      console.warn(
        '[supabase] Credentials missing — using offline stub. Copy .env.example to .env and set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to enable real auth and data.'
      )
    }
    return stubClient as unknown as SupabaseClient
  }
  return createClient(config.supabaseUrl, config.supabaseAnonKey)
})()
