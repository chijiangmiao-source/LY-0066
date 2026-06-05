import { useMemo } from 'preact/hooks';
import { useFlowerStore } from '@/store/useFlowerStore';
import { calcPackageStats, calcPopularPackages } from '@/services/statisticsService';

export function usePackageStats(limit = 5) {
  const packageTemplates = useFlowerStore((s) => s.packageTemplates);
  const packageUsageRecords = useFlowerStore((s) => s.packageUsageRecords);

  const stats = useMemo(
    () => calcPackageStats(packageTemplates, packageUsageRecords),
    [packageTemplates, packageUsageRecords]
  );

  const popularPackages = useMemo(
    () => calcPopularPackages(packageUsageRecords, limit),
    [packageUsageRecords, limit]
  );

  return { ...stats, popularPackages };
}
