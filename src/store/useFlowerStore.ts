import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Flower,
  OperationRecord,
  FlowerStore,
  StocktakeData,
  OutboundRecord,
  OutboundFilters,
  PackageTemplate,
  PackageUsageRecord,
  PackageFilters,
  PackageUsageFilters,
  UsageType,
} from '@/types';
import { FLOWER_TYPES } from '@/utils/constants';
import {
  initialFlowers,
  initialRecords,
  initialOutboundRecords,
  initialPackageTemplates,
  initialPackageUsageRecords,
} from '@/store/initialData';
import {
  calculateFlowerStatus,
  updateFlowerStock,
  enrichPackageFlowerItems,
  generatePackageId,
  makeOperationRecordId,
  canDeductStock,
  canDeductPackageStock,
} from '@/services/flowerService';
import { generateId } from '@/utils/helpers';
import {
  filterOutboundRecords,
  filterPackageTemplates,
  filterPackageUsageRecords,
  filterFlowerRecordsByType,
} from '@/utils/filterUtils';
import { calcPopularPackages } from '@/services/statisticsService';

export const useFlowerStore = create<FlowerStore>()(
  persist(
    (set, get) => ({
      flowers: initialFlowers,
      records: initialRecords,
      outboundRecords: initialOutboundRecords,
      flowerTypes: FLOWER_TYPES,
      packageTemplates: initialPackageTemplates,
      packageUsageRecords: initialPackageUsageRecords,

      calculateStatus: calculateFlowerStatus,

      addFlowerType: (type) => {
        set((state) => ({
          flowerTypes: state.flowerTypes.includes(type) ? state.flowerTypes : [...state.flowerTypes, type],
        }));
      },

      addFlower: (flowerData) => {
        set((state) => ({
          flowers: [...state.flowers, flowerData],
        }));
      },

      updateFlower: (id, flowerData) => {
        set((state) => {
          const newId = flowerData.id ?? id;
          const updatedFlowers = state.flowers.map((flower) => {
            if (flower.id === id) {
              const currentStock = flowerData.currentStock ?? flower.currentStock;
              const safeStock = flowerData.safeStock ?? flower.safeStock;
              const status = flowerData.status ?? calculateFlowerStatus(currentStock, safeStock);
              return {
                ...flower,
                ...flowerData,
                id: newId,
                status,
                updatedAt: new Date().toISOString(),
              };
            }
            return flower;
          });

          const updatedRecords = newId !== id
            ? state.records.map((record) =>
                record.flowerId === id ? { ...record, flowerId: newId } : record
              )
            : state.records;

          const updatedOutboundRecords = newId !== id
            ? state.outboundRecords.map((record) =>
                record.flowerId === id ? { ...record, flowerId: newId } : record
              )
            : state.outboundRecords;

          return {
            flowers: updatedFlowers,
            records: updatedRecords,
            outboundRecords: updatedOutboundRecords,
          };
        });
      },

      deleteFlower: (id) => {
        set((state) => ({
          flowers: state.flowers.filter((flower) => flower.id !== id),
          records: state.records.filter((record) => record.flowerId !== id),
          outboundRecords: state.outboundRecords.filter((record) => record.flowerId !== id),
        }));
      },

      addRecord: (recordData) => {
        const state = get();
        const flower = state.flowers.find((f) => f.id === recordData.flowerId);

        const newRecord: OperationRecord = {
          ...recordData,
          flowerName: flower?.name,
          id: makeOperationRecordId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const f = state.flowers.find((fl) => fl.id === recordData.flowerId);
          if (!f) return { records: [...state.records, newRecord] };

          const delta =
            recordData.type === '补货' || recordData.type === '盘盈'
              ? recordData.quantity
              : -recordData.quantity;

          const updatedFlowers = state.flowers.map((fl) =>
            fl.id === recordData.flowerId
              ? updateFlowerStock(fl, fl.currentStock + delta)
              : fl
          );

          return {
            records: [...state.records, newRecord],
            flowers: updatedFlowers,
          };
        });
      },

      getFlowerRecords: (flowerId) => {
        return filterFlowerRecordsByType(get().records, flowerId);
      },

      performStocktake: (data: StocktakeData) => {
        const { flowerId, systemStock, actualStock, operator, date, remark } = data;
        const diff = actualStock - systemStock;

        if (diff === 0) {
          return { type: null, quantity: 0 };
        }

        const type: '盘盈' | '盘亏' = diff > 0 ? '盘盈' : '盘亏';
        const quantity = Math.abs(diff);

        const state = get();
        const flower = state.flowers.find((f) => f.id === flowerId);

        const stocktakeRecord: OperationRecord = {
          id: makeOperationRecordId(),
          flowerId,
          flowerName: flower?.name,
          type,
          quantity,
          date,
          operator,
          remark: remark || '',
          createdAt: new Date().toISOString(),
          systemStock,
          actualStock,
          diffQuantity: diff,
        };

        set((state) => {
          const f = state.flowers.find((fl) => fl.id === flowerId);
          if (!f) return { records: [...state.records, stocktakeRecord] };

          const updatedFlowers = state.flowers.map((fl) =>
            fl.id === flowerId
              ? updateFlowerStock(fl, actualStock)
              : fl
          );

          return {
            records: [...state.records, stocktakeRecord],
            flowers: updatedFlowers,
          };
        });

        return { type, quantity };
      },

      addOutboundRecord: (recordData) => {
        const state = get();
        const flower = state.flowers.find((f) => f.id === recordData.flowerId);

        if (!canDeductStock(flower, recordData.quantity)) return null;

        const newRecord: OutboundRecord = {
          ...recordData,
          flowerName: flower!.name,
          flowerType: flower!.type,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        const newStock = flower!.currentStock - recordData.quantity;

        set((state) => {
          const updatedFlowers = state.flowers.map((fl) =>
            fl.id === recordData.flowerId
              ? updateFlowerStock(fl, newStock)
              : fl
          );

          return {
            outboundRecords: [newRecord, ...state.outboundRecords],
            flowers: updatedFlowers,
          };
        });

        return newRecord;
      },

      getFlowerOutboundRecords: (flowerId) => {
        return filterFlowerRecordsByType(get().outboundRecords as any, flowerId) as any;
      },

      getFilteredOutboundRecords: (filters: Partial<OutboundFilters>) => {
        return filterOutboundRecords(get().outboundRecords, filters);
      },

      addPackageTemplate: (pkgData) => {
        const now = new Date().toISOString();
        const newPkg: PackageTemplate = {
          ...pkgData,
          id: generatePackageId(),
          flowers: enrichPackageFlowerItems(get().flowers, pkgData.flowers),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          packageTemplates: [...state.packageTemplates, newPkg],
        }));
        return newPkg;
      },

      updatePackageTemplate: (id, pkgData) => {
        set((state) => {
          const updatedTemplates = state.packageTemplates.map((pkg) => {
            if (pkg.id === id) {
              const flowers = pkgData.flowers
                ? enrichPackageFlowerItems(state.flowers, pkgData.flowers)
                : pkg.flowers;
              return {
                ...pkg,
                ...pkgData,
                flowers,
                updatedAt: new Date().toISOString(),
              };
            }
            return pkg;
          });
          return { packageTemplates: updatedTemplates };
        });
      },

      deletePackageTemplate: (id) => {
        set((state) => ({
          packageTemplates: state.packageTemplates.filter((pkg) => pkg.id !== id),
          packageUsageRecords: state.packageUsageRecords.filter((r) => r.packageId !== id),
        }));
      },

      getPackageTemplates: () => {
        return [...get().packageTemplates].sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      getFilteredPackageTemplates: (filters: Partial<PackageFilters>) => {
        return filterPackageTemplates(get().packageTemplates, filters);
      },

      createPackageUsage: (data) => {
        const state = get();
        const pkg = state.packageTemplates.find((p) => p.id === data.packageId);
        if (!pkg) return null;

        const stockCheck = canDeductPackageStock(state.flowers, pkg.flowers);
        if (!stockCheck.ok) return null;

        const now = new Date().toISOString();
        const usageItems = pkg.flowers.map((item) => {
          const flower = state.flowers.find((f) => f.id === item.flowerId);
          return {
            flowerId: item.flowerId,
            flowerName: flower?.name,
            flowerType: flower?.type,
            quantity: item.quantity,
          };
        });

        const newUsageRecord: PackageUsageRecord = {
          id: generateId(),
          packageId: pkg.id,
          packageName: pkg.name,
          packageType: pkg.type,
          date: data.date,
          recipient: data.recipient,
          usage: data.usage,
          createdBy: data.createdBy,
          remark: data.remark,
          createdAt: now,
          items: usageItems,
        };

        const updatedFlowers = state.flowers.map((flower) => {
          const pkgItem = pkg.flowers.find((i) => i.flowerId === flower.id);
          if (!pkgItem) return flower;
          return updateFlowerStock(flower, flower.currentStock - pkgItem.quantity);
        });

        const newOutboundRecords = pkg.flowers.map((item) => {
          const flower = state.flowers.find((f) => f.id === item.flowerId);
          return {
            id: generateId(),
            flowerId: item.flowerId,
            flowerName: flower?.name,
            flowerType: flower?.type,
            quantity: item.quantity,
            date: data.date,
            recipient: data.recipient,
            usage: data.usage as UsageType,
            remark: `${pkg.name} · ${data.remark || '套餐领用'}`,
            createdAt: now,
          } as OutboundRecord;
        });

        set((state) => ({
          flowers: updatedFlowers,
          outboundRecords: [...newOutboundRecords, ...state.outboundRecords],
          packageUsageRecords: [newUsageRecord, ...state.packageUsageRecords],
        }));

        return newUsageRecord;
      },

      getPackageUsageRecords: (packageId) => {
        return filterFlowerRecordsByType(get().packageUsageRecords as any, packageId) as any;
      },

      getFilteredPackageUsageRecords: (filters: Partial<PackageUsageFilters>) => {
        return filterPackageUsageRecords(get().packageUsageRecords, filters);
      },

      getPopularPackages: (limit = 5) => {
        return calcPopularPackages(get().packageUsageRecords, limit);
      },
    }),
    {
      name: 'flower-inventory-storage',
    }
  )
);
