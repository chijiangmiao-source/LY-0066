import { useState, useMemo } from 'preact/hooks';
import type { UsageType, OutboundFilters, Flower } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { USAGE_TYPES, USAGE_TYPE_COLORS } from '@/utils/constants';
import { cn, formatDate } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import {
  Calendar,
  User,
  Search,
  X,
  Package,
  FileText,
  Flower2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-preact';

interface OutboundListProps {
  onRecordOutbound: (flower?: Flower) => void;
}

export function OutboundList({ onRecordOutbound }: OutboundListProps) {
  const { getFilteredOutboundRecords, outboundRecords } = useFlowerStore();

  const [filters, setFilters] = useState<OutboundFilters>({
    usage: 'all',
    dateFrom: '',
    dateTo: '',
    recipient: '',
  });

  const [showFilters, setShowFilters] = useState(true);

  const dateRangeInvalid = filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo;

  const hasActiveFilters =
    filters.usage !== 'all' || filters.dateFrom || filters.dateTo || filters.recipient.trim();

  const filteredRecords = useMemo(() => {
    if (dateRangeInvalid) return outboundRecords;
    const filterActive =
      filters.usage !== 'all' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.recipient.trim() !== '';
    return filterActive ? getFilteredOutboundRecords(filters) : outboundRecords;
  }, [filters, outboundRecords, getFilteredOutboundRecords, dateRangeInvalid]);

  const totalQuantity = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);

  const resetFilters = () => {
    setFilters({
      usage: 'all',
      dateFrom: '',
      dateTo: '',
      recipient: '',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Flower2 className="h-5 w-5 text-violet-600" />
              出库记录管理
            </h3>
            <span className="text-sm text-gray-500">
              共 {filteredRecords.length} 条记录 · {totalQuantity} 枝
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              筛选
            </Button>
            <Button
              onClick={() => onRecordOutbound()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Package className="h-4 w-4 mr-1" />
              登记出库
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="用途类型"
                value={filters.usage}
                onValueChange={(value) => setFilters({ ...filters, usage: value as UsageType | 'all' })}
              >
                <SelectItem value="all">全部用途</SelectItem>
                {USAGE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="出库日期(起)"
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onInput={(e) => setFilters({ ...filters, dateFrom: (e.target as HTMLInputElement).value })}
              />

              <Input
                label="出库日期(止)"
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onInput={(e) => setFilters({ ...filters, dateTo: (e.target as HTMLInputElement).value })}
              />

              <Input
                label="领用人"
                value={filters.recipient}
                onInput={(e) => setFilters({ ...filters, recipient: (e.target as HTMLInputElement).value })}
                placeholder="搜索领用人姓名"
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {dateRangeInvalid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                开始日期不能晚于结束日期
              </div>
            )}

            {hasActiveFilters && (
              <div className="flex items-center justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" />
                  清除筛选
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              {hasActiveFilters ? '没有符合筛选条件的出库记录' : '暂无出库记录'}
            </p>
            <Button className="mt-4" onClick={() => onRecordOutbound()}>
              <Package className="h-4 w-4 mr-1" />
              登记第一条出库
            </Button>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-violet-50 rounded-lg flex-shrink-0">
                    <Package className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {record.flowerName}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({record.flowerId})
                      </span>
                      {record.flowerType && (
                        <span className="text-xs text-gray-400">
                          · {record.flowerType}
                        </span>
                      )}
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          USAGE_TYPE_COLORS[record.usage]
                        )}
                      >
                        {record.usage}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(record.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {record.recipient}
                      </span>
                      {record.remark && (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          {record.remark}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-violet-700">
                    -{record.quantity} 枝
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
