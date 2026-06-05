import { useState } from 'preact/hooks';
import { Search, Edit2, Eye, Trash2, Plus } from 'lucide-preact';
import type { Flower, RecordType } from '@/types';
import { STATUS_COLORS } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import { useFlowerStore } from '@/store/useFlowerStore';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { FlowerDetail } from '@/components/FlowerDetail';

interface FlowerListProps {
  onEdit: (flower: Flower) => void;
  onRecord: (type: RecordType, flower: Flower) => void;
}

export function FlowerList({ onEdit, onRecord }: FlowerListProps) {
  const { flowers } = useFlowerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredFlowers = flowers.filter(flower =>
    flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flower.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (flower: Flower) => {
    setSelectedFlower(flower);
    setDrawerOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
          />
        )}
      </Drawer>
    </div>
  );
}
