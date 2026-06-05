// @ts-nocheck
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-preact';
import { cn } from '@/utils/helpers';

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: preact.ComponentChildren;
  title?: string;
  description?: string;
  children: preact.ComponentChildren;
  className?: string;
}

export function Drawer({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange as any}>
      {trigger && (
        <DialogPrimitive.Trigger asChild>
          {trigger as any}
        </DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogPrimitive.Content
          className={cn(
            'fixed right-0 top-0 h-full z-50 w-full max-w-md bg-white shadow-xl',
            className
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex-1">
                {title && (
                  <DialogPrimitive.Title className="text-lg font-semibold text-gray-900">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-gray-500 mt-1">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
