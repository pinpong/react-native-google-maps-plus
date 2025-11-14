import type { Struct, StructError } from 'superstruct';

export function getSchemaNodeAtPath<T>(
  validator: Struct<T, any>,
  path: Array<string | number>
): any | null {
  let node: any = (validator as any)?.schema;
  if (!node) return null;

  for (const seg of path) {
    if (!node) return null;
    if (
      node.type === 'object' &&
      node.schema &&
      typeof node.schema === 'object'
    ) {
      node = node.schema[seg as any];
      continue;
    }

    if (node && typeof node === 'object' && seg in node) {
      node = node[seg as any];
      continue;
    }
    return null;
  }
  return node || null;
}

export function extractAllowedValuesFromNode(node: any): string[] | null {
  if (!node || typeof node !== 'object') return null;

  if (node.type === 'union' && Array.isArray(node._schema)) {
    const vals: string[] = node._schema
      .map((s: any) => String(s?.schema))
      .filter((v: any) => typeof v === 'string');
    return vals.length ? [...new Set(vals)] : null;
  }

  if (node.type === 'enums' && node.schema && typeof node.schema === 'object') {
    const vals = Object.values(node.schema)
      .filter((v) => typeof v === 'string' || typeof v === 'number')
      .map(String);
    const strOnly = vals.filter((v) => isNaN(Number(v)));
    return (strOnly.length ? strOnly : vals).length
      ? [...new Set(strOnly.length ? strOnly : vals)]
      : null;
  }

  if (node.type === 'literal') {
    const lit = node.schema;
    if (typeof lit === 'string' || typeof lit === 'number')
      return [String(lit)];
  }

  return null;
}

export function formatSuperstructError<T>(
  err: StructError,
  validator: Struct<T, any>
): string {
  const path = err.path ?? [];
  const pathStr = path.length ? path.join('.') : '(root)';

  const node = getSchemaNodeAtPath(validator, path);

  const allowed = extractAllowedValuesFromNode(node);
  if (allowed && allowed.length) {
    return `${pathStr}: must be one of ${allowed.map((v) => `"${v}"`).join(', ')}`;
  }

  if (node?.type && ['number', 'boolean', 'string'].includes(node.type)) {
    return `${pathStr}: expected ${node.type}`;
  }

  return `${pathStr}: ${err.message}`;
}

export function stringifyWithUndefined(obj: any) {
  return JSON.stringify(
    obj,
    (_, v) => (v === undefined ? '__undefined__' : v),
    2
  ).replace(/"__undefined__"/g, 'undefined');
}

export function parseWithUndefined(json: string) {
  const fixed = json.replace(/\bundefined\b/g, '"__undefined__"');
  return JSON.parse(fixed, (_, v) => (v === '__undefined__' ? undefined : v));
}
