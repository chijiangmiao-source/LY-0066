import { useState } from 'preact/hooks';
import { Search, Edit2, Eye, Trash2, Plus, ClipboardCheck, Filter, X } from 'lucide-preact';
import type { Flower, RecordType, FlowerStatus } from '@/types';
import { STATUS_COLORS, FLOWER_STATUSES } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import { useFlowerStore } from '@/store/useFlowerStore';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Select, SelectItem } from '@/components/ui/Select';
import { FlowerDetail } from '@/components/FlowerDetail';

interface FlowerListProps {
  onEdit: (flower: Flower) => void;
  onRecord: (type: RecordType, flower: Flower) => void;
  onStocktake: (flower: Flower) => void;
  filterStatus?: FlowerStatus | 'all';
  filterType?: string;
  filterLocation?: string;
  onFilterChange?: (filters: { status: FlowerStatus | 'all'; type: string; location: string }) => void;
  quickFilter?: 'all' | 'low' | 'out';
}

export function FlowerList({
  onEdit,
  onRecord,
  onStocktake,
  filterStatus = 'all',
  filterType = 'all',
  filterLocation = 'all',
  onFilterChange,
  quickFilter = 'all',
}: FlowerListProps) {
  const { flowers, flowerTypes } = useFlowerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [localStatus, setLocalStatus] = useState<FlowerStatus | 'all'>(filterStatus);
  const [localType, setLocalType] = useState<string>(filterType);
  const [localLocation, setLocalLocation] = useState<string>(filterLocation);

  const allLocations = Array.from(new Set(flowers.map(f => f.location).filter(Boolean)));
  const allTypes = flowerTypes?.length ? flowerTypes : [];

  const filteredFlowers = flowers.filter(flower => {
    const matchesSearch =
      flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flower.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flower.type.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (quickFilter === 'low') {
      matchesStatus = flower.status === '偏低';
    } else if (quickFilter === 'out') {
      matchesStatus = flower.status === '缺货';
    } else if (localStatus !== 'all') {
      matchesStatus = flower.status === localStatus;
    }

    const matchesType = localType === 'all' || flower.type === localType;
    const matchesLocation = localLocation === 'all' || flower.location === localLocation;

    return matchesSearch && matchesStatus && matchesType && matchesLocation;
  });

  const emitFilterChange = (status: FlowerStatus | 'all', type: string, location: string) => {
    setLocalStatus(status);
    setLocalType(type);
    setLocalLocation(location);
    onFilterChange?.({ status, type, location });
  };

  const resetFilters = () => {
    emitFilterChange('all', 'all', 'all');
  };

  const hasActiveFilters = localStatus !== 'all' || localType !== 'all' || localLocation !== 'all' || quickFilter !== 'all';

  const handleViewDetail = (flower: Flower) => {
    setSelectedFlower(flower);
    setDrawerOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">鲜花库存</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索鲜花编号、名称..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500 lg:w-20 shrink-0">
            <Filter className="h-4 w-4" />
            筛选:
          </div>
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="w-40">
              <Select
                value={localStatus}
                onValueChange={(value) => emitFilterChange(value as FlowerStatus | 'all', localType, localLocation)}
              >
                <SelectItem value="all">全部状态</SelectItem>
                {FLOWER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="w-40">
              <Select
                value={localType}
                onValueChange={(value) => emitFilterChange(localStatus, value, localLocation)}
              >
                <SelectItem value="all">全部类型</SelectItem>
                {allTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="w-40">
              <Select
                value={localLocation}
                onValueChange={(value) => emitFilterChange(localStatus, localType, value)}
              >
                <SelectItem value="all">全部位置</SelectItem>
                {allLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              重置
            </Button>
          )}
        </div>

        {quickFilter === 'low' && (
          <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            当前视图：只显示库存偏低的鲜花
          </div>
        )}
        {quickFilter === 'out' && (
          <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            当前视图：只显示缺货的鲜花
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                鲜花编号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                鲜花名称
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                当前库存
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                安全库存
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                冷柜位置
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFlowers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Plus className="h-12 w-12 text-gray-300 mb-3" />
                    <p>暂无鲜花数据</p>
                    <p className="text-sm text-gray-400 mt-1">点击"新增鲜花"添加第一个品种</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredFlowers.map((flower) => {
                const isLowStock = flower.currentStock < flower.safeStock;
                return (
                  <tr key={flower.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {flower.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {flower.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flower.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={cn(
                        'font-medium',
                        isLowStock && flower.currentStock > 0 && 'text-warning-600',
                        flower.currentStock === 0 && 'text-danger-600'
                      )}>
                        {flower.currentStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flower.safeStock}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {flower.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        STATUS_COLORS[flower.status]
                      )}>
                        {flower.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(flower)}
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(flower)}
                          title="编辑"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStocktake(flower)}
                          title="库存盘点"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRecord('补货', flower)}
                          title="补货"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRecord('损耗', flower)}
                          title="损耗"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedFlower?.name || '鲜花详情'}
        description={selectedFlower?.id}
      >
        {selectedFlower && (
          <FlowerDetail
            flower={selectedFlower}
            onEdit={() => {
              setDrawerOpen(false);
              onEdit(selectedFlower);
            }}
            onRecord={(type) => {
              setDrawerOpen(false);
              onRecord(type, selectedFlower);
            }}
            onStocktake={() => {
              setDrawerOpen(false);
              onStocktake(selectedFlower);
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
