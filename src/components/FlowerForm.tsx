import { useState } from 'preact/hooks';
import type { Flower } from '@/types';
import { FLOWER_TYPES, FLOWER_STATUSES } from '@/utils/constants';
import { useFlowerStore } from '@/store/useFlowerStore';

const calculateStatus = (currentStock: number, safeStock: number): '正常' | '偏低' | '缺货' | '停用' => {
  if (currentStock === 0) return '缺货';
  if (currentStock < safeStock) return '偏低';
  return '正常';
};
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';

interface FlowerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editFlower?: Flower | null;
}

interface FormErrors {
  id?: string;
  name?: string;
  currentStock?: string;
  safeStock?: string;
}

export function FlowerForm({ open, onOpenChange, editFlower }: FlowerFormProps) {
  const { flowers, addFlower, updateFlower } = useFlowerStore();
  const isEdit = !!editFlower;

  const [formData, setFormData] = useState({
    id: editFlower?.id || '',
    name: editFlower?.name || '',
    type: editFlower?.type || FLOWER_TYPES[0],
    currentStock: editFlower?.currentStock?.toString() || '0',
    safeStock: editFlower?.safeStock?.toString() || '10',
    location: editFlower?.location || '',
    status: editFlower?.status || '正常',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = '鲜花编号不能为空';
    } else if (!isEdit && flowers.some(f => f.id === formData.id)) {
      newErrors.id = '鲜花编号已存在';
    }

    if (!formData.name.trim()) {
      newErrors.name = '鲜花名称不能为空';
    }

    const currentStock = parseInt(formData.currentStock);
    if (isNaN(currentStock) || currentStock < 0) {
      newErrors.currentStock = '当前库存必须是非负整数';
    }

    const safeStock = parseInt(formData.safeStock);
    if (isNaN(safeStock) || safeStock < 0) {
      newErrors.safeStock = '安全库存必须是非负整数';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!validate()) return;

    const flowerData = {
      name: formData.name.trim(),
      type: formData.type,
      currentStock: parseInt(formData.currentStock),
      safeStock: parseInt(formData.safeStock),
      location: formData.location.trim(),
    };

    if (isEdit && editFlower) {
      updateFlower(editFlower.id, {
        ...flowerData,
        status: formData.status as '正常' | '偏低' | '缺货' | '停用',
      });
    } else {
      const now = new Date().toISOString();
      const status = calculateStatus(parseInt(formData.currentStock), parseInt(formData.safeStock));
      addFlower({
        id: formData.id.trim(),
        ...flowerData,
        status,
        createdAt: now,
        updatedAt: now,
      });
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      type: FLOWER_TYPES[0],
      currentStock: '0',
      safeStock: '10',
      location: '',
      status: '正常',
    });
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? '编辑鲜花' : '新增鲜花'}
      description={isEdit ? '修改鲜花库存信息' : '添加新的鲜花品种到冷柜'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="鲜花编号"
            value={formData.id}
            onInput={(e) => setFormData({ ...formData, id: (e.target as HTMLInputElement).value })}
            error={errors.id}
            disabled={isEdit}
            placeholder="如：FL001"
          />
          <Input
            label="鲜花名称"
            value={formData.name}
            onInput={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
            error={errors.name}
            placeholder="如：白菊"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="鲜花类型"
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            {FLOWER_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="冷柜位置"
            value={formData.location}
            onInput={(e) => setFormData({ ...formData, location: (e.target as HTMLInputElement).value })}
            placeholder="如：A区-01"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="当前库存"
            type="number"
            min="0"
            value={formData.currentStock}
            onInput={(e) => setFormData({ ...formData, currentStock: (e.target as HTMLInputElement).value })}
            error={errors.currentStock}
          />
          <Input
            label="安全库存"
            type="number"
            min="0"
            value={formData.safeStock}
            onInput={(e) => setFormData({ ...formData, safeStock: (e.target as HTMLInputElement).value })}
            error={errors.safeStock}
          />
        </div>

        {isEdit && (
          <Select
            label="库存状态"
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            {FLOWER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </Select>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            取消
          </Button>
          <Button type="submit">
            {isEdit ? '保存修改' : '添加鲜花'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
