export type FlowerStatus = '正常' | '偏低' | '缺货' | '停用';
export type RecordType = '补货' | '损耗' | '盘盈' | '盘亏';
export type UsageType = '追思会' | '告别仪式' | '守灵' | '骨灰安放' | '日常祭扫' | '其他';
export type PackageType = '告别仪式花篮' | '追思会花束' | '守灵花圈' | '骨灰安放花束' | '日常祭扫套餐' | '其他';

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

export interface OutboundRecord {
  id: string;
  flowerId: string;
  flowerName?: string;
  flowerType?: string;
  quantity: number;
  date: string;
  recipient: string;
  usage: UsageType;
  remark: string;
  createdAt: string;
}

export interface StocktakeData {
  flowerId: string;
  systemStock: number;
  actualStock: number;
  operator: string;
  date: string;
  remark?: string;
}

export interface OutboundFilters {
  usage: UsageType | 'all';
  dateFrom: string;
  dateTo: string;
  recipient: string;
}

export interface PackageFlowerItem {
  flowerId: string;
  flowerName?: string;
  quantity: number;
}

export interface PackageTemplate {
  id: string;
  name: string;
  type: PackageType;
  description: string;
  flowers: PackageFlowerItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackageUsageRecord {
  id: string;
  packageId: string;
  packageName?: string;
  packageType?: PackageType;
  date: string;
  recipient: string;
  usage: UsageType;
  createdBy: string;
  remark: string;
  createdAt: string;
  items: {
    flowerId: string;
    flowerName?: string;
    flowerType?: string;
    quantity: number;
  }[];
}

export interface PackageFilters {
  type: PackageType | 'all';
  dateFrom: string;
  dateTo: string;
  createdBy: string;
}

export interface PackageUsageFilters {
  packageType: PackageType | 'all';
  dateFrom: string;
  dateTo: string;
  createdBy: string;
}

export interface FlowerStore {
  flowers: Flower[];
  records: OperationRecord[];
  outboundRecords: OutboundRecord[];
  flowerTypes: string[];
  packageTemplates: PackageTemplate[];
  packageUsageRecords: PackageUsageRecord[];
  addFlower: (flower: Flower) => void;
  updateFlower: (id: string, flower: Partial<Flower>) => void;
  deleteFlower: (id: string) => void;
  addRecord: (record: Omit<OperationRecord, 'id' | 'createdAt'>) => void;
  addFlowerType: (type: string) => void;
  getFlowerRecords: (flowerId: string) => OperationRecord[];
  calculateStatus: (currentStock: number, safeStock: number) => FlowerStatus;
  performStocktake: (data: StocktakeData) => { type: '盘盈' | '盘亏' | null; quantity: number } | null;
  addOutboundRecord: (record: Omit<OutboundRecord, 'id' | 'createdAt'>) => OutboundRecord | null;
  getFlowerOutboundRecords: (flowerId: string) => OutboundRecord[];
  getFilteredOutboundRecords: (filters: Partial<OutboundFilters>) => OutboundRecord[];
  addPackageTemplate: (pkg: Omit<PackageTemplate, 'id' | 'createdAt' | 'updatedAt'>) => PackageTemplate;
  updatePackageTemplate: (id: string, pkg: Partial<Omit<PackageTemplate, 'id' | 'createdAt'>>) => void;
  deletePackageTemplate: (id: string) => void;
  getPackageTemplates: () => PackageTemplate[];
  getFilteredPackageTemplates: (filters: Partial<PackageFilters>) => PackageTemplate[];
  createPackageUsage: (data: {
    packageId: string;
    date: string;
    recipient: string;
    usage: UsageType;
    createdBy: string;
    remark: string;
  }) => PackageUsageRecord | null;
  getPackageUsageRecords: (packageId: string) => PackageUsageRecord[];
  getFilteredPackageUsageRecords: (filters: Partial<PackageUsageFilters>) => PackageUsageRecord[];
  getPopularPackages: (limit?: number) => { packageId: string; packageName: string; count: number; totalQuantity: number }[];
}
