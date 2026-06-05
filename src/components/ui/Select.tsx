// @ts-nocheck
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-preact';
import { cn } from '@/utils/helpers';

interface SelectProps {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: preact.ComponentChildren;
  className?: string;
}

export function Select({
  label,
  value,
  onValueChange,
  placeholder = '请选择',
  children,
  className,
}: SelectProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange as any}>
        <SelectPrimitive.Trigger
          className={cn(
            'inline-flex items-center justify-between w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: preact.ComponentChildren;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({ value, children, className, disabled }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        'relative flex items-center h-9 px-8 rounded-md text-sm text-gray-700 cursor-pointer select-none hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
        disabled && 'text-gray-400 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
        <Check className="h-4 w-4 text-primary-600" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
