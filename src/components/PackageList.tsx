import { useState, useMemo } from 'preact/hooks';
import type { PackageTemplate, PackageFilters, PackageType, PackageUsageRecord } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { PACKAGE_TYPES, PACKAGE_TYPE_COLORS, USAGE_TYPE_COLORS } from '@/utils/constants';
import { cn, formatDate, formatDateTime, isDateInRange } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectItem } from '@/components/ui/Select';
import {
  Package,
  Plus,
  Search,
  X,
  Flower2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  LogOut,
  Calendar,
  User,
  FileText,
  Eye,
  AlertCircle,
} from 'lucide-preact';

interface PackageListProps {
  onAdd: () => void;
  onEdit: (pkg: PackageTemplate) => void;
  onView: (pkg: PackageTemplate) => void;
  onUse: (pkg?: PackageTemplate) => void;
}

export function PackageList({ onAdd, onEdit, onView, onUse }: PackageListProps) {
  const {
    getFilteredPackageTemplates,
    packageTemplates,
    getPackageUsageRecords,
    deletePackageTemplate,
    flowers,
    packageUsageRecords,
  } = useFlowerStore();

  const [filters, setFilters] = useState<PackageFilters>({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    createdBy: '',
  });

  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'templates' | 'usage'>('templates');

  const dateRangeInvalid = filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo;

  const hasActiveFilters =
    filters.type !== 'all' || filters.dateFrom || filters.dateTo || filters.createdBy.trim();

  const filteredTemplates = useMemo(() => {
    if (dateRangeInvalid) return packageTemplates;
    const filterActive =
      filters.type !== 'all' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.createdBy.trim() !== '';
    return filterActive ? getFilteredPackageTemplates(filters) : packageTemplates;
  }, [filters, packageTemplates, getFilteredPackageTemplates, dateRangeInvalid]);

  const usageRecords = useMemo(() => {
    return packageUsageRecords
      .filter((r) => {
        if (filters.type !== 'all' && r.packageType !== filters.type) return false;
        if ((filters.dateFrom || filters.dateTo) && !isDateInRange(r.date, filters.dateFrom || '', filters.dateTo || '')) return false;
        if (filters.createdBy && !r.createdBy.includes(filters.createdBy.trim())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filters, packageUsageRecords]);

  const resetFilters = () => {
    setFilters({
      type: 'all',
      dateFrom: '',
      dateTo: '',
      createdBy: '',
    });
  };

  const handleDelete = (pkg: PackageTemplate) => {
    if (confirm(`确定要删除套餐模板「${pkg.name}」吗？相关领用记录也将被删除。`)) {
      deletePackageTemplate(pkg.id);
    }
  };

  const checkStockAvailable = (pkg: PackageTemplate): { ok: boolean; missing: string[] } => {
    const missing: string[] = [];
    for (const item of pkg.flowers) {
      const flower = flowers.find((f) => f.id === item.flowerId);
      if (!flower || flower.currentStock < item.quantity) {
        missing.push(flower?.name || item.flowerName || '未知');
      }
    }
    return { ok: missing.length === 0, missing };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('templates')}
                className={cn(
                  viewMode === 'templates' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Package className="h-4 w-4 mr-1" />
                套餐模板
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('usage')}
                className={cn(
                  viewMode === 'usage' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <LogOut className="h-4 w-4 mr-1" />
                领用记录
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              {viewMode === 'templates'
                ? `共 ${filteredTemplates.length} 个模板`
                : `共 ${usageRecords.length} 条记录`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              筛选
            </Button>
            {viewMode === 'templates' && (
              <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-1" />
                新增套餐
              </Button>
            )}
            {viewMode === 'usage' && (
              <Button onClick={() => onUse()} className="bg-indigo-600 hover:bg-indigo-700">
                <LogOut className="h-4 w-4 mr-1" />
                套餐领用
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label={viewMode === 'templates' ? '套餐类型' : '套餐类型'}
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value as PackageType | 'all' })}
              >
                <SelectItem value="all">全部类型</SelectItem>
                {PACKAGE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label={viewMode === 'templates' ? '创建日期(起)' : '使用日期(起)'}
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onInput={(e) => setFilters({ ...filters, dateFrom: (e.target as HTMLInputElement).value })}
              />

              <Input
                label={viewMode === 'templates' ? '创建日期(止)' : '使用日期(止)'}
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onInput={(e) => setFilters({ ...filters, dateTo: (e.target as HTMLInputElement).value })}
              />

              <Input
                label={viewMode === 'templates' ? '创建人' : '经办人'}
                value={filters.createdBy}
                onInput={(e) => setFilters({ ...filters, createdBy: (e.target as HTMLInputElement).value })}
                placeholder="搜索姓名"
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
        {viewMode === 'templates' ? (
          filteredTemplates.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">
                {hasActiveFilters ? '没有符合筛选条件的套餐模板' : '暂无套餐模板'}
              </p>
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-1" />
                创建第一个套餐
              </Button>
            </div>
          ) : (
            filteredTemplates.map((pkg) => {
              const usageCount = getPackageUsageRecords(pkg.id).length;
              const totalQty = pkg.flowers.reduce((s, f) => s + f.quantity, 0);
              const stock = checkStockAvailable(pkg);
              return (
                <div key={pkg.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                        <Package className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{pkg.name}</span>
                          <span className="text-xs text-gray-400">({pkg.id})</span>
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            PACKAGE_TYPE_COLORS[pkg.type]
                          )}>
                            {pkg.type}
                          </span>
                          {!stock.ok && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              库存不足
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-1">{pkg.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Flower2 className="h-3.5 w-3.5" />
                            {pkg.flowers.length} 种 · {totalQty} 枝
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {pkg.createdBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(pkg.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <LogOut className="h-3.5 w-3.5" />
                            已领用 {usageCount} 次
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onView(pkg)} title="查看详情">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onUse(pkg)} title="领用套餐" disabled={!stock.ok}>
                        <LogOut className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(pkg)} title="编辑">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pkg)}
                        title="删除"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          usageRecords.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">
                {hasActiveFilters ? '没有符合筛选条件的领用记录' : '暂无领用记录'}
              </p>
              <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={() => onUse()}>
                <LogOut className="h-4 w-4 mr-1" />
                登记第一条领用
              </Button>
            </div>
          ) : (
            usageRecords.map((record) => (
              <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                      <LogOut className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{record.packageName}</span>
                        {record.packageType && (
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            PACKAGE_TYPE_COLORS[record.packageType]
                          )}>
                            {record.packageType}
                          </span>
                        )}
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          USAGE_TYPE_COLORS[record.usage]
                        )}>
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
                          领用人: {record.recipient}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          经办人: {record.createdBy}
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
                    <span className="text-lg font-bold text-indigo-700">
                      -{record.items.reduce((s, i) => s + i.quantity, 0)} 枝
                    </span>
                    <span className="text-xs text-gray-400">
                      {record.items.length} 种鲜花
                    </span>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
