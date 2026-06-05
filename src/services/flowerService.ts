import type { Flower, FlowerStatus, PackageFlowerItem } from '@/types';
import { generateId } from '@/utils/helpers';

export function calculateFlowerStatus(currentStock: number, safeStock: number): FlowerStatus {
  if (currentStock === 0) return '缺货';
  if (currentStock < safeStock) return '偏低';
  return '正常';
}

export function generateFlowerId(existingIds: string[]): string {
  const num = existingIds.length + 1;
  const id = `FL${num.toString().padStart(3, '0')}`;
  if (!existingIds.includes(id)) return id;
  return `FL${Date.now().toString().slice(-6)}`;
}

export function updateFlowerStock(
  flower: Flower,
  newStock: number
): Flower {
  return {
    ...flower,
    currentStock: newStock,
    status: calculateFlowerStatus(newStock, flower.safeStock),
    updatedAt: new Date().toISOString(),
  };
}

export function applyStockDelta(
  flower: Flower,
  delta: number
): Flower {
  const newStock = Math.max(0, flower.currentStock + delta);
  return updateFlowerStock(flower, newStock);
}

export function createFlowerWithDefaults(
  data: Partial<Flower> & { id: string; name: string; type: string; currentStock: number; safeStock: number }
): Flower {
  const now = new Date().toISOString();
  return {
    location: '',
    status: calculateFlowerStatus(data.currentStock, data.safeStock),
    createdAt: now,
    updatedAt: now,
    ...data,
  };
}

export function canDeductStock(flower: Flower | undefined, quantity: number): boolean {
  if (!flower) return false;
  if (flower.status === '停用') return false;
  return flower.currentStock >= quantity;
}

export function canDeductPackageStock(
  flowers: Flower[],
  items: PackageFlowerItem[]
): { ok: boolean; details: { flowerId: string; flowerName: string; need: number; stock: number; ok: boolean }[] } {
  const details = items.map((item) => {
    const flower = flowers.find((f) => f.id === item.flowerId);
    return {
      flowerId: item.flowerId,
      flowerName: flower?.name || item.flowerName || '未知',
      need: item.quantity,
      stock: flower?.currentStock ?? 0,
      ok: canDeductStock(flower, item.quantity),
    };
  });
  return {
    ok: details.every((d) => d.ok),
    details,
  };
}

export function enrichPackageFlowerItems(
  flowers: Flower[],
  items: PackageFlowerItem[]
): PackageFlowerItem[] {
  return items.map((item) => {
    const flower = flowers.find((f) => f.id === item.flowerId);
    return {
      ...item,
      flowerName: flower?.name ?? item.flowerName,
    };
  });
}

export function generatePackageId(): string {
  return `PKG${Date.now().toString().slice(-6)}`;
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function sortByUpdatedAtDesc<T extends { updatedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function makeOperationRecordId(): string {
  return generateId();
}
