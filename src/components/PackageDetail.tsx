import { useState } from 'preact/hooks';
import type { PackageTemplate } from '@/types';
import { PACKAGE_TYPE_COLORS, USAGE_TYPE_COLORS, STATUS_COLORS } from '@/utils/constants';
import { cn, formatDate, formatDateTime } from '@/utils/helpers';
import { useFlowerStore } from '@/store/useFlowerStore';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import {
  Package,
  Flower2,
  Calendar,
  User,
  FileText,
  Edit2,
  LogOut,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-preact';

interface PackageDetailProps {
  pkg: PackageTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onUse: () => void;
}

export function PackageDetail({ pkg, open, onOpenChange, onEdit, onUse }: PackageDetailProps) {
  const { getPackageUsageRecords, flowers } = useFlowerStore();
  const [showUsage, setShowUsage] = useState(true);

  if (!pkg) return null;

  const usageRecords = getPackageUsageRecords(pkg.id);
  const totalUsageQty = usageRecords.reduce(
    (sum, r) => sum + r.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalFlowers = pkg.flowers.reduce((s, f) => s + f.quantity, 0);

  const stockItems = pkg.flowers.map((f) => {
    const flower = flowers.find((fl) => fl.id === f.flowerId);
    return {
      ...f,
      stock: flower?.currentStock ?? 0,
      status: flower?.status,
      ok: !!flower && flower.currentStock >= f.quantity,
    };
  });

  const allStockOk = stockItems.every((i) => i.ok);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="套餐详情"
      description={`${pkg.name} 的详细信息`}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            PACKAGE_TYPE_COLORS[pkg.type]
          )}>
            {pkg.type}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <Button
              size="sm"
              onClick={onUse}
              disabled={!allStockOk}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              领用
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Flower2 className="h-3.5 w-3.5" />
              鲜花组成
            </div>
            <p className="text-xl font-bold text-gray-900">
              {pkg.flowers.length} 种
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Package className="h-3.5 w-3.5" />
              合计数量
            </div>
            <p className="text-xl font-bold text-gray-900">{totalFlowers} 枝</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-1 text-indigo-500 text-xs mb-1">
              <LogOut className="h-3.5 w-3.5" />
              累计领用
            </div>
            <p className="text-xl font-bold text-indigo-700">{usageRecords.length} 次</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">套餐编号</span>
            <span className="font-medium text-gray-900 text-sm">{pkg.id}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">套餐名称</span>
            <span className="font-medium text-gray-900 text-sm">{pkg.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">套餐类型</span>
            <span className="font-medium text-gray-900 text-sm">{pkg.type}</span>
          </div>
          {pkg.description && (
            <div className="py-2 border-b border-gray-100">
              <span className="text-gray-500 text-sm block mb-1">套餐描述</span>
              <p className="text-sm text-gray-900">{pkg.description}</p>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">创建人</span>
            <span className="font-medium text-gray-900 text-sm flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-gray-400" />
              {pkg.createdBy}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">创建时间</span>
            <span className="font-medium text-gray-900 text-xs">
              {formatDateTime(pkg.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 text-sm">更新时间</span>
            <span className="font-medium text-gray-900 text-xs">
              {formatDateTime(pkg.updatedAt)}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Flower2 className="h-4 w-4 text-indigo-600" />
            鲜花组成明细
            <span className="text-xs font-normal text-gray-400">
              (共 {pkg.flowers.length} 种 · {totalFlowers} 枝)
            </span>
          </h3>
          {!allStockOk && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              部分鲜花库存不足
            </div>
          )}
          <div className="space-y-2">
            {stockItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {item.flowerName || '未知鲜花'}
                    </span>
                    <span className="text-xs text-gray-400">({item.flowerId})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>需要: {item.quantity} 枝</span>
                  <span className={cn(
                    'px-1.5 py-0.5 rounded',
                    item.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  )}>
                    库存: {item.stock} 枝
                  </span>
                  {item.status && (
                    <span className={cn(
                      'px-1.5 py-0.5 rounded-full',
                      STATUS_COLORS[item.status]
                    )}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowUsage(!showUsage)}
            className="w-full flex items-center justify-between py-2 mb-2"
          >
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <LogOut className="h-4 w-4 text-indigo-600" />
              领用记录
              <span className="text-xs font-normal text-gray-400">
                ({usageRecords.length}条 · 共{totalUsageQty}枝)
              </span>
            </h3>
            {showUsage ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showUsage && (
            usageRecords.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>暂无领用记录</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {usageRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-2.5 rounded-lg border-l-4 border-indigo-500 bg-indigo-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-indigo-700">
                        领用 -{record.items.reduce((s, i) => s + i.quantity, 0)} 枝
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(record.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                        USAGE_TYPE_COLORS[record.usage]
                      )}>
                        {record.usage}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        领用人: {record.recipient}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        经办人: {record.createdBy}
                      </span>
                    </div>
                    {record.remark && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        {record.remark}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Drawer>
  );
}
