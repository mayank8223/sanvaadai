import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes with clsx and tailwind-merge.
 * Used by shadcn/ui components for variant-based styling.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
