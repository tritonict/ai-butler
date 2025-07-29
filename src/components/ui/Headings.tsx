// /components/ui/Headings.tsx
import React from 'react';

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{children}</h1>;
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">{children}</h3>;
}