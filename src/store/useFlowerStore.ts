import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Flower, OperationRecord, FlowerStatus, FlowerStore } from '@/types';
import { generateId, getTodayDateString } from '@/utils/helpers';

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

      calculateStatus,

      addFlower: (flowerData) => {
        set((state) => ({
          flowers: [...state.flowers, flowerData],
        }));
      },

      updateFlower: (id, flowerData) => {
        set((state) => ({
          flowers: state.flowers.map((flower) => {
            if (flower.id === id) {
              const currentStock = flowerData.currentStock ?? flower.currentStock;
              const safeStock = flowerData.safeStock ?? flower.safeStock;
              const status = flowerData.status ?? calculateStatus(currentStock, safeStock);
              return {
                ...flower,
                ...flowerData,
                status,
                updatedAt: new Date().toISOString(),
              };
            }
            return flower;
          }),
        }));
      },

      deleteFlower: (id) => {
        set((state) => ({
          flowers: state.flowers.filter((flower) => flower.id !== id),
          records: state.records.filter((record) => record.flowerId !== id),
        }));
      },

      addRecord: (recordData) => {
        const newRecord: OperationRecord = {
          ...recordData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const flower = state.flowers.find((f) => f.id === recordData.flowerId);
          if (!flower) return { records: [...state.records, newRecord] };

          const newStock =
            recordData.type === '补货'
              ? flower.currentStock + recordData.quantity
              : flower.currentStock - recordData.quantity;

          const updatedFlowers = state.flowers.map((f) => {
            if (f.id === recordData.flowerId) {
              return {
                ...f,
                currentStock: newStock,
                status: calculateStatus(newStock, f.safeStock),
                updatedAt: new Date().toISOString(),
              };
            }
            return f;
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
    }),
    {
      name: 'flower-inventory-storage',
    }
  )
);
