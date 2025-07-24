// /components/ui/Label.tsx
import React from 'react';

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{children}</label>;
}