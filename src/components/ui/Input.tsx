// /components/ui/Input.tsx
import React from 'react';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
      {...props}
    />
  );
}