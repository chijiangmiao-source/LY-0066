import type { ComponentProps } from 'preact';
import { cn } from '@/utils/helpers';

interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
