import { useState } from 'preact/hooks';
import { MapPin, Package, AlertTriangle, Calendar, User, FileText, Plus, Trash2, Edit2, ClipboardCheck, LogOut, ChevronDown, ChevronUp } from 'lucide-preact';
import type { Flower, RecordType } from '@/types';
import { STATUS_COLORS, RECORD_TYPE_COLORS, RECORD_TYPE_TEXT_COLORS, OUTBOUND_COLOR, OUTBOUND_TEXT_COLOR, USAGE_TYPE_COLORS } from '@/utils/constants';
import { cn, formatDate, formatDateTime } from '@/utils/helpers';
import { useFlowerStore } from '@/store/useFlowerStore';
import { Button } from '@/components/ui/Button';

interface FlowerDetailProps {
  flower: Flower;
  onEdit: () => void;
  onRecord: (type: RecordType) => void;
  onStocktake: () => void;
  onOutbound: () => void;
}

export function FlowerDetail({ flower, onEdit, onRecord, onStocktake, onOutbound }: FlowerDetailProps) {
  const { getFlowerRecords, getFlowerOutboundRecords } = useFlowerStore();
  const records = getFlowerRecords(flower.id);
  const outboundRecords = getFlowerOutboundRecords(flower.id);
  const isLowStock = flower.currentStock < flower.safeStock;

  const [showOutbound, setShowOutbound] = useState(true);
  const [showOperations, setShowOperations] = useState(true);

  const totalOutbound = outboundRecords.reduce((sum, r) => sum + r.quantity, 0);

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

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
            <Package className="h-3.5 w-3.5" />
            当前库存
          </div>
          <p className={cn(
            'text-xl font-bold',
            isLowStock && flower.currentStock > 0 && 'text-warning-600',
            flower.currentStock === 0 && 'text-danger-600',
            !isLowStock && 'text-gray-900'
          )}>
            {flower.currentStock}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            安全库存
          </div>
          <p className="text-xl font-bold text-gray-900">
            {flower.safeStock}
          </p>
        </div>
        <div className="p-3 bg-violet-50 rounded-lg">
          <div className="flex items-center gap-1 text-violet-500 text-xs mb-1">
            <LogOut className="h-3.5 w-3.5" />
            累计出库
          </div>
          <p className="text-xl font-bold text-violet-700">
            {totalOutbound}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">鲜花编号</span>
          <span className="font-medium text-gray-900 text-sm">{flower.id}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">鲜花名称</span>
          <span className="font-medium text-gray-900 text-sm">{flower.name}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">鲜花类型</span>
          <span className="font-medium text-gray-900 text-sm">{flower.type}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">冷柜位置</span>
          <span className="font-medium text-gray-900 text-sm flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            {flower.location || '未设置'}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">更新时间</span>
          <span className="font-medium text-gray-900 text-xs">
            {formatDateTime(flower.updatedAt)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onRecord('补货')}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          补货
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onRecord('损耗')}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          损耗
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-200 text-blue-600 hover:bg-blue-50"
          onClick={onStocktake}
        >
          <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
          盘点
        </Button>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700"
          onClick={onOutbound}
        >
          <LogOut className="h-3.5 w-3.5 mr-1" />
          出库
        </Button>
      </div>

      <div>
        <button
          onClick={() => setShowOutbound(!showOutbound)}
          className="w-full flex items-center justify-between py-2 mb-2"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <LogOut className="h-4 w-4 text-violet-600" />
            出库记录
            <span className="text-xs font-normal text-gray-400">({outboundRecords.length}条)</span>
          </h3>
          {showOutbound ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {showOutbound && (
          outboundRecords.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>暂无出库记录</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {outboundRecords.map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    'p-2.5 rounded-lg border-l-4',
                    OUTBOUND_COLOR
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('font-medium text-sm', OUTBOUND_TEXT_COLOR)}>
                      出库 -{record.quantity} 枝
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
                      {record.recipient}
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
          )
        )}
      </div>

      <div>
        <button
          onClick={() => setShowOperations(!showOperations)}
          className="w-full flex items-center justify-between py-2 mb-2"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" />
            操作记录
            <span className="text-xs font-normal text-gray-400">({records.length}条)</span>
          </h3>
          {showOperations ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {showOperations && (
          records.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>暂无操作记录</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {records.map((record) => (
                <div
                  key={record.id}
                  className={cn(
                    'p-2.5 rounded-lg border-l-4',
                    RECORD_TYPE_COLORS[record.type]
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      'font-medium text-sm',
                      RECORD_TYPE_TEXT_COLORS[record.type]
                    )}>
                      {record.type} {record.type === '盘亏' || record.type === '损耗' ? '-' : '+'}{record.quantity} 枝
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(record.date)}
                    </span>
                  </div>
                  {(record.type === '盘盈' || record.type === '盘亏') && record.systemStock !== undefined && (
                    <div className="text-xs text-gray-500 mb-1">
                      系统: {record.systemStock} · 实际: {record.actualStock} · 差异: {record.diffQuantity > 0 ? '+' : ''}{record.diffQuantity}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
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
          )
        )}
      </div>
    </div>
  );
}
