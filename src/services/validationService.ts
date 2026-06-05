import type { Flower, RecordType, PackageFlowerItem } from '@/types';
import { isValidOperatorName, isValidRecipientName } from '@/utils/helpers';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateFlowerForm(data: {
  id: string;
  name: string;
  type: string;
  currentStock: string;
  safeStock: string;
}, isEdit: boolean, existingFlowers: Flower[], editId?: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.id.trim()) {
    errors.id = '鲜花编号不能为空';
  } else if (!isEdit && existingFlowers.some(f => f.id === data.id)) {
    errors.id = '鲜花编号已存在';
  } else if (isEdit && editId && data.id !== editId && existingFlowers.some(f => f.id === data.id)) {
    errors.id = '鲜花编号已存在';
  }

  if (!data.name.trim()) {
    errors.name = '鲜花名称不能为空';
  }

  if (!data.type.trim()) {
    errors.type = '鲜花类型不能为空';
  }

  const currentStock = parseInt(data.currentStock);
  if (isNaN(currentStock) || currentStock < 0) {
    errors.currentStock = '当前库存必须是非负整数';
  }

  const safeStock = parseInt(data.safeStock);
  if (isNaN(safeStock) || safeStock < 0) {
    errors.safeStock = '安全库存必须是非负整数';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateOutboundForm(data: {
  flowerId: string;
  quantity: string;
  date: string;
  recipient: string;
  usage: string;
}, currentFlower?: Flower): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.flowerId) {
    errors.flowerId = '请选择鲜花';
  }

  const quantity = parseInt(data.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    errors.quantity = '出库数量必须大于 0';
  } else if (currentFlower && quantity > currentFlower.currentStock) {
    errors.quantity = `出库数量不能超过当前库存（${currentFlower.currentStock} 枝）`;
  }

  if (!data.date) {
    errors.date = '请选择出库日期';
  }

  if (!data.recipient.trim()) {
    errors.recipient = '请输入领用人';
  } else if (!isValidRecipientName(data.recipient)) {
    errors.recipient = '领用人姓名须为2-20位中文或英文字母';
  }

  if (!data.usage) {
    errors.usage = '请选择用途类型';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStocktakeForm(data: {
  flowerId: string;
  actualStock: string;
  operator: string;
}, existingFlowers: Flower[]): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.flowerId) {
    errors.flowerId = '请选择或输入鲜花编号';
  } else if (!existingFlowers.find(f => f.id === data.flowerId)) {
    errors.flowerId = '鲜花编号不存在';
  }

  const actualStock = parseInt(data.actualStock);
  if (data.actualStock === '' || isNaN(actualStock) || actualStock < 0) {
    errors.actualStock = '实际库存必须是非负整数';
  }

  if (!data.operator.trim()) {
    errors.operator = '请输入经办人';
  } else if (!isValidOperatorName(data.operator)) {
    errors.operator = '经办人姓名须为2-20位中文或英文字母';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRecordForm(data: {
  flowerId: string;
  quantity: string;
  operator: string;
}, type: RecordType, selectedFlower?: Flower): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.flowerId) {
    errors.flowerId = '请选择鲜花';
  }

  const quantity = parseInt(data.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    errors.quantity = '数量必须大于 0';
  } else if (type === '损耗' && selectedFlower && quantity > selectedFlower.currentStock) {
    errors.quantity = `损耗数量不能超过当前库存（${selectedFlower.currentStock}）`;
  }

  if (!data.operator.trim()) {
    errors.operator = '请输入经办人';
  } else if (!isValidOperatorName(data.operator)) {
    errors.operator = '经办人姓名须为2-20位中文或英文字母';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePackageForm(data: {
  name: string;
  type: string;
  createdBy: string;
  flowers: PackageFlowerItem[];
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = '套餐名称不能为空';
  }

  if (!data.type) {
    errors.type = '请选择套餐类型';
  }

  if (!data.createdBy.trim()) {
    errors.createdBy = '请输入创建人';
  } else if (!isValidOperatorName(data.createdBy)) {
    errors.createdBy = '创建人姓名须为2-20位中文或英文字母';
  }

  if (data.flowers.length === 0) {
    errors.flowers = '请至少添加一种鲜花';
  } else {
    const flowerIdSet = new Set<string>();
    for (const item of data.flowers) {
      if (!item.flowerId) {
        errors.flowers = '请选择所有鲜花种类';
        break;
      }
      if (item.quantity <= 0) {
        errors.flowers = '所有鲜花数量必须大于 0';
        break;
      }
      if (flowerIdSet.has(item.flowerId)) {
        errors.flowers = '鲜花种类不能重复';
        break;
      }
      flowerIdSet.add(item.flowerId);
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePackageUsageForm(data: {
  packageId: string;
  date: string;
  recipient: string;
  usage: string;
  createdBy: string;
}, stockAvailable: boolean): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.packageId) {
    errors.packageId = '请选择套餐';
  } else if (!stockAvailable) {
    errors.packageId = '套餐所需鲜花库存不足';
  }

  if (!data.date) {
    errors.date = '请选择使用日期';
  }

  if (!data.recipient.trim()) {
    errors.recipient = '请输入领用人';
  } else if (!isValidRecipientName(data.recipient)) {
    errors.recipient = '领用人姓名须为2-20位中文或英文字母';
  }

  if (!data.usage) {
    errors.usage = '请选择用途类型';
  }

  if (!data.createdBy.trim()) {
    errors.createdBy = '请输入经办人';
  } else if (!isValidOperatorName(data.createdBy)) {
    errors.createdBy = '经办人姓名须为2-20位中文或英文字母';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
