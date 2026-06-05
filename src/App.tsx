import { useState } from 'preact/hooks';
import { Flower2, Plus, Package, TrendingUp, TrendingDown, ClipboardCheck, ArrowUpDown, XCircle, AlertCircle, LayoutGrid, LogOut, BarChart3, Users, CalendarDays, Gift, Sparkles, Layers } from 'lucide-preact';
import type { Flower, RecordType, FlowerStatus, PackageTemplate } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { useFlowerStats } from '@/hooks/useFlowerStats';
import { useOutboundStats } from '@/hooks/useOutboundStats';
import { usePackageStats } from '@/hooks/usePackageStats';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/StatCard';
import { StatusDistributionChart, RecordTrendChart, OutboundTrendChart, UsageDistributionChart, PopularPackageChart, PackageUsageTrendChart, PackageTypeDistributionChart } from '@/components/Charts';
import { FlowerList } from '@/components/FlowerList';
import { FlowerForm } from '@/components/FlowerForm';
import { RecordForm } from '@/components/RecordForm';
import { StocktakeForm } from '@/components/StocktakeForm';
import { OutboundForm } from '@/components/OutboundForm';
import { OutboundList } from '@/components/OutboundList';
import { PackageForm } from '@/components/PackageForm';
import { PackageUsageForm } from '@/components/PackageUsageForm';
import { PackageList } from '@/components/PackageList';
import { PackageDetail } from '@/components/PackageDetail';
import { cn } from '@/utils/helpers';

type ActiveView = 'inventory' | 'outbound' | 'package';

