import { useState, useEffect, useMemo } from 'preact/hooks';
import type { PackageTemplate, UsageType } from '@/types';
import { USAGE_TYPES, PACKAGE_TYPE_COLORS } from '@/utils/constants';
import { useFlowerStore } from '@/store/useFlowerStore';
import { getTodayDateString, cn } from '@/utils/helpers';
import { validatePackageUsageForm } from '@/services/validationService';
import { canDeductPackageStock } from '@/services/flowerService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import { Dialog } from '@/components/ui/Dialog';
import { AlertCircle, Package, Flower2, CheckCircle2, XCircle } from 'lucide-preact';

interface PackageUsageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage?: PackageTemplate | null;
}

export function PackageUsageForm({ open, onOpenChange, selectedPackage }: PackageUsageFormProps) {
  const { flowers, packageTemplates, createPackageUsage } = useFlowerStore();

  const [formData, setFormData] = useState({
    packageId: selectedPackage?.id || '',
    date: getTodayDateString(),
    recipient: '',
    usage: USAGE_TYPES[0] as UsageType,
    createdBy: '',
    remark: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        packageId: selectedPackage?.id || '',
        date: getTodayDateString(),
        recipient: '',
        usage: USAGE_TYPES[0],
        createdBy: '',
        remark: '',
      });
      setErrors({});
      setSubmitError('');
    }
  }, [open, selectedPackage]);

  const selectedPkg = useMemo(
    () => packageTemplates.find((p) => p.id === formData.packageId),
    [formData.packageId, packageTemplates]
  );

  const stockStatus = useMemo(() => {
    if (!selectedPkg) return { available: false, items: [] as { name: string; need: number; stock: number; ok: boolean }[] };
    const result = canDeductPackageStock(flowers, selectedPkg.flowers);
    return {
      available: result.ok,
      items: result.details.map((d) => ({
        name: d.flowerName,
        need: d.need,
        stock: d.stock,
        ok: d.ok,
      })),
    };
  }, [selectedPkg, flowers]);

  const totalFlowers = selectedPkg?.flowers.reduce((sum, f) => sum + f.quantity, 0) || 0;

  const validate = (): boolean => {
    const result = validatePackageUsageForm(formData, stockStatus.available);
    setErrors(result.errors);
    return result.valid;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const result = createPackageUsage({
      packageId: formData.packageId,
      date: formData.date,
      recipient: formData.recipient.trim(),
      usage: formData.usage,
      createdBy: formData.createdBy.trim(),
      remark: formData.remark.trim(),
    });

    if (!result) {
      setSubmitError('套餐领用失败，请检查鲜花库存是否充足');
      return;
    }

    onOpenChange(false);
    setFormData({
      packageId: '',
      date: getTodayDateString(),
      recipient: '',
      usage: USAGE_TYPES[0],
      createdBy: '',
      remark: '',
    });
    setErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="套餐领用登记"
      description="选择套餐并填写领用信息，系统将自动扣减库存并生成组合出库记录"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="选择套餐"
          value={formData.packageId}
          onValueChange={(value) => setFormData({ ...formData, packageId: value })}
        >
          {packageTemplates.length === 0 ? (
            <SelectItem value="" disabled>
              暂无可使用的套餐模板
            </SelectItem>
          ) : (
            packageTemplates.map((pkg) => (
              <SelectItem key={pkg.id} value={pkg.id}>
                {pkg.name} ({pkg.type})
              </SelectItem>
            ))
          )}
        </Select>
        {errors.packageId && <p className="text-sm text-red-600 -mt-2">{errors.packageId}</p>}

        {selectedPkg && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-gray-900">{selectedPkg.name}</span>
                  {selectedPkg.type && (
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      PACKAGE_TYPE_COLORS[selectedPkg.type]
                    )}>
                      {selectedPkg.type}
                    </span>
                  )}
                </div>
                {selectedPkg.description && (
                  <p className="text-xs text-gray-500">{selectedPkg.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">合计</p>
                <p className="text-lg font-bold text-gray-900">{totalFlowers} 枝</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {stockStatus.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <Flower2 className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-400">× {item.need}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      item.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      库存: {item.stock}
                    </span>
                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!stockStatus.available && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                部分鲜花库存不足，无法领用此套餐
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="使用日期"
            type="date"
            value={formData.date}
            onInput={(e) => setFormData({ ...formData, date: (e.target as HTMLInputElement).value })}
            error={errors.date}
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
          {errors.usage && <p className="text-sm text-red-600 -mt-2 col-span-2">{errors.usage}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="领用人"
            value={formData.recipient}
            onInput={(e) => setFormData({ ...formData, recipient: (e.target as HTMLInputElement).value })}
            error={errors.recipient}
            placeholder="请输入领用人姓名"
          />
          <Input
            label="经办人"
            value={formData.createdBy}
            onInput={(e) => setFormData({ ...formData, createdBy: (e.target as HTMLInputElement).value })}
            error={errors.createdBy}
            placeholder="请输入经办人姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">备注</label>
          <textarea
            className="w-full h-20 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            value={formData.remark}
            onInput={(e) => setFormData({ ...formData, remark: (e.target as HTMLTextAreaElement).value })}
            placeholder="可选：添加领用备注信息"
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
              setErrors({});
              setSubmitError('');
            }}
          >
            取消
          </Button>
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={!stockStatus.available}
          >
            确认领用
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
