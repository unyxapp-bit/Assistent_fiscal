import React from 'react';
import { cn } from '../lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[24px] border p-5 text-[var(--color-text-primary)] bg-[var(--color-surface)] border-[var(--color-border)] shadow-[0_18px_36px_-26px_rgba(5,150,105,0.18)]',
        className
      )}
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
