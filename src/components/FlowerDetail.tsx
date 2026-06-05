import { MapPin, Package, AlertTriangle, Calendar, User, FileText, Plus, Trash2, Edit2 } from 'lucide-preact';
import type { Flower, RecordType } from '@/types';
import { STATUS_COLORS } from '@/utils/constants';
import { cn, formatDate, formatDateTime } from '@/utils/helpers';
import { useFlowerStore } from '@/store/useFlowerStore';
import { Button } from '@/components/ui/Button';

interface FlowerDetailProps {
  flower: Flower;
  onEdit: () => void;
  onRecord: (type: RecordType) => void;
}

export function FlowerDetail({ flower, onEdit, onRecord }: FlowerDetailProps) {
  const { getFlowerRecords } = useFlowerStore();
  const records = getFlowerRecords(flower.id);
  const isLowStock = flower.currentStock < flower.safeStock;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          STATUS_COLORS[flower.status]
        )}>
          {flower.status}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-1" />
            编辑
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Package className="h-4 w-4" />
            当前库存
          </div>
          <p className={cn(
            'text-2xl font-bold',
            isLowStock && flower.currentStock > 0 && 'text-warning-600',
            flower.currentStock === 0 && 'text-danger-600',
            !isLowStock && 'text-gray-900'
          )}>
            {flower.currentStock} 枝
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <AlertTriangle className="h-4 w-4" />
            安全库存
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {flower.safeStock} 枝
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500">鲜花编号</span>
          <span className="font-medium text-gray-900">{flower.id}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500">鲜花名称</span>
          <span className="font-medium text-gray-900">{flower.name}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500">鲜花类型</span>
          <span className="font-medium text-gray-900">{flower.type}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500">冷柜位置</span>
          <span className="font-medium text-gray-900 flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            {flower.location || '未设置'}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500">更新时间</span>
          <span className="font-medium text-gray-900 text-sm">
            {formatDateTime(flower.updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          className="flex-1"
          onClick={() => onRecord('补货')}
        >
          <Plus className="h-4 w-4 mr-1" />
          补货登记
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          onClick={() => onRecord('损耗')}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          损耗记录
        </Button>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">操作记录</h3>
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>暂无操作记录</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {records.map((record) => (
              <div
                key={record.id}
                className={cn(
                  'p-3 rounded-lg border-l-4',
                  record.type === '补货'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    'font-medium text-sm',
                    record.type === '补货' ? 'text-green-700' : 'text-red-700'
                  )}>
                    {record.type} {record.type === '补货' ? '+' : '-'}{record.quantity} 枝
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(record.date)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {record.operator}
                  </span>
                  {record.remark && (
                    <span className="flex items-center gap-1 truncate">
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      {record.remark}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
