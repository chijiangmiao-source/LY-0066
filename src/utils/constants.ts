import type { FlowerStatus, RecordType, UsageType } from '@/types';

export const FLOWER_TYPES = [
  '白菊',
  '黄菊',
  '白百合',
  '粉百合',
  '康乃馨',
  '白玫瑰',
  '勿忘我',
  '满天星',
  '剑兰',
  '洋桔梗',
];

export const FLOWER_STATUSES: FlowerStatus[] = ['正常', '偏低', '缺货', '停用'];

export const RECORD_TYPES: RecordType[] = ['补货', '损耗', '盘盈', '盘亏'];

export const USAGE_TYPES: UsageType[] = [
  '追思会',
  '告别仪式',
  '守灵',
  '骨灰安放',
  '日常祭扫',
  '其他',
];

export const STATUS_COLORS: Record<FlowerStatus, string> = {
  '正常': 'bg-green-100 text-green-800',
  '偏低': 'bg-yellow-100 text-yellow-800',
  '缺货': 'bg-red-100 text-red-800',
  '停用': 'bg-gray-100 text-gray-800',
};

export const RECORD_TYPE_COLORS: Record<RecordType, string> = {
  '补货': 'bg-green-50 border-green-500',
  '损耗': 'bg-red-50 border-red-500',
  '盘盈': 'bg-blue-50 border-blue-500',
  '盘亏': 'bg-orange-50 border-orange-500',
};

export const RECORD_TYPE_TEXT_COLORS: Record<RecordType, string> = {
  '补货': 'text-green-700',
  '损耗': 'text-red-700',
  '盘盈': 'text-blue-700',
  '盘亏': 'text-orange-700',
};

export const USAGE_TYPE_COLORS: Record<UsageType, string> = {
  '追思会': 'bg-purple-100 text-purple-800',
  '告别仪式': 'bg-indigo-100 text-indigo-800',
  '守灵': 'bg-slate-100 text-slate-800',
  '骨灰安放': 'bg-teal-100 text-teal-800',
  '日常祭扫': 'bg-amber-100 text-amber-800',
  '其他': 'bg-gray-100 text-gray-800',
};

export const USAGE_TYPE_CHART_COLORS: Record<UsageType, string> = {
  '追思会': '#8b5cf6',
  '告别仪式': '#6366f1',
  '守灵': '#64748b',
  '骨灰安放': '#14b8a6',
  '日常祭扫': '#f59e0b',
  '其他': '#9ca3af',
};

export const OUTBOUND_COLOR = 'bg-violet-50 border-violet-500';
export const OUTBOUND_TEXT_COLOR = 'text-violet-700';

export const STORAGE_KEY = 'flower-inventory-storage';
