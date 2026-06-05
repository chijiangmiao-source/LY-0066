import { useMemo } from 'preact/hooks';
import { useFlowerStore } from '@/store/useFlowerStore';
import { calcOutboundStats } from '@/services/statisticsService';

export function useOutboundStats() {
  const outboundRecords = useFlowerStore((s) => s.outboundRecords);

  return useMemo(() => calcOutboundStats(outboundRecords), [outboundRecords]);
}
