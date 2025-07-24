// /components/ui/Card.tsx
import React from 'react';

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow-md border dark:border-zinc-700">
      {children}
    </div>
  );
}