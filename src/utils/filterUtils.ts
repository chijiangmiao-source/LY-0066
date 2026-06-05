import type { OutboundFilters, PackageFilters, PackageUsageFilters, OutboundRecord, PackageTemplate, PackageUsageRecord, OperationRecord, FlowerStatus, Flower } from '@/types';
import { isDateInRange } from '@/utils/helpers';
import { sortByDateDesc, sortByUpdatedAtDesc } from '@/services/flowerService';

export interface DateRangeFilter {
  dateFrom?: string;
  dateTo?: string;
}

export function applyDateRangeFilter<T extends { date: string }>(
  items: T[],
  dateFrom?: string,
  dateTo?: string
): T[] {
  if (!dateFrom && !dateTo) return items;
  return items.filter(item => isDateInRange(item.date, dateFrom || '', dateTo || ''));
}

export function applyDateRangeFilterForCreated<T extends { createdAt: string }>(
  items: T[],
  dateFrom?: string,
  dateTo?: string
): T[] {
  if (!dateFrom && !dateTo) return items;
  return items.filter(item => isDateInRange(item.createdAt.slice(0, 10), dateFrom || '', dateTo || ''));
}

export function applyTextFilter<T>(
  items: T[],
  field: keyof T,
  keyword?: string
): T[] {
  if (!keyword || !keyword.trim()) return items;
  const trimmed = keyword.trim();
  return items.filter(item => {
    const value = item[field];
    return typeof value === 'string' && value.includes(trimmed);
  });
}

export function applyExactFilter<T>(
  items: T[],
  field: keyof T,
  value?: string | 'all'
): T[] {
  if (!value || value === 'all') return items;
  return items.filter(item => item[field] === value);
}

export function filterOutboundRecords(
  records: OutboundRecord[],
  filters: Partial<OutboundFilters>
): OutboundRecord[] {
  const { usage, dateFrom, dateTo, recipient } = filters;
  let result = [...records];
  result = applyExactFilter(result, 'usage', usage);
  result = applyDateRangeFilter(result, dateFrom, dateTo);
  result = applyTextFilter(result, 'recipient', recipient);
  return sortByDateDesc(result);
}

export function filterPackageTemplates(
  templates: PackageTemplate[],
  filters: Partial<PackageFilters>
): PackageTemplate[] {
  const { type, dateFrom, dateTo, createdBy } = filters;
  let result = [...templates];
  result = applyExactFilter(result, 'type', type);
  result = applyDateRangeFilterForCreated(result, dateFrom, dateTo);
  result = applyTextFilter(result, 'createdBy', createdBy);
  return sortByUpdatedAtDesc(result);
}

export function filterPackageUsageRecords(
  records: PackageUsageRecord[],
  filters: Partial<PackageUsageFilters>
): PackageUsageRecord[] {
  const { packageType, dateFrom, dateTo, createdBy } = filters;
  let result = [...records];
  result = applyExactFilter(result, 'packageType', packageType);
  result = applyDateRangeFilter(result, dateFrom, dateTo);
  result = applyTextFilter(result, 'createdBy', createdBy);
  return sortByDateDesc(result);
}

export function filterFlowerRecordsByType(
  records: OperationRecord[],
  flowerId: string
): OperationRecord[] {
  return sortByDateDesc(records.filter(r => r.flowerId === flowerId));
}

export function filterFlowersByQuickFilter(
  flowers: Flower[],
  filter: 'all' | 'low' | 'out'
): Flower[] {
  if (filter === 'all') return flowers;
  const status: FlowerStatus = filter === 'low' ? '偏低' : '缺货';
  return flowers.filter(f => f.status === status);
}
