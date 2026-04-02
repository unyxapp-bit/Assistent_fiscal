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
    'btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
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
