import { useState, useEffect } from 'preact/hooks';
import type { Flower, UsageType } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { USAGE_TYPES } from '@/utils/constants';
import { getTodayDateString } from '@/utils/helpers';
import { validateOutboundForm } from '@/services/validationService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { AlertCircle } from 'lucide-preact';

interface OutboundFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFlower?: Flower | null;
}

export function OutboundForm({ open, onOpenChange, selectedFlower }: OutboundFormProps) {
  const { flowers, addOutboundRecord } = useFlowerStore();

  const availableFlowers = flowers.filter((f) => f.status !== '停用' && f.currentStock > 0);

  const [formData, setFormData] = useState({
    flowerId: selectedFlower?.id || '',
    quantity: '',
    date: getTodayDateString(),
    recipient: '',
    usage: USAGE_TYPES[0] as UsageType,
    remark: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setFormData({
        flowerId: selectedFlower?.id || '',
        quantity: '',
        date: getTodayDateString(),
        recipient: '',
        usage: USAGE_TYPES[0],
        remark: '',
      });
      setErrors({});
      setSubmitError('');
    }
  }, [open, selectedFlower]);

  const currentFlower = flowers.find((f) => f.id === formData.flowerId);

  const validate = (): boolean => {
    const result = validateOutboundForm(formData, currentFlower);
    setErrors(result.errors);
    return result.valid;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const result = addOutboundRecord({
      flowerId: formData.flowerId,
      quantity: parseInt(formData.quantity),
      date: formData.date,
      recipient: formData.recipient.trim(),
      usage: formData.usage,
      remark: formData.remark.trim(),
    });

    if (!result) {
      setSubmitError('出库登记失败，库存不足或鲜花不存在');
      return;
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      flowerId: '',
      quantity: '',
      date: getTodayDateString(),
      recipient: '',
      usage: USAGE_TYPES[0],
      remark: '',
    });
    setErrors({});
    setSubmitError('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="鲜花出库登记"
      description="登记鲜花出库信息，自动扣减库存并生成出库记录"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="选择鲜花"
          value={formData.flowerId}
          onValueChange={(value) => setFormData({ ...formData, flowerId: value })}
        >
          {availableFlowers.length === 0 ? (
            <SelectItem value="" disabled>
              暂无可出库的鲜花
            </SelectItem>
          ) : (
            availableFlowers.map((flower) => (
              <SelectItem key={flower.id} value={flower.id}>
                {flower.name} ({flower.id}) - 库存: {flower.currentStock} 枝
              </SelectItem>
            ))
          )}
        </Select>
        {errors.flowerId && <p className="text-sm text-red-600 -mt-2">{errors.flowerId}</p>}

        {currentFlower && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <span className="text-gray-500">当前库存：</span>
                <span className="font-medium text-gray-900">{currentFlower.currentStock} 枝</span>
              </span>
              <span>
                <span className="text-gray-500">所在位置：</span>
                <span className="font-medium text-gray-900">{currentFlower.location || '未设置'}</span>
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="出库数量"
            type="number"
            min="1"
            value={formData.quantity}
            onInput={(e) => setFormData({ ...formData, quantity: (e.target as HTMLInputElement).value })}
            error={errors.quantity}
            placeholder="请输入出库枝数"
          />
          <Input
            label="出库日期"
            type="date"
            value={formData.date}
            onInput={(e) => setFormData({ ...formData, date: (e.target as HTMLInputElement).value })}
            error={errors.date}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="领用人"
            value={formData.recipient}
            onInput={(e) => setFormData({ ...formData, recipient: (e.target as HTMLInputElement).value })}
            error={errors.recipient}
            placeholder="请输入领用人姓名"
          />
          <Select
            label="用途类型"
            value={formData.usage}
            onValueChange={(value) => setFormData({ ...formData, usage: value as UsageType })}
          >
            {USAGE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </Select>
          {errors.usage && <p className="text-sm text-red-600 -mt-2">{errors.usage}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
          <textarea
            className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            value={formData.remark}
            onInput={(e) => setFormData({ ...formData, remark: (e.target as HTMLTextAreaElement).value })}
            placeholder="可选：添加出库备注信息"
          />
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
          <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
            确认出库
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
