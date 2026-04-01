import React from 'react';
import { Card as HeroCard } from '@heroui/react';
import { cn } from '../lib/cn';

export type CardProps = React.ComponentProps<typeof HeroCard>;

export function Card({ className, ...props }: CardProps) {
  return <HeroCard className={cn('p-5', className)} {...props} />;
}

export type CardHeaderProps = React.ComponentProps<typeof HeroCard.Header>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <HeroCard.Header className={cn('flex items-start justify-between gap-4', className)} {...props} />
  );
}

export type CardTitleProps = React.ComponentProps<typeof HeroCard.Title>;

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <HeroCard.Title className={cn('font-display text-lg text-ink', className)} {...props} />;
}

export type CardDescriptionProps = React.ComponentProps<typeof HeroCard.Description>;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <HeroCard.Description className={cn('text-sm text-muted', className)} {...props} />;
}
