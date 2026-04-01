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
  return (
    <HeroButton
      className={cn(className)}
      variant={variant}
      size={size}
      isDisabled={disabled ?? isDisabled}
      {...props}
    />
  );
}
