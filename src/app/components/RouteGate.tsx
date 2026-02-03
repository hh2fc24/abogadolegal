'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type Rule =
  | { type: 'startsWith'; value: string }
  | { type: 'equals'; value: string }
  | { type: 'regex'; value: RegExp };

function matches(path: string, rules: Rule[]) {
  return rules.some(r => {
    if (r.type === 'startsWith') return path.startsWith(r.value);
    if (r.type === 'equals') return path === r.value;
    if (r.type === 'regex') return r.value.test(path);
    return false;
  });
}

/** Oculta children en rutas restringidas (lista negra). */
export default function RouteGate({
  children,
  blacklist = [],
}: {
  children: ReactNode;
  blacklist?: Rule[];
}) {
  const pathname = usePathname() || '/';
  if (matches(pathname, blacklist)) return null;
  return <>{children}</>;
}