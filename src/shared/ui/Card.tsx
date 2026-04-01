import React from 'react';
import { cn } from '../lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-border bg-surface p-5 text-ink shadow-[0_18px_40px_-28px_rgba(4,6,14,0.7)]',
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
  return <h3 className={cn('font-display text-lg text-ink', className)} {...props} />;
}

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn('text-sm text-muted', className)} {...props} />;
}
