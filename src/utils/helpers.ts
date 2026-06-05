import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateString(d));
  }
  return days;
}

export function getLastNWeeks(n: number): { label: string; start: string; end: string }[] {
  const weeks: { label: string; start: string; end: string }[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const currentWeekEnd = new Date(today);
  currentWeekEnd.setDate(today.getDate() + (7 - dayOfWeek));

  for (let i = n - 1; i >= 0; i--) {
    const end = new Date(currentWeekEnd);
    end.setDate(currentWeekEnd.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const weekNum = Math.ceil((end.getDate() + new Date(end.getFullYear(), end.getMonth(), 1).getDay()) / 7);
    weeks.push({
      label: `${end.getMonth() + 1}月第${weekNum}周`,
      start: getDateString(start),
      end: getDateString(end),
    });
  }
  return weeks;
}

export function isDateInRange(date: string, from: string, to: string): boolean {
  const d = new Date(date).getTime();
  const f = from ? new Date(from).getTime() : -Infinity;
  const t = to ? new Date(to).getTime() + 86400000 : Infinity;
  return d >= f && d < t;
}

export function isValidOperatorName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z·]+$/;
  return validPattern.test(trimmed) && trimmed.length >= 2 && trimmed.length <= 20;
}

export function isValidRecipientName(name: string): boolean {
  return isValidOperatorName(name);
}
