import React from 'react';
import { cn } from '../lib/cn';

type CardVariant = 'default' | 'emerald';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants: Record<CardVariant, string> = {
    default:
      'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[0_18px_36px_-26px_rgba(5,150,105,0.18)]',
    emerald:
      'border border-transparent bg-primary text-white shadow-[0_22px_40px_-26px_rgba(5,150,105,0.45)]',
  };

  return (
    <div
      className={cn('rounded-[24px] p-5', variants[variant], className)}
      {...props}
    />
  );
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
