import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Flower, OperationRecord, FlowerStatus, FlowerStore, StocktakeData, OutboundRecord, OutboundFilters } from '@/types';
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
    }),
    {
      name: 'flower-inventory-storage',
    }
  )
);
