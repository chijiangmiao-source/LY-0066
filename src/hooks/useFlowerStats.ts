import { useMemo } from 'preact/hooks';
import { useFlowerStore } from '@/store/useFlowerStore';
import { calcFlowerStats } from '@/services/statisticsService';

export function useFlowerStats() {
  const flowers = useFlowerStore((s) => s.flowers);
  const records = useFlowerStore((s) => s.records);

  return useMemo(() => calcFlowerStats(flowers, records), [flowers, records]);
}
