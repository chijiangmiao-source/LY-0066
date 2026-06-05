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

export const RECORD_TYPES: RecordType[] = ['补货', '损耗'];

export const STATUS_COLORS: Record<FlowerStatus, string> = {
  '正常': 'bg-green-100 text-green-800',
  '偏低': 'bg-yellow-100 text-yellow-800',
  '缺货': 'bg-red-100 text-red-800',
  '停用': 'bg-gray-100 text-gray-800',
};

export const STORAGE_KEY = 'flower-inventory-storage';
