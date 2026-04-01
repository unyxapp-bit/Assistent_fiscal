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
  const resolvedClassName: HeroButtonProps['className'] =
    typeof className === 'function' ? (values) => cn(className(values)) : cn(className);

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
