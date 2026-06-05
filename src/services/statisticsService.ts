import type { Flower, OperationRecord, OutboundRecord, PackageUsageRecord, PackageTemplate, RecordType } from '@/types';
import { getTodayDateString } from '@/utils/helpers';

export interface FlowerStats {
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalReplenish: number;
  totalWaste: number;
  totalSurplus: number;
  totalShortage: number;
}

export function calcFlowerStats(flowers: Flower[], records: OperationRecord[]): FlowerStats {
  const totalStock = flowers.reduce((sum, f) => sum + f.currentStock, 0);
  const lowStockCount = flowers.filter(f => f.status === '偏低').length;
  const outOfStockCount = flowers.filter(f => f.status === '缺货').length;
  const totalReplenish = sumRecordsByType(records, '补货');
  const totalWaste = sumRecordsByType(records, '损耗');
  const totalSurplus = sumRecordsByType(records, '盘盈');
  const totalShortage = sumRecordsByType(records, '盘亏');

  return {
    totalStock,
    lowStockCount,
    outOfStockCount,
    totalReplenish,
    totalWaste,
    totalSurplus,
    totalShortage,
  };
}

export function sumRecordsByType(records: OperationRecord[], type: RecordType): number {
  return records.filter(r => r.type === type).reduce((sum, r) => sum + r.quantity, 0);
}

export interface OutboundStats {
  totalOutbound: number;
  todayOutbound: number;
  recordCount: number;
  recipientCount: number;
}

export function calcOutboundStats(outboundRecords: OutboundRecord[]): OutboundStats {
  const totalOutbound = outboundRecords.reduce((sum, r) => sum + r.quantity, 0);
  const today = getTodayDateString();
  const todayOutbound = outboundRecords.filter(r => r.date === today).reduce((sum, r) => sum + r.quantity, 0);

  return {
    totalOutbound,
    todayOutbound,
    recordCount: outboundRecords.length,
    recipientCount: outboundRecords.length,
  };
}

export interface PackageStats {
  totalPackages: number;
  totalPackageUsage: number;
  todayPackageUsage: number;
  totalPackageFlowers: number;
}

export function calcPackageStats(
  packageTemplates: PackageTemplate[],
  packageUsageRecords: PackageUsageRecord[]
): PackageStats {
  const today = getTodayDateString();
  const todayPackageUsage = packageUsageRecords.filter(r => r.date === today).length;
  const totalPackageFlowers = packageUsageRecords.reduce(
    (sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0),
    0
  );

  return {
    totalPackages: packageTemplates.length,
    totalPackageUsage: packageUsageRecords.length,
    todayPackageUsage,
    totalPackageFlowers,
  };
}

export interface PopularPackage {
  packageId: string;
  packageName: string;
  count: number;
  totalQuantity: number;
}

export function calcPopularPackages(
  packageUsageRecords: PackageUsageRecord[],
  limit = 5
): PopularPackage[] {
  const pkgMap = new Map<string, PopularPackage>();

  for (const record of packageUsageRecords) {
    const existing = pkgMap.get(record.packageId);
    const qty = record.items.reduce((sum, i) => sum + i.quantity, 0);
    if (existing) {
      existing.count += 1;
      existing.totalQuantity += qty;
    } else {
      pkgMap.set(record.packageId, {
        packageId: record.packageId,
        packageName: record.packageName || '未知套餐',
        count: 1,
        totalQuantity: qty,
      });
    }
  }

  return Array.from(pkgMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getStatusDistribution(flowers: Flower[]): Record<string, number> {
  return flowers.reduce((acc, flower) => {
    acc[flower.status] = (acc[flower.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function sumQuantities<T extends { quantity: number }>(items: T[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
