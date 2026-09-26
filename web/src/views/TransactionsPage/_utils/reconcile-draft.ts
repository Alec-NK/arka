/** Refresh untouched fields while retaining every field the user edited. */
export function reconcileDraft<T extends object>(baseline: T, draft: T, latest: T): { values: T; changed: (keyof T)[] } {
  const values = { ...draft };
  const changed: (keyof T)[] = [];
  for (const key of Object.keys(latest) as (keyof T)[]) {
    if (latest[key] !== baseline[key]) changed.push(key);
    if (draft[key] === baseline[key]) values[key] = latest[key];
  }
  return { values, changed };
}
