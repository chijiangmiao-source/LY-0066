import { useState } from 'preact/hooks';
import { Flower2, Plus, Package, AlertTriangle, TrendingUp, TrendingDown, ClipboardCheck, ArrowUpDown, XCircle, AlertCircle, LayoutGrid, LogOut, BarChart3, Users, CalendarDays } from 'lucide-preact';
import type { Flower, RecordType, FlowerStatus } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/StatCard';
import { StatusDistributionChart, RecordTrendChart, OutboundTrendChart, UsageDistributionChart } from '@/components/Charts';
import { FlowerList } from '@/components/FlowerList';
import { FlowerForm } from '@/components/FlowerForm';
import { RecordForm } from '@/components/RecordForm';
import { StocktakeForm } from '@/components/StocktakeForm';
import { OutboundForm } from '@/components/OutboundForm';
import { OutboundList } from '@/components/OutboundList';
import { cn, getTodayDateString } from '@/utils/helpers';

type ActiveView = 'inventory' | 'outbound';

export function App() {
  const { flowers, records, outboundRecords } = useFlowerStore();

  const [flowerFormOpen, setFlowerFormOpen] = useState(false);
  const [editFlower, setEditFlower] = useState<Flower | null>(null);

  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('补货');
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);

  const [stocktakeFormOpen, setStocktakeFormOpen] = useState(false);
  const [stocktakeFlower, setStocktakeFlower] = useState<Flower | null>(null);

  const [outboundFormOpen, setOutboundFormOpen] = useState(false);
  const [outboundFlower, setOutboundFlower] = useState<Flower | null>(null);

  const [quickFilter, setQuickFilter] = useState<'all' | 'low' | 'out'>('all');
  const [activeView, setActiveView] = useState<ActiveView>('inventory');

  const totalStock = flowers.reduce((sum, f) => sum + f.currentStock, 0);
  const lowStockCount = flowers.filter(f => f.status === '偏低').length;
  const outOfStockCount = flowers.filter(f => f.status === '缺货').length;
  const totalReplenish = records.filter(r => r.type === '补货').reduce((sum, r) => sum + r.quantity, 0);
  const totalWaste = records.filter(r => r.type === '损耗').reduce((sum, r) => sum + r.quantity, 0);
  const totalSurplus = records.filter(r => r.type === '盘盈').reduce((sum, r) => sum + r.quantity, 0);
  const totalShortage = records.filter(r => r.type === '盘亏').reduce((sum, r) => sum + r.quantity, 0);

  const totalOutbound = outboundRecords.reduce((sum, r) => sum + r.quantity, 0);
  const todayOutbound = outboundRecords.filter(r => r.date === getTodayDateString()).reduce((sum, r) => sum + r.quantity, 0);
  const recipientCount = outboundRecords.length;

  const handleEditFlower = (flower: Flower) => {
    setEditFlower(flower);
    setFlowerFormOpen(true);
  };

  const handleAddFlower = () => {
    setEditFlower(null);
    setFlowerFormOpen(true);
  };

  const handleRecord = (type: RecordType, flower?: Flower) => {
    setRecordType(type);
    setSelectedFlower(flower || null);
    setRecordFormOpen(true);
  };

  const handleStocktake = (flower?: Flower) => {
    setStocktakeFlower(flower || null);
    setStocktakeFormOpen(true);
  };

  const handleOutbound = (flower?: Flower) => {
    setOutboundFlower(flower || null);
    setOutboundFormOpen(true);
  };

  const handleQuickFilter = (filter: 'all' | 'low' | 'out') => {
    setQuickFilter(filter);
  };

  const handleFilterChange = (_filters: { status: FlowerStatus | 'all'; type: string; location: string }) => {
    setQuickFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-700 rounded-lg">
                <Flower2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">鲜花冷柜库存管理</h1>
                <p className="text-xs text-gray-500">殡葬服务机构鲜花库存系统</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('inventory')}
                  className={cn(
                    activeView === 'inventory' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Package className="h-4 w-4 mr-1" />
                  库存管理
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('outbound')}
                  className={cn(
                    activeView === 'outbound' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  出库管理
                </Button>
              </div>
              {activeView === 'inventory' ? (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter('out')}
                    className={cn(
                      'border-red-200',
                      quickFilter === 'out' ? 'bg-red-50 text-red-700 border-red-300' : 'text-red-600 hover:bg-red-50'
                    )}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    缺货 ({outOfStockCount})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter('low')}
                    className={cn(
                      'border-yellow-200',
                      quickFilter === 'low' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' : 'text-yellow-600 hover:bg-yellow-50'
                    )}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    偏低 ({lowStockCount})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter('all')}
                    className={cn(
                      quickFilter === 'all' ? 'bg-gray-100 text-gray-700' : ''
                    )}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    全部
                  </Button>
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
                  <Button
                    variant="outline"
                    onClick={() => handleOutbound()}
                    className="border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    出库登记
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRecord('损耗')}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    损耗记录
                  </Button>
                  <Button
                    onClick={() => handleRecord('补货')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    补货登记
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStocktake()}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-1" />
                    库存盘点
                  </Button>
                  <Button onClick={handleAddFlower}>
                    <Plus className="h-4 w-4 mr-1" />
                    新增鲜花
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleOutbound()}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    登记出库
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'inventory' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <StatCard
                title="库存总量"
                value={`${totalStock} 枝`}
                icon={<Package className="h-5 w-5" />}
                color="green"
              />
              <StatCard
                title="库存偏低"
                value={`${lowStockCount} 种`}
                icon={<AlertCircle className="h-5 w-5" />}
                color={lowStockCount > 0 ? 'yellow' : 'green'}
              />
              <StatCard
                title="缺货品种"
                value={`${outOfStockCount} 种`}
                icon={<XCircle className="h-5 w-5" />}
                color={outOfStockCount > 0 ? 'red' : 'green'}
              />
              <StatCard
                title="累计补货"
                value={`${totalReplenish} 枝`}
                icon={<TrendingUp className="h-5 w-5" />}
                color="blue"
              />
              <StatCard
                title="累计损耗"
                value={`${totalWaste} 枝`}
                icon={<TrendingDown className="h-5 w-5" />}
                color="red"
              />
              <StatCard
                title="盘盈/盘亏"
                value={`+${totalSurplus} / -${totalShortage}`}
                icon={<ArrowUpDown className="h-5 w-5" />}
                color={totalShortage > totalSurplus ? 'yellow' : 'purple'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">库存状态分布</h3>
                <StatusDistributionChart flowers={flowers} width={260} height={200} />
              </div>
              <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">近7天补货/损耗趋势</h3>
                <RecordTrendChart records={records} width={580} height={200} />
              </div>
            </div>

            <FlowerList
              onEdit={handleEditFlower}
              onRecord={handleRecord}
              onStocktake={handleStocktake}
              onOutbound={handleOutbound}
              quickFilter={quickFilter}
              onFilterChange={handleFilterChange}
            />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="累计出库"
                value={`${totalOutbound} 枝`}
                icon={<LogOut className="h-5 w-5" />}
                color="purple"
              />
              <StatCard
                title="今日出库"
                value={`${todayOutbound} 枝`}
                icon={<CalendarDays className="h-5 w-5" />}
                color="blue"
              />
              <StatCard
                title="出库记录"
                value={`${outboundRecords.length} 条`}
                icon={<BarChart3 className="h-5 w-5" />}
                color="green"
              />
              <StatCard
                title="领用人次"
                value={`${recipientCount} 次`}
                icon={<Users className="h-5 w-5" />}
                color="yellow"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">热门用途分布</h3>
                <UsageDistributionChart records={outboundRecords} width={280} height={260} />
              </div>
              <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">出库趋势分析</h3>
                <OutboundTrendChart records={outboundRecords} width={580} height={240} />
              </div>
            </div>

            <OutboundList onRecordOutbound={handleOutbound} />
          </>
        )}
      </main>

      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            鲜花冷柜库存管理系统 · 数据存储于本地浏览器
          </p>
        </div>
      </footer>

      <FlowerForm
        open={flowerFormOpen}
        onOpenChange={setFlowerFormOpen}
        editFlower={editFlower}
      />

      <RecordForm
        open={recordFormOpen}
        onOpenChange={setRecordFormOpen}
        type={recordType}
        selectedFlower={selectedFlower}
      />

      <StocktakeForm
        open={stocktakeFormOpen}
        onOpenChange={setStocktakeFormOpen}
        selectedFlower={stocktakeFlower}
      />

      <OutboundForm
        open={outboundFormOpen}
        onOpenChange={setOutboundFormOpen}
        selectedFlower={outboundFlower}
      />
    </div>
  );
}
