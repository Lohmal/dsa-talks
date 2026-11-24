// Site texts are kept as one tree in which every text is a { tr, en } pair (a paragraph list
// is a pair of lists), so both languages are edited side by side and the tree keeps a single
// structure. Pages get the plain tree of one language through localize().

export type Locale = "en" | "tr";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isText = (value: unknown) =>
  typeof value === "string" || (Array.isArray(value) && value.every((item) => typeof item === "string"));

// A { tr, en } pair: exactly these two keys, both texts or both lists of texts.
export function isPair(value: unknown): value is { en: string | string[]; tr: string | string[] } {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 2 && "en" in value && "tr" in value && isText(value.en) && isText(value.tr);
}

// Joins the English and the Turkish message trees (same shape) into one tree of pairs.
export function toBilingual(en: unknown, tr: unknown): unknown {
  if (isText(en)) return { en, tr: isText(tr) ? tr : en };
  if (Array.isArray(en)) return en.map((item, i) => toBilingual(item, Array.isArray(tr) ? tr[i] : undefined));
  if (isPlainObject(en)) {
    const other = isPlainObject(tr) ? tr : {};
    return Object.fromEntries(Object.entries(en).map(([key, value]) => [key, toBilingual(value, other[key])]));
  }
  return en; // numbers, booleans
}

// The tree of one language.
export function localize<T>(tree: unknown, locale: Locale): T {
  const walk = (node: unknown): unknown => {
    if (isPair(node)) return node[locale];
    if (Array.isArray(node)) return node.map(walk);
    if (isPlainObject(node)) return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, walk(value)]));
    return node;
  };
  return walk(tree) as T;
}

// Saved content over the defaults from the code: objects are merged key by key (so texts
// added to the code later still appear), anything else (texts, pairs, lists) is taken from
// the saved side when it has the same kind of value.
export function withDefaults<T>(defaults: T, saved: unknown): T {
  if (saved === undefined || saved === null) return defaults;
  if (isPair(defaults)) return (isPair(saved) ? saved : defaults) as T;
  if (isPlainObject(defaults)) {
    if (!isPlainObject(saved)) return defaults;
    const merged: Record<string, unknown> = { ...saved };
    for (const [key, value] of Object.entries(defaults)) merged[key] = withDefaults(value, saved[key]);
    return merged as T;
  }
  if (Array.isArray(defaults)) return (Array.isArray(saved) ? saved : defaults) as T;
  return (typeof saved === typeof defaults ? saved : defaults) as T;
}
