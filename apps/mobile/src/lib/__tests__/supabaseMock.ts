// Test-only helper (not collected by Vitest — no `.test.ts` suffix).
//
// A chainable stand-in for a Supabase PostgREST query builder, so service tests
// never touch the real client (apps/mobile/src/lib/supabase.ts validates env and
// reads SecureStore at import). Every filter/modifier method returns the same
// chain; the terminal points — `single()`, `maybeSingle()`, and awaiting the
// chain directly — resolve to `{ data, error }`.

export type MockResolved = { data: unknown; error: { message: string } | null };
export type MockResult = { data?: unknown; error?: { message: string } | null };

export function queryResult(result: MockResult = {}) {
  const settled: Promise<MockResolved> = Promise.resolve({
    data: result.data ?? null,
    error: result.error ?? null,
  });

  const chain = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    upsert: () => chain,
    eq: () => chain,
    neq: () => chain,
    gt: () => chain,
    gte: () => chain,
    lt: () => chain,
    lte: () => chain,
    in: () => chain,
    is: () => chain,
    not: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    filter: () => chain,
    match: () => chain,
    single: () => settled,
    maybeSingle: () => settled,
    then: <TResult1 = MockResolved, TResult2 = never>(
      onFulfilled?: ((value: MockResolved) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> => settled.then(onFulfilled, onRejected),
  };

  return chain;
}
