import { useState, useEffect } from 'preact/hooks';
import type { Flower, RecordType } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { getTodayDateString, isValidOperatorName } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';

interface RecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: RecordType;
  selectedFlower?: Flower | null;
}

interface FormErrors {
  flowerId?: string;
  quantity?: string;
  operator?: string;
}

export function RecordForm({ open, onOpenChange, type, selectedFlower }: RecordFormProps) {
  const { flowers, addRecord } = useFlowerStore();
  
  const activeFlowers = flowers.filter(f => f.status !== '停用');

  const [formData, setFormData] = useState({
    flowerId: selectedFlower?.id || '',
    quantity: '',
    date: getTodayDateString(),
    operator: '',
    remark: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const selectedFlowerData = flowers.find(f => f.id === formData.flowerId);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.flowerId) {
      newErrors.flowerId = '请选择鲜花';
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = '数量必须大于 0';
    } else if (type === '损耗' && selectedFlowerData && quantity > selectedFlowerData.currentStock) {
      newErrors.quantity = `损耗数量不能超过当前库存（${selectedFlowerData.currentStock}）`;
    }

    if (!formData.operator.trim()) {
      newErrors.operator = '请输入经办人';
    } else if (!isValidOperatorName(formData.operator)) {
      newErrors.operator = '经办人姓名须为2-20位中文或英文字母';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!validate()) return;

    addRecord({
      flowerId: formData.flowerId,
      type,
      quantity: parseInt(formData.quantity),
      date: formData.date,
      operator: formData.operator.trim(),
      remark: formData.remark.trim(),
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      flowerId: '',
      quantity: '',
      date: getTodayDateString(),
      operator: '',
      remark: '',
    });
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={type === '补货' ? '补货登记' : '损耗记录'}
      description={type === '补货' ? '记录鲜花入库补货操作' : '记录鲜花损耗报废操作'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="选择鲜花"
          value={formData.flowerId}
          onValueChange={(value) => setFormData({ ...formData, flowerId: value })}
        >
          {activeFlowers.map((flower) => (
            <SelectItem key={flower.id} value={flower.id}>
              {flower.name} ({flower.id}) - 当前库存: {flower.currentStock}
            </SelectItem>
          ))}
        </Select>
        {errors.flowerId && <p className="text-sm text-red-600 -mt-2">{errors.flowerId}</p>}

        {selectedFlowerData && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <span className="text-gray-500">当前库存：</span>
            <span className="font-medium text-gray-900">{selectedFlowerData.currentStock} 枝</span>
            {type === '损耗' && (
              <span className="ml-2 text-gray-400">（最多可损耗 {selectedFlowerData.currentStock} 枝）</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={type === '补货' ? '补货数量' : '损耗数量'}
            type="number"
            min="1"
            value={formData.quantity}
            onInput={(e) => setFormData({ ...formData, quantity: (e.target as HTMLInputElement).value })}
            error={errors.quantity}
            placeholder="请输入数量"
          />
          <Input
            label="操作日期"
            type="date"
            value={formData.date}
            onInput={(e) => setFormData({ ...formData, date: (e.target as HTMLInputElement).value })}
          />
        </div>

        <Input
          label="经办人"
          value={formData.operator}
          onInput={(e) => setFormData({ ...formData, operator: (e.target as HTMLInputElement).value })}
          error={errors.operator}
          placeholder="请输入经办人姓名"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            备注
          </label>
          <textarea
            className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            value={formData.remark}
            onInput={(e) => setFormData({ ...formData, remark: (e.target as HTMLTextAreaElement).value })}
            placeholder="可选：添加备注信息"
          />
        </div>

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
          <Button type="submit" variant={type === '损耗' ? 'danger' : 'primary'}>
            {type === '补货' ? '确认补货' : '确认损耗'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
