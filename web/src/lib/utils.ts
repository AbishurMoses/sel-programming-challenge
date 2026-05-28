import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusGenerator(lastUpdated: Date): string {
  const now = new Date();
  const diffInSeconds = (now.getTime() - lastUpdated.getTime()) / 1000
  return  diffInSeconds < 30 ? 'Active' : diffInSeconds < 60 ? 'Stale' : 'Inactive';
}