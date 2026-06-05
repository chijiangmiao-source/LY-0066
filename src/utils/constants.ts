import type { FlowerStatus, RecordType } from '@/types';

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

export const STORAGE_KEY = 'flower-inventory-storage';
