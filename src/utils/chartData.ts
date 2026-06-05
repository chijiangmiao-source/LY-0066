import type { Flower, OperationRecord, OutboundRecord, UsageType, PackageUsageRecord, PackageType } from '@/types';
import { USAGE_TYPES, USAGE_TYPE_CHART_COLORS, PACKAGE_TYPE_CHART_COLORS, PACKAGE_TYPES } from '@/utils/constants';
import { getLastNDays, getLastNWeeks, isDateInRange } from '@/utils/helpers';
import { calcPopularPackages } from '@/services/statisticsService';

export interface PieChartDatum {
  label: string;
  value: number;
  color: string;
}

export interface BarChartDatum {
  label: string;
  value: number;
}

export interface GroupedBarDatum {
  label: string;
  [key: string]: string | number;
}

export function buildStatusDistributionData(flowers: Flower[]): PieChartDatum[] {
  const statusCounts = flowers.reduce((acc, flower) => {
    acc[flower.status] = (acc[flower.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { label: '正常', value: statusCounts['正常'] || 0, color: '#10b981' },
    { label: '偏低', value: statusCounts['偏低'] || 0, color: '#f59e0b' },
    { label: '缺货', value: statusCounts['缺货'] || 0, color: '#ef4444' },
    { label: '停用', value: statusCounts['停用'] || 0, color: '#9ca3af' },
  ].filter(d => d.value > 0);
}

const RECORD_CHART_ITEMS = [
  { key: '补货', color: '#10b981' },
  { key: '盘盈', color: '#3b82f6' },
  { key: '损耗', color: '#ef4444' },
  { key: '盘亏', color: '#f97316' },
] as const;

export function buildRecordTrendData(records: OperationRecord[]): GroupedBarDatum[] {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return last7Days.map(date => {
    const dayRecords = records.filter(r => r.date === date);
    return {
      label: date.slice(5),
      '补货': dayRecords.filter(r => r.type === '补货').reduce((sum, r) => sum + r.quantity, 0),
      '盘盈': dayRecords.filter(r => r.type === '盘盈').reduce((sum, r) => sum + r.quantity, 0),
      '损耗': dayRecords.filter(r => r.type === '损耗').reduce((sum, r) => sum + r.quantity, 0),
      '盘亏': dayRecords.filter(r => r.type === '盘亏').reduce((sum, r) => sum + r.quantity, 0),
    };
  });
}

export const recordChartItems = RECORD_CHART_ITEMS;

export function buildOutboundTrendData(
  records: OutboundRecord[],
  granularity: 'day' | 'week' = 'day'
): BarChartDatum[] {
  if (granularity === 'day') {
    const days = getLastNDays(7);
    const dailyLabels = days.map(d => d.slice(5));
    return days.map((date, idx) => ({
      label: dailyLabels[idx],
      value: records.filter(r => r.date === date).reduce((sum, r) => sum + r.quantity, 0),
    }));
  }
  const weeks = getLastNWeeks(4);
  return weeks.map(w => ({
    label: w.label,
    value: records.filter(r => isDateInRange(r.date, w.start, w.end)).reduce((sum, r) => sum + r.quantity, 0),
  }));
}

export function buildUsageDistributionData(records: OutboundRecord[]): PieChartDatum[] {
  const usageCounts = USAGE_TYPES.reduce((acc, usage) => {
    acc[usage] = records.filter(r => r.usage === usage).reduce((sum, r) => sum + r.quantity, 0);
    return acc;
  }, {} as Record<UsageType, number>);

  return USAGE_TYPES
    .map(u => ({ label: u, value: usageCounts[u], color: USAGE_TYPE_CHART_COLORS[u] }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function buildPopularPackageData(records: PackageUsageRecord[], limit = 5) {
  return calcPopularPackages(records, limit);
}

export function buildPackageUsageTrendData(
  records: PackageUsageRecord[],
  granularity: 'day' | 'week' = 'day'
): { label: string; count: number; quantity: number }[] {
  if (granularity === 'day') {
    const days = getLastNDays(7);
    const dailyLabels = days.map(d => d.slice(5));
    return days.map((date, idx) => ({
      label: dailyLabels[idx],
      count: records.filter(r => r.date === date).length,
      quantity: records.filter(r => r.date === date).reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0), 0),
    }));
  }
  const weeks = getLastNWeeks(4);
  return weeks.map(w => ({
    label: w.label,
    count: records.filter(r => isDateInRange(r.date, w.start, w.end)).length,
    quantity: records.filter(r => isDateInRange(r.date, w.start, w.end)).reduce((sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0), 0),
  }));
}

export function buildPackageTypeDistributionData(records: PackageUsageRecord[]): PieChartDatum[] {
  const typeCounts = PACKAGE_TYPES.reduce((acc, type) => {
    acc[type] = records.filter(r => r.packageType === type).length;
    return acc;
  }, {} as Record<PackageType, number>);

  return PACKAGE_TYPES
    .map(t => ({ label: t, value: typeCounts[t], color: PACKAGE_TYPE_CHART_COLORS[t] }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
}
