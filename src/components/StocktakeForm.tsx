import { useState, useEffect } from 'preact/hooks';
import type { Flower } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { getTodayDateString, cn, isValidOperatorName } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { ClipboardCheck, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-preact';

interface StocktakeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFlower?: Flower | null;
}

interface FormErrors {
  flowerId?: string;
  actualStock?: string;
  operator?: string;
}

interface StocktakeResult {
  type: '盘盈' | '盘亏' | null;
  quantity: number;
  diff: number;
}

export function StocktakeForm({ open, onOpenChange, selectedFlower }: StocktakeFormProps) {
  const { flowers, performStocktake } = useFlowerStore();

  const activeFlowers = flowers.filter(f => f.status !== '停用');

  const [formData, setFormData] = useState({
    flowerId: selectedFlower?.id || '',
    actualStock: '',
    date: getTodayDateString(),
    operator: '',
    remark: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<StocktakeResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedFlowerData = flowers.find(f => f.id === formData.flowerId);
  const systemStock = selectedFlowerData?.currentStock ?? 0;
  const actualStockNum = parseInt(formData.actualStock) || 0;
  const diff = formData.actualStock !== '' ? actualStockNum - systemStock : 0;

  useEffect(() => {
    if (open) {
      setFormData({
        flowerId: selectedFlower?.id || '',
        actualStock: '',
        date: getTodayDateString(),
        operator: '',
        remark: '',
      });
      setErrors({});
      setResult(null);
      setShowSuccess(false);
    }
  }, [open, selectedFlower]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.flowerId) {
      newErrors.flowerId = '请选择或输入鲜花编号';
    } else if (!flowers.find(f => f.id === formData.flowerId)) {
      newErrors.flowerId = '鲜花编号不存在';
    }

    const actualStock = parseInt(formData.actualStock);
    if (formData.actualStock === '' || isNaN(actualStock) || actualStock < 0) {
      newErrors.actualStock = '实际库存必须是非负整数';
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

    const stocktakeResult = performStocktake({
      flowerId: formData.flowerId,
      systemStock,
      actualStock: actualStockNum,
      operator: formData.operator.trim(),
      date: formData.date,
      remark: formData.remark.trim(),
    });

    if (stocktakeResult) {
      setResult({
        type: stocktakeResult.type,
        quantity: stocktakeResult.quantity,
        diff,
      });
      setShowSuccess(true);
    }
  };

  const resetForm = () => {
    setFormData({
      flowerId: '',
      actualStock: '',
      date: getTodayDateString(),
      operator: '',
      remark: '',
    });
    setErrors({});
    setResult(null);
    setShowSuccess(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="库存盘点"
      description="核对鲜花实际库存与系统库存差异"
    >
      {showSuccess && result ? (
        <div className="space-y-6">
          <div className={cn(
            'p-6 rounded-xl text-center',
            result.type === '盘盈'
              ? 'bg-blue-50'
              : result.type === '盘亏'
                ? 'bg-orange-50'
                : 'bg-green-50'
          )}>
            {result.type === '盘盈' ? (
              <CheckCircle className="h-16 w-16 mx-auto text-blue-500 mb-3" />
            ) : result.type === '盘亏' ? (
              <XCircle className="h-16 w-16 mx-auto text-orange-500 mb-3" />
            ) : (
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-3" />
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {result.type ? `${result.type} ${result.quantity} 枝` : '库存一致'}
            </h3>
            <p className="text-gray-600">
              {result.type
                ? `已自动生成${result.type}记录，库存已同步更新`
                : '实际库存与系统库存一致，无需调整'}
            </p>
            {selectedFlowerData && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-gray-500">盘点前系统库存</p>
                  <p className="font-bold text-lg text-gray-900">{systemStock}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-gray-500">实际库存</p>
                  <p className="font-bold text-lg text-gray-900">{actualStockNum}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-gray-500">差异</p>
                  <p className={cn(
                    'font-bold text-lg',
                    result.diff > 0 ? 'text-blue-600' : result.diff < 0 ? 'text-orange-600' : 'text-green-600'
                  )}>
                    {result.diff > 0 ? '+' : ''}{result.diff}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              关闭
            </Button>
            <Button
              type="button"
              onClick={() => {
                resetForm();
              }}
            >
              继续盘点
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              选择鲜花
            </label>
            <Select
              value={formData.flowerId}
              onValueChange={(value) => {
                setFormData({ ...formData, flowerId: value });
                setErrors({ ...errors, flowerId: undefined });
              }}
            >
              {activeFlowers.map((flower) => (
                <SelectItem key={flower.id} value={flower.id}>
                  {flower.name} ({flower.id}) - 系统库存: {flower.currentStock}
                </SelectItem>
              ))}
            </Select>
            {errors.flowerId && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.flowerId}
              </p>
            )}
          </div>

          {selectedFlowerData && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedFlowerData.name}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedFlowerData.type} · {selectedFlowerData.location}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">系统库存：</span>
                  <span className="font-semibold text-gray-900">{selectedFlowerData.currentStock} 枝</span>
                </div>
                <div>
                  <span className="text-gray-500">安全库存：</span>
                  <span className="font-semibold text-gray-900">{selectedFlowerData.safeStock} 枝</span>
                </div>
              </div>
            </div>
          )}

          {selectedFlowerData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="系统库存（自动读取）"
                  type="number"
                  value={systemStock.toString()}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Input
                  label="实际库存 *"
                  type="number"
                  min="0"
                  value={formData.actualStock}
                  onInput={(e) => {
                    setFormData({ ...formData, actualStock: (e.target as HTMLInputElement).value });
                    setErrors({ ...errors, actualStock: undefined });
                  }}
                  error={errors.actualStock}
                  placeholder="请输入实际盘点数量"
                />
              </div>
            </div>
          )}

          {selectedFlowerData && formData.actualStock !== '' && !isNaN(actualStockNum) && (
            <div className={cn(
              'p-4 rounded-lg border flex items-center gap-3',
              diff === 0
                ? 'bg-green-50 border-green-200'
                : diff > 0
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-orange-50 border-orange-200'
            )}>
              <ClipboardCheck className={cn(
                'h-6 w-6 shrink-0',
                diff === 0
                  ? 'text-green-500'
                  : diff > 0
                    ? 'text-blue-500'
                    : 'text-orange-500'
              )} />
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  diff === 0
                    ? 'text-green-700'
                    : diff > 0
                      ? 'text-blue-700'
                      : 'text-orange-700'
                )}>
                  {diff === 0
                    ? '库存一致，无需调整'
                    : diff > 0
                      ? `盘盈：+${diff} 枝`
                      : `盘亏：${diff} 枝`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  系统 {systemStock} 枝，实际 {actualStockNum} 枝
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="盘点日期"
              type="date"
              value={formData.date}
              onInput={(e) => setFormData({ ...formData, date: (e.target as HTMLInputElement).value })}
            />
            <Input
              label="经办人 *"
              value={formData.operator}
              onInput={(e) => {
                setFormData({ ...formData, operator: (e.target as HTMLInputElement).value });
                setErrors({ ...errors, operator: undefined });
              }}
              error={errors.operator}
              placeholder="请输入经办人姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              备注
            </label>
            <textarea
              className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              value={formData.remark}
              onInput={(e) => setFormData({ ...formData, remark: (e.target as HTMLTextAreaElement).value })}
              placeholder="可选：添加盘点备注信息"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              取消
            </Button>
            <Button type="submit">
              <ClipboardCheck className="h-4 w-4 mr-1" />
              确认盘点
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
