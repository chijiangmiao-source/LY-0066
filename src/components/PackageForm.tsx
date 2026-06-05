import { useState, useEffect } from 'preact/hooks';
import type { PackageTemplate, PackageType, PackageFlowerItem } from '@/types';
import { PACKAGE_TYPES } from '@/utils/constants';
import { useFlowerStore } from '@/store/useFlowerStore';
import { isValidOperatorName } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { Plus, Trash2, AlertCircle, Flower2 } from 'lucide-preact';

interface PackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPackage?: PackageTemplate | null;
}

interface FormErrors {
  name?: string;
  type?: string;
  createdBy?: string;
  flowers?: string;
}

const defaultFormData = {
  name: '',
  type: PACKAGE_TYPES[0] as PackageType,
  description: '',
  createdBy: '',
  flowers: [] as PackageFlowerItem[],
};

export function PackageForm({ open, onOpenChange, editPackage }: PackageFormProps) {
  const { flowers, addPackageTemplate, updatePackageTemplate } = useFlowerStore();
  const isEdit = !!editPackage;

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const availableFlowers = flowers.filter((f) => f.status !== '停用');

  useEffect(() => {
    if (open) {
      if (editPackage) {
        setFormData({
          name: editPackage.name,
          type: editPackage.type,
          description: editPackage.description,
          createdBy: editPackage.createdBy,
          flowers: editPackage.flowers.map(f => ({
            flowerId: f.flowerId,
            flowerName: f.flowerName,
            quantity: f.quantity,
          })),
        });
      } else {
        setFormData(defaultFormData);
      }
      setErrors({});
      setSubmitError('');
    }
  }, [open, editPackage]);

  const addFlowerItem = () => {
    const firstAvailable = availableFlowers[0];
    if (!firstAvailable) return;
    setFormData({
      ...formData,
      flowers: [
        ...formData.flowers,
        { flowerId: firstAvailable.id, flowerName: firstAvailable.name, quantity: 1 },
      ],
    });
  };

  const removeFlowerItem = (index: number) => {
    setFormData({
      ...formData,
      flowers: formData.flowers.filter((_, i) => i !== index),
    });
  };

  const updateFlowerItem = (index: number, field: 'flowerId' | 'quantity', value: string) => {
    const newFlowers = [...formData.flowers];
    if (field === 'flowerId') {
      const flower = flowers.find((f) => f.id === value);
      newFlowers[index] = {
        flowerId: value,
        flowerName: flower?.name,
        quantity: newFlowers[index].quantity,
      };
    } else {
      newFlowers[index] = { ...newFlowers[index], quantity: parseInt(value) || 0 };
    }
    setFormData({ ...formData, flowers: newFlowers });
  };

  const totalFlowers = formData.flowers.reduce((sum, f) => sum + f.quantity, 0);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '套餐名称不能为空';
    }

    if (!formData.type) {
      newErrors.type = '请选择套餐类型';
    }

    if (!formData.createdBy.trim()) {
      newErrors.createdBy = '请输入创建人';
    } else if (!isValidOperatorName(formData.createdBy)) {
      newErrors.createdBy = '创建人姓名须为2-20位中文或英文字母';
    }

    if (formData.flowers.length === 0) {
      newErrors.flowers = '请至少添加一种鲜花';
    } else {
      const flowerIdSet = new Set<string>();
      for (const item of formData.flowers) {
        if (!item.flowerId) {
          newErrors.flowers = '请选择所有鲜花种类';
          break;
        }
        if (item.quantity <= 0) {
          newErrors.flowers = '所有鲜花数量必须大于 0';
          break;
        }
        if (flowerIdSet.has(item.flowerId)) {
          newErrors.flowers = '鲜花种类不能重复';
          break;
        }
        flowerIdSet.add(item.flowerId);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const pkgData = {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description.trim(),
      createdBy: formData.createdBy.trim(),
      flowers: formData.flowers.map(f => ({
        flowerId: f.flowerId,
        quantity: f.quantity,
      })),
    };

    if (isEdit && editPackage) {
      updatePackageTemplate(editPackage.id, pkgData);
    } else {
      addPackageTemplate(pkgData);
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setErrors({});
    setSubmitError('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? '编辑套餐模板' : '新增套餐模板'}
      description={isEdit ? '修改鲜花组合套餐的配置信息' : '创建新的鲜花组合套餐模板'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="套餐名称"
            value={formData.name}
            onInput={(e) => setFormData({ ...formData, name: (e.target as HTMLInputElement).value })}
            error={errors.name}
            placeholder="如：标准告别仪式花篮"
          />
          <Select
            label="套餐类型"
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as PackageType })}
          >
            {PACKAGE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Input
          label="创建人"
          value={formData.createdBy}
          onInput={(e) => setFormData({ ...formData, createdBy: (e.target as HTMLInputElement).value })}
          error={errors.createdBy}
          placeholder="请输入工作人员姓名"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">套餐描述</label>
          <textarea
            className="w-full h-20 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            value={formData.description}
            onInput={(e) => setFormData({ ...formData, description: (e.target as HTMLTextAreaElement).value })}
            placeholder="可选：描述套餐的适用场景和特点"
          />
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">鲜花组成</span>
              <span className="text-xs text-gray-500">
                共 {formData.flowers.length} 种 · {totalFlowers} 枝
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFlowerItem}
              disabled={availableFlowers.length === 0}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              添加鲜花
            </Button>
          </div>

          {errors.flowers && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errors.flowers}
            </div>
          )}

          {formData.flowers.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <Flower2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>暂无鲜花配置，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.flowers.map((item, index) => {
                const selectedFlower = flowers.find((f) => f.id === item.flowerId);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        value={item.flowerId}
                        onValueChange={(value) => updateFlowerItem(index, 'flowerId', value)}
                      >
                        {availableFlowers.map((flower) => (
                          <SelectItem key={flower.id} value={flower.id}>
                            {flower.name} ({flower.id}) · 库存: {flower.currentStock}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity.toString()}
                      onInput={(e) => updateFlowerItem(index, 'quantity', (e.target as HTMLInputElement).value)}
                      className="w-24"
                      placeholder="数量"
                    />
                    {selectedFlower && (
                      <span className="text-xs text-gray-500 w-16">
                        库存:{selectedFlower.currentStock}
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFlowerItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {submitError}
          </div>
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
            {isEdit ? '保存修改' : '创建套餐'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
