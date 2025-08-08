// /components/ui/Card.tsx
import React from 'react';
import { cn } from "@/lib/utils";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded shadow-md border dark:border-zinc-700">
      {children}
    </div>
  );
}


export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}