export function App() {
  const { flowers, records, outboundRecords, packageTemplates, packageUsageRecords } = useFlowerStore();
  const flowerStats = useFlowerStats();
  const outboundStats = useOutboundStats();
  const packageStats = usePackageStats(5);

  const [flowerFormOpen, setFlowerFormOpen] = useState(false);
  const [editFlower, setEditFlower] = useState<Flower | null>(null);

  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('补货');
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);

  const [stocktakeFormOpen, setStocktakeFormOpen] = useState(false);
  const [stocktakeFlower, setStocktakeFlower] = useState<Flower | null>(null);

  const [outboundFormOpen, setOutboundFormOpen] = useState(false);
  const [outboundFlower, setOutboundFlower] = useState<Flower | null>(null);

  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [editPackage, setEditPackage] = useState<PackageTemplate | null>(null);

  const [packageUsageFormOpen, setPackageUsageFormOpen] = useState(false);
  const [selectedPackageForUsage, setSelectedPackageForUsage] = useState<PackageTemplate | null>(null);

  const [packageDetailOpen, setPackageDetailOpen] = useState(false);
  const [viewPackage, setViewPackage] = useState<PackageTemplate | null>(null);

  const [quickFilter, setQuickFilter] = useState<'all' | 'low' | 'out'>('all');
  const [activeView, setActiveView] = useState<ActiveView>('inventory');

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

  const handleAddPackage = () => {
    setEditPackage(null);
    setPackageFormOpen(true);
  };

  const handleEditPackage = (pkg: PackageTemplate) => {
    setEditPackage(pkg);
    setPackageFormOpen(true);
  };

  const handleViewPackage = (pkg: PackageTemplate) => {
    setViewPackage(pkg);
    setPackageDetailOpen(true);
  };

  const handleUsePackage = (pkg?: PackageTemplate) => {
    setSelectedPackageForUsage(pkg || null);
    setPackageUsageFormOpen(true);
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveView('package')}
                  className={cn(
                    activeView === 'package' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Gift className="h-4 w-4 mr-1" />
                  套餐管理
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
                    缺货 ({flowerStats.outOfStockCount})
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
                    偏低 ({flowerStats.lowStockCount})
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
              ) : activeView === 'outbound' ? (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleOutbound()}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    登记出库
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleUsePackage()}
                    className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    套餐领用
                  </Button>
                  <Button
                    onClick={handleAddPackage}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新增套餐
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
                value={`${flowerStats.totalStock} 枝`}
                icon={<Package className="h-5 w-5" />}
                color="green"
              />
              <StatCard
                title="库存偏低"
                value={`${flowerStats.lowStockCount} 种`}
                icon={<AlertCircle className="h-5 w-5" />}
                color={flowerStats.lowStockCount > 0 ? 'yellow' : 'green'}
              />
              <StatCard
                title="缺货品种"
                value={`${flowerStats.outOfStockCount} 种`}
                icon={<XCircle className="h-5 w-5" />}
                color={flowerStats.outOfStockCount > 0 ? 'red' : 'green'}
              />
              <StatCard
                title="累计补货"
                value={`${flowerStats.totalReplenish} 枝`}
                icon={<TrendingUp className="h-5 w-5" />}
                color="blue"
              />
              <StatCard
                title="累计损耗"
                value={`${flowerStats.totalWaste} 枝`}
                icon={<TrendingDown className="h-5 w-5" />}
                color="red"
              />
              <StatCard
                title="盘盈/盘亏"
                value={`+${flowerStats.totalSurplus} / -${flowerStats.totalShortage}`}
                icon={<ArrowUpDown className="h-5 w-5" />}
                color={flowerStats.totalShortage > flowerStats.totalSurplus ? 'yellow' : 'purple'}
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
        ) : activeView === 'outbound' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="累计出库"
                value={`${outboundStats.totalOutbound} 枝`}
                icon={<LogOut className="h-5 w-5" />}
                color="purple"
              />
              <StatCard
                title="今日出库"
                value={`${outboundStats.todayOutbound} 枝`}
                icon={<CalendarDays className="h-5 w-5" />}
                color="blue"
              />
              <StatCard
                title="出库记录"
                value={`${outboundStats.recordCount} 条`}
                icon={<BarChart3 className="h-5 w-5" />}
                color="green"
              />
              <StatCard
                title="领用人次"
                value={`${outboundStats.recipientCount} 次`}
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
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="套餐模板"
                value={`${packageStats.totalPackages} 个`}
                icon={<Layers className="h-5 w-5" />}
                color="indigo"
              />
              <StatCard
                title="累计领用"
                value={`${packageStats.totalPackageUsage} 次`}
                icon={<Gift className="h-5 w-5" />}
                color="purple"
              />
              <StatCard
                title="今日领用"
                value={`${packageStats.todayPackageUsage} 次`}
                icon={<CalendarDays className="h-5 w-5" />}
                color="blue"
              />
              <StatCard
                title="领用鲜花"
                value={`${packageStats.totalPackageFlowers} 枝`}
                icon={<Sparkles className="h-5 w-5" />}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">套餐类型分布</h3>
                <PackageTypeDistributionChart records={packageUsageRecords} width={260} height={200} />
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">热门套餐排行</h3>
                <PopularPackageChart popularPackages={packageStats.popularPackages} width={280} height={220} />
              </div>
              <div className="lg:col-span-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">套餐使用趋势</h3>
                <PackageUsageTrendChart records={packageUsageRecords} width={280} height={220} />
              </div>
            </div>

            <PackageList
              onAdd={handleAddPackage}
              onEdit={handleEditPackage}
              onView={handleViewPackage}
              onUse={handleUsePackage}
            />
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

      <PackageForm
        open={packageFormOpen}
        onOpenChange={setPackageFormOpen}
        editPackage={editPackage}
      />

      <PackageUsageForm
        open={packageUsageFormOpen}
        onOpenChange={setPackageUsageFormOpen}
        selectedPackage={selectedPackageForUsage}
      />

      <PackageDetail
        open={packageDetailOpen}
        onOpenChange={setPackageDetailOpen}
        pkg={viewPackage}
        onEdit={() => {
          setPackageDetailOpen(false);
          if (viewPackage) handleEditPackage(viewPackage);
        }}
        onUse={() => {
          setPackageDetailOpen(false);
          if (viewPackage) handleUsePackage(viewPackage);
        }}
      />
    </div>
  );
}
