import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Flower,
  OperationRecord,
  FlowerStatus,
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
import { generateId, getTodayDateString, isDateInRange } from '@/utils/helpers';
import { FLOWER_TYPES } from '@/utils/constants';

const initialFlowers: Flower[] = [
  {
    id: 'FL001',
    name: '白菊',
    type: '白菊',
    currentStock: 80,
    safeStock: 50,
    location: 'A区-01',
    status: '正常',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'FL002',
    name: '黄菊',
    type: '黄菊',
    currentStock: 35,
    safeStock: 40,
    location: 'A区-02',
    status: '偏低',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
  {
    id: 'FL003',
    name: '白百合',
    type: '白百合',
    currentStock: 0,
    safeStock: 30,
    location: 'B区-01',
    status: '缺货',
    createdAt: '2026-05-02T00:00:00.000Z',
    updatedAt: '2026-06-03T00:00:00.000Z',
  },
  {
    id: 'FL004',
    name: '粉百合',
    type: '粉百合',
    currentStock: 45,
    safeStock: 30,
    location: 'B区-02',
    status: '正常',
    createdAt: '2026-05-02T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'FL005',
    name: '康乃馨',
    type: '康乃馨',
    currentStock: 120,
    safeStock: 60,
    location: 'A区-03',
    status: '正常',
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-06-04T00:00:00.000Z',
  },
  {
    id: 'FL006',
    name: '白玫瑰',
    type: '白玫瑰',
    currentStock: 25,
    safeStock: 40,
    location: 'C区-01',
    status: '偏低',
    createdAt: '2026-05-03T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
];

const initialRecords: OperationRecord[] = [
  {
    id: generateId(),
    flowerId: 'FL001',
    type: '补货',
    quantity: 50,
    date: getTodayDateString(),
    operator: '张三',
    remark: '日常补货',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    flowerId: 'FL002',
    type: '损耗',
    quantity: 5,
    date: getTodayDateString(),
    operator: '李四',
    remark: '花朵枯萎',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    flowerId: 'FL005',
    type: '补货',
    quantity: 80,
    date: getTodayDateString(),
    operator: '张三',
    remark: '节日备货',
    createdAt: new Date().toISOString(),
  },
];

const initialOutboundRecords: OutboundRecord[] = [
  {
    id: generateId(),
    flowerId: 'FL001',
    flowerName: '白菊',
    flowerType: '白菊',
    quantity: 10,
    date: getTodayDateString(),
    recipient: '王家属',
    usage: '告别仪式',
    remark: '遗体告别仪式用花',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    flowerId: 'FL005',
    flowerName: '康乃馨',
    flowerType: '康乃馨',
    quantity: 5,
    date: getTodayDateString(),
    recipient: '李家属',
    usage: '追思会',
    remark: '追思会布置',
    createdAt: new Date().toISOString(),
  },
];

const initialPackageTemplates: PackageTemplate[] = [
  {
    id: 'PKG001',
    name: '标准告别仪式花篮',
    type: '告别仪式花篮',
    description: '适用于遗体告别仪式的标准花篮，庄重大气',
    flowers: [
      { flowerId: 'FL001', flowerName: '白菊', quantity: 30 },
      { flowerId: 'FL003', flowerName: '白百合', quantity: 6 },
      { flowerId: 'FL008', flowerName: '满天星', quantity: 10 },
    ],
    createdBy: '管理员',
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'PKG002',
    name: '温馨追思会花束',
    type: '追思会花束',
    description: '温馨雅致的追思会花束，适合追思悼念场合',
    flowers: [
      { flowerId: 'FL005', flowerName: '康乃馨', quantity: 15 },
      { flowerId: 'FL004', flowerName: '粉百合', quantity: 5 },
      { flowerId: 'FL007', flowerName: '勿忘我', quantity: 8 },
    ],
    createdBy: '管理员',
    createdAt: '2026-05-12T00:00:00.000Z',
    updatedAt: '2026-05-20T00:00:00.000Z',
  },
  {
    id: 'PKG003',
    name: '简约日常祭扫套餐',
    type: '日常祭扫套餐',
    description: '简洁实用的日常祭扫用花套餐',
    flowers: [
      { flowerId: 'FL001', flowerName: '白菊', quantity: 10 },
      { flowerId: 'FL002', flowerName: '黄菊', quantity: 10 },
    ],
    createdBy: '张三',
    createdAt: '2026-05-18T00:00:00.000Z',
    updatedAt: '2026-05-25T00:00:00.000Z',
  },
];

const initialPackageUsageRecords: PackageUsageRecord[] = [
  {
    id: generateId(),
    packageId: 'PKG001',
    packageName: '标准告别仪式花篮',
    packageType: '告别仪式花篮',
    date: getTodayDateString(),
    recipient: '陈家属',
    usage: '告别仪式',
    createdBy: '张三',
    remark: '陈老先生告别仪式',
    createdAt: new Date().toISOString(),
    items: [
      { flowerId: 'FL001', flowerName: '白菊', flowerType: '白菊', quantity: 30 },
      { flowerId: 'FL003', flowerName: '白百合', flowerType: '白百合', quantity: 6 },
      { flowerId: 'FL008', flowerName: '满天星', flowerType: '满天星', quantity: 10 },
    ],
  },
  {
    id: generateId(),
    packageId: 'PKG002',
    packageName: '温馨追思会花束',
    packageType: '追思会花束',
    date: getTodayDateString(),
    recipient: '刘家属',
    usage: '追思会',
    createdBy: '李四',
    remark: '刘女士追思纪念会',
    createdAt: new Date().toISOString(),
    items: [
      { flowerId: 'FL005', flowerName: '康乃馨', flowerType: '康乃馨', quantity: 15 },
      { flowerId: 'FL004', flowerName: '粉百合', flowerType: '粉百合', quantity: 5 },
      { flowerId: 'FL007', flowerName: '勿忘我', flowerType: '勿忘我', quantity: 8 },
    ],
  },
];

const calculateStatus = (currentStock: number, safeStock: number): FlowerStatus => {
  if (currentStock === 0) return '缺货';
  if (currentStock < safeStock) return '偏低';
  return '正常';
};

export const useFlowerStore = create<FlowerStore>()(
  persist(
    (set, get) => ({
      flowers: initialFlowers,
      records: initialRecords,
      outboundRecords: initialOutboundRecords,
      flowerTypes: FLOWER_TYPES,
      packageTemplates: initialPackageTemplates,
      packageUsageRecords: initialPackageUsageRecords,

      calculateStatus,

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
              const status = flowerData.status ?? calculateStatus(currentStock, safeStock);
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
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const f = state.flowers.find((fl) => fl.id === recordData.flowerId);
          if (!f) return { records: [...state.records, newRecord] };

          const newStock =
            recordData.type === '补货' || recordData.type === '盘盈'
              ? f.currentStock + recordData.quantity
              : f.currentStock - recordData.quantity;

          const updatedFlowers = state.flowers.map((fl) => {
            if (fl.id === recordData.flowerId) {
              return {
                ...fl,
                currentStock: newStock,
                status: calculateStatus(newStock, fl.safeStock),
                updatedAt: new Date().toISOString(),
              };
            }
            return fl;
          });

          return {
            records: [...state.records, newRecord],
            flowers: updatedFlowers,
          };
        });
      },

      getFlowerRecords: (flowerId) => {
        return get().records.filter((r) => r.flowerId === flowerId).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
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
          id: generateId(),
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

          const newStock = actualStock;

          const updatedFlowers = state.flowers.map((fl) => {
            if (fl.id === flowerId) {
              return {
                ...fl,
                currentStock: newStock,
                status: calculateStatus(newStock, fl.safeStock),
                updatedAt: new Date().toISOString(),
              };
            }
            return fl;
          });

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

        if (!flower) return null;
        if (flower.currentStock < recordData.quantity) return null;

        const newRecord: OutboundRecord = {
          ...recordData,
          flowerName: flower.name,
          flowerType: flower.type,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        const newStock = flower.currentStock - recordData.quantity;

        set((state) => {
          const updatedFlowers = state.flowers.map((fl) => {
            if (fl.id === recordData.flowerId) {
              return {
                ...fl,
                currentStock: newStock,
                status: calculateStatus(newStock, fl.safeStock),
                updatedAt: new Date().toISOString(),
              };
            }
            return fl;
          });

          return {
            outboundRecords: [newRecord, ...state.outboundRecords],
            flowers: updatedFlowers,
          };
        });

        return newRecord;
      },

      getFlowerOutboundRecords: (flowerId) => {
        return get().outboundRecords
          .filter((r) => r.flowerId === flowerId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getFilteredOutboundRecords: (filters: Partial<OutboundFilters>) => {
        const { usage, dateFrom, dateTo, recipient } = filters;
        return get().outboundRecords
          .filter((r) => {
            if (usage && usage !== 'all' && r.usage !== usage) return false;
            if ((dateFrom || dateTo) && !isDateInRange(r.date, dateFrom || '', dateTo || '')) return false;
            if (recipient && !r.recipient.includes(recipient.trim())) return false;
            return true;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      addPackageTemplate: (pkgData) => {
        const now = new Date().toISOString();
        const newPkg: PackageTemplate = {
          ...pkgData,
          id: `PKG${Date.now().toString().slice(-6)}`,
          flowers: pkgData.flowers.map(f => {
            const flower = get().flowers.find(fl => fl.id === f.flowerId);
            return { ...f, flowerName: flower?.name };
          }),
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
                ? pkgData.flowers.map(f => {
                    const flower = state.flowers.find(fl => fl.id === f.flowerId);
                    return { ...f, flowerName: flower?.name };
                  })
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
        return get().packageTemplates.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      getFilteredPackageTemplates: (filters: Partial<PackageFilters>) => {
        const { type, dateFrom, dateTo, createdBy } = filters;
        return get().packageTemplates
          .filter((pkg) => {
            if (type && type !== 'all' && pkg.type !== type) return false;
            if ((dateFrom || dateTo) && !isDateInRange(pkg.createdAt.slice(0, 10), dateFrom || '', dateTo || '')) return false;
            if (createdBy && !pkg.createdBy.includes(createdBy.trim())) return false;
            return true;
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      createPackageUsage: (data) => {
        const state = get();
        const pkg = state.packageTemplates.find((p) => p.id === data.packageId);
        if (!pkg) return null;

        for (const item of pkg.flowers) {
          const flower = state.flowers.find((f) => f.id === item.flowerId);
          if (!flower || flower.currentStock < item.quantity) {
            return null;
          }
        }

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
          const newStock = flower.currentStock - pkgItem.quantity;
          return {
            ...flower,
            currentStock: newStock,
            status: calculateStatus(newStock, flower.safeStock),
            updatedAt: now,
          };
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
        return get().packageUsageRecords
          .filter((r) => r.packageId === packageId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getFilteredPackageUsageRecords: (filters: Partial<PackageUsageFilters>) => {
        const { packageType, dateFrom, dateTo, createdBy } = filters;
        return get().packageUsageRecords
          .filter((r) => {
            if (packageType && packageType !== 'all' && r.packageType !== packageType) return false;
            if ((dateFrom || dateTo) && !isDateInRange(r.date, dateFrom || '', dateTo || '')) return false;
            if (createdBy && !r.createdBy.includes(createdBy.trim())) return false;
            return true;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getPopularPackages: (limit = 5) => {
        const records = get().packageUsageRecords;
        const pkgMap = new Map<string, { packageId: string; packageName: string; count: number; totalQuantity: number }>();

        for (const record of records) {
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
      },
    }),
    {
      name: 'flower-inventory-storage',
    }
  )
);
