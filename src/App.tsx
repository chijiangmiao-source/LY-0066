import { useState } from 'preact/hooks';
import { Flower2, Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-preact';
import type { Flower, RecordType } from '@/types';
import { useFlowerStore } from '@/store/useFlowerStore';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/StatCard';
import { StatusDistributionChart, RecordTrendChart } from '@/components/Charts';
import { FlowerList } from '@/components/FlowerList';
import { FlowerForm } from '@/components/FlowerForm';
import { RecordForm } from '@/components/RecordForm';

export function App() {
  const { flowers, records } = useFlowerStore();
  
  const [flowerFormOpen, setFlowerFormOpen] = useState(false);
  const [editFlower, setEditFlower] = useState<Flower | null>(null);
  
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [recordType, setRecordType] = useState<RecordType>('补货');
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);

  const totalStock = flowers.reduce((sum, f) => sum + f.currentStock, 0);
  const lowStockCount = flowers.filter(f => f.status === '偏低' || f.status === '缺货').length;
  const totalReplenish = records.filter(r => r.type === '补货').reduce((sum, r) => sum + r.quantity, 0);
  const totalWaste = records.filter(r => r.type === '损耗').reduce((sum, r) => sum + r.quantity, 0);

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
            <div className="flex items-center gap-3">
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
              <Button onClick={handleAddFlower}>
                <Plus className="h-4 w-4 mr-1" />
                新增鲜花
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="库存总量"
            value={`${totalStock} 枝`}
            icon={<Package className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="库存预警"
            value={`${lowStockCount} 种`}
            icon={<AlertTriangle className="h-5 w-5" />}
            color={lowStockCount > 0 ? 'yellow' : 'green'}
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
        />
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
    </div>
  );
}
