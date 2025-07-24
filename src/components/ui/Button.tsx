// /components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'red' | 'yellow' | 'green';
  children: React.ReactNode;
}

export function Button({ variant = 'blue', children, ...props }: ButtonProps) {
  const base = 'text-white font-bold py-2 px-4 rounded focus:outline-none';
  const variants = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}