import type { ComponentProps } from 'preact';
import { cn } from '@/utils/helpers';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
