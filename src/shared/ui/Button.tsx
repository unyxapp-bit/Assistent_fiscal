import React from 'react';
import { Button as HeroButton } from '@heroui/react';
import { cn } from '../lib/cn';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type HeroButtonProps = React.ComponentProps<typeof HeroButton>;

export type ButtonProps = Omit<HeroButtonProps, 'variant' | 'size' | 'isDisabled'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isDisabled?: boolean;
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  isDisabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'rounded-full font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-accent shadow-[0_10px_18px_-12px_rgba(14,165,233,0.35)]',
    outline: 'border border-border text-primary hover:bg-emerald-50 hover:text-primaryDark',
    ghost: 'text-primary hover:bg-emerald-50',
    danger: 'bg-danger text-red-900 hover:bg-danger/80',
  };
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const resolvedClassName: HeroButtonProps['className'] =
    typeof className === 'function'
      ? (values) =>
          cn(baseClasses, variantClasses[variant], sizeClasses[size], className(values))
      : cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  return (
    <HeroButton
      className={resolvedClassName}
      variant={variant}
      size={size}
      isDisabled={disabled ?? isDisabled}
      {...props}
    />
  );
}
