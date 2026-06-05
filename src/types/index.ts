export type FlowerStatus = '正常' | '偏低' | '缺货' | '停用';
export type RecordType = '补货' | '损耗' | '盘盈' | '盘亏';

export interface Flower {
  id: string;
  name: string;
  type: string;
  currentStock: number;
  safeStock: number;
  location: string;
  status: FlowerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OperationRecord {
  id: string;
  flowerId: string;
  type: RecordType;
  flowerName?: string;
  quantity: number;
  date: string;
  operator: string;
  remark: string;
  createdAt: string;
  systemStock?: number;
  actualStock?: number;
  diffQuantity?: number;
}

export interface StocktakeData {
  flowerId: string;
  systemStock: number;
  actualStock: number;
  operator: string;
  date: string;
  remark?: string;
}

export interface FlowerStore {
  flowers: Flower[];
  records: OperationRecord[];
  flowerTypes: string[];
  addFlower: (flower: Flower) => void;
  updateFlower: (id: string, flower: Partial<Flower>) => void;
  deleteFlower: (id: string) => void;
  addRecord: (record: Omit<OperationRecord, 'id' | 'createdAt'>) => void;
  addFlowerType: (type: string) => void;
  getFlowerRecords: (flowerId: string) => OperationRecord[];
  calculateStatus: (currentStock: number, safeStock: number) => FlowerStatus;
  performStocktake: (data: StocktakeData) => { type: '盘盈' | '盘亏' | null; quantity: number } | null;
}
