import React from 'react';
import { cn } from '../lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('card p-5', className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3 className={cn('font-display text-lg text-ink', className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p className={cn('text-sm text-muted', className)} {...props} />
  );
}
