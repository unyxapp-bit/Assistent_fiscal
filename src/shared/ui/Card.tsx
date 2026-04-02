import React from 'react';
import { cn } from '../lib/cn';

type CardVariant = 'default' | 'emerald';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants: Record<CardVariant, string> = {
    default: 'card',
    emerald: 'card card-emerald',
  };

  return <div className={cn(variants[variant], className)} {...props} />;
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn('flex items-start justify-between gap-4', className)} {...props} />;
}

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('font-display text-lg text-[var(--color-text-primary)]', className)} {...props} />
  );
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-[var(--color-text-secondary)]', className)} {...props} />
  );
}
