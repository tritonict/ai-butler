// /components/ui/Textarea.tsx
import React from 'react';

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
      {...props}
    />
  );
}