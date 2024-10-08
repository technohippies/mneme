import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const truncateTitle = (title: string, maxLength: number): string => {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
};
