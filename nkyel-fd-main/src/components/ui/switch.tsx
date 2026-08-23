'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.08)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent data-[state=checked]:bg-[var(--accent)]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className="pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-transform duration-200 data-[state=checked]:translate-x-5"
      />
    </SwitchPrimitive.Root>
  );
}
