import { useState, useMemo } from 'preact/hooks';
import type { Flower, OperationRecord, OutboundRecord, PackageUsageRecord } from '@/types';
import { cn } from '@/utils/helpers';
import {
  buildStatusDistributionData,
  buildRecordTrendData,
  recordChartItems,
  buildOutboundTrendData,
  buildUsageDistributionData,
  buildPackageUsageTrendData,
  buildPackageTypeDistributionData,
} from '@/utils/chartData';

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  width?: number;
  height?: number;
}

function PieChart({ data, width = 280, height = 220 }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        暂无数据
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 40;
  const innerRadius = radius * 0.5;

  let currentAngle = -Math.PI / 2;
  const paths = data.map((d) => {
    const angle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    return {
      ...d,
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height}>
        {paths.map((d) => (
          <path
            key={d.label}
            d={d.path}
            fill={d.color}
            className="transition-opacity hover:opacity-80 cursor-pointer"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-gray-600">{d.label}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatusChartProps {
  flowers: Flower[];
  width?: number;
  height?: number;
}

export function StatusDistributionChart({ flowers, width = 280, height = 220 }: StatusChartProps) {
  const data = useMemo(() => buildStatusDistributionData(flowers), [flowers]);
  return <PieChart data={data} width={width} height={height} />;
}

interface RecordChartProps {
  records: OperationRecord[];
  width?: number;
  height?: number;
}

export function RecordTrendChart({ records, width = 580, height = 250 }: RecordChartProps) {
  const dailyData = useMemo(() => buildRecordTrendData(records), [records]);
  const CHART_ITEMS = recordChartItems;

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(
    ...dailyData.map(d => Math.max(d['补货'] as number, d['盘盈'] as number, d['损耗'] as number, d['盘亏'] as number)),
    1
  );

  const groupWidth = innerWidth / dailyData.length;
  const barGap = 2;
  const barWidth = (groupWidth - barGap * (CHART_ITEMS.length - 1)) / CHART_ITEMS.length;
  const xScale = (i: number) => margin.left + i * groupWidth;
  const yScale = (value: number) => margin.top + innerHeight - (value / maxValue) * innerHeight;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height}>
        <line
          x1={margin.left}
          y1={margin.top + innerHeight}
          x2={width - margin.right}
          y2={margin.top + innerHeight}
          stroke="#9ca3af"
          strokeWidth={1}
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + innerHeight}
          stroke="#9ca3af"
          strokeWidth={1}
        />

        {[0, 0.5, 1].map((ratio) => (
          <text
            key={ratio}
            x={margin.left - 8}
            y={margin.top + innerHeight - ratio * innerHeight + 4}
            fill="#6b7280"
            fontSize={11}
            textAnchor="end"
          >
            {Math.round(maxValue * ratio)}
          </text>
        ))}

        {dailyData.map((d, i) => {
          const groupX = xScale(i);

          return (
            <g key={d.label}>
              {CHART_ITEMS.map((item, idx) => {
                const value = d[item.key as keyof typeof d] as number;
                const barHeight = innerHeight - (yScale(value) - margin.top);
                return (
                  <rect
                    key={item.key}
                    x={groupX + idx * (barWidth + barGap)}
                    y={yScale(value)}
                    width={barWidth}
                    height={barHeight}
                    fill={item.color}
                    rx={2}
                  />
                );
              })}
              <text
                x={groupX + groupWidth / 2}
                y={height - 20}
                fill="#6b7280"
                fontSize={11}
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 mt-2 justify-center">
        {CHART_ITEMS.map(item => (
          <div key={item.key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600">{item.key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OutboundTrendChartProps {
  records: OutboundRecord[];
  width?: number;
  height?: number;
}

export function OutboundTrendChart({ records, width = 580, height = 260 }: OutboundTrendChartProps) {
  const [granularity, setGranularity] = useState<'day' | 'week'>('day');
  const chartData = useMemo(() => buildOutboundTrendData(records, granularity), [records, granularity]);

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const barWidth = Math.min(40, (innerWidth / chartData.length) * 0.6);
  const barGap = innerWidth / chartData.length;

  const xScale = (i: number) => margin.left + i * barGap + (barGap - barWidth) / 2;
  const yScale = (value: number) => margin.top + innerHeight - (value / maxValue) * innerHeight;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2 self-end">
        <button
          onClick={() => setGranularity('day')}
          className={cn(
            'px-3 py-1 text-xs rounded-md transition-colors',
            granularity === 'day'
              ? 'bg-violet-100 text-violet-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          按日
        </button>
        <button
          onClick={() => setGranularity('week')}
          className={cn(
            'px-3 py-1 text-xs rounded-md transition-colors',
            granularity === 'week'
              ? 'bg-violet-100 text-violet-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          按周
        </button>
      </div>
      <svg width={width} height={height}>
        <line
          x1={margin.left}
          y1={margin.top + innerHeight}
          x2={width - margin.right}
          y2={margin.top + innerHeight}
          stroke="#d1d5db"
          strokeWidth={1}
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + innerHeight}
          stroke="#d1d5db"
          strokeWidth={1}
        />

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={margin.left}
              y1={margin.top + innerHeight - ratio * innerHeight}
              x2={width - margin.right}
              y2={margin.top + innerHeight - ratio * innerHeight}
              stroke="#f3f4f6"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={margin.left - 8}
              y={margin.top + innerHeight - ratio * innerHeight + 4}
              fill="#9ca3af"
              fontSize={11}
              textAnchor="end"
            >
              {Math.round(maxValue * ratio)}
            </text>
          </g>
        ))}

        {chartData.map((d, i) => {
          const barHeight = innerHeight - (yScale(d.value) - margin.top);
          return (
            <g key={d.label}>
              <rect
                x={xScale(i)}
                y={yScale(d.value)}
                width={barWidth}
                height={barHeight}
                fill="#8b5cf6"
                rx={4}
                className="transition-opacity hover:opacity-80"
              />
              <text
                x={xScale(i) + barWidth / 2}
                y={yScale(d.value) - 6}
                fill="#6b7280"
                fontSize={11}
                textAnchor="middle"
                fontWeight="600"
              >
                {d.value > 0 ? d.value : ''}
              </text>
              <text
                x={xScale(i) + barWidth / 2}
                y={height - 16}
                fill="#6b7280"
                fontSize={11}
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-xs text-gray-400 mt-1">
        出库数量（枝）
      </p>
    </div>
  );
}

interface UsageDistributionChartProps {
  records: OutboundRecord[];
  width?: number;
  height?: number;
}

export function UsageDistributionChart({ records, width = 280, height = 260 }: UsageDistributionChartProps) {
  const data = useMemo(() => buildUsageDistributionData(records), [records]);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-gray-400">
        <p>暂无出库数据</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barMaxWidth = width - 120;
  const barHeight = 18;
  const barGap = 10;
  const topPadding = 20;

  return (
    <div className="flex flex-col">
      <div className="text-sm text-gray-500 mb-2 flex items-center justify-between">
        <span>热门用途排行</span>
        <span className="text-xs text-gray-400">共 {total} 枝</span>
      </div>
      <svg width={width} height={topPadding + data.length * (barHeight + barGap) + 10}>
        {data.map((d, i) => {
          const y = topPadding + i * (barHeight + barGap);
          const barWidth = (d.value / maxValue) * barMaxWidth;
          const percentage = ((d.value / total) * 100).toFixed(1);
          return (
            <g key={d.label}>
              <text
                x={0}
                y={y + barHeight / 2 + 4}
                fill="#374151"
                fontSize={12}
              >
                {d.label}
              </text>
              <rect
                x={75}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={d.color}
                rx={4}
                className="transition-opacity hover:opacity-80"
              />
              <text
                x={80 + barWidth}
                y={y + barHeight / 2 + 4}
                fill="#6b7280"
                fontSize={11}
              >
                {d.value} 枝 ({percentage}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface PopularPackageChartProps {
  popularPackages: { packageId: string; packageName: string; count: number; totalQuantity: number }[];
  width?: number;
  height?: number;
}

const PACKAGE_CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export function PopularPackageChart({ popularPackages, width = 280, height = 260 }: PopularPackageChartProps) {
  const data = popularPackages.slice(0, 5);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-gray-400">
        <p>暂无套餐使用数据</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count), 1);
  const barMaxWidth = width - 120;
  const barHeight = 22;
  const barGap = 12;
  const topPadding = 20;

  return (
    <div className="flex flex-col">
      <div className="text-sm text-gray-500 mb-2 flex items-center justify-between">
        <span>热门套餐排行</span>
        <span className="text-xs text-gray-400">共领用 {total} 次</span>
      </div>
      <svg width={width} height={topPadding + data.length * (barHeight + barGap) + 10}>
        {data.map((d, i) => {
          const y = topPadding + i * (barHeight + barGap);
          const barWidth = (d.count / maxValue) * barMaxWidth;
          const percentage = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0';
          const color = PACKAGE_CHART_COLORS[i % PACKAGE_CHART_COLORS.length];
          return (
            <g key={d.packageId}>
              <text
                x={0}
                y={y + barHeight / 2 + 4}
                fill="#374151"
                fontSize={12}
              >
                {d.packageName.length > 6 ? d.packageName.slice(0, 6) + '…' : d.packageName}
              </text>
              <rect
                x={75}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={4}
                className="transition-opacity hover:opacity-80"
              />
              <text
                x={80 + barWidth}
                y={y + barHeight / 2 + 4}
                fill="#6b7280"
                fontSize={11}
              >
                {d.count} 次 ({percentage}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface PackageUsageTrendChartProps {
  records: PackageUsageRecord[];
  width?: number;
  height?: number;
}

export function PackageUsageTrendChart({ records, width = 580, height = 260 }: PackageUsageTrendChartProps) {
  const [granularity, setGranularity] = useState<'day' | 'week'>('day');
  const chartData = useMemo(() => buildPackageUsageTrendData(records, granularity), [records, granularity]);

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...chartData.map(d => Math.max(d.count, d.quantity)), 1);
  const groupWidth = innerWidth / chartData.length;
  const barGap = 4;
  const barWidth = (groupWidth - barGap) / 2;
  const xScale = (i: number) => margin.left + i * groupWidth;
  const yScale = (value: number) => margin.top + innerHeight - (value / maxValue) * innerHeight;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2 self-end">
        <button
          onClick={() => setGranularity('day')}
          className={cn(
            'px-3 py-1 text-xs rounded-md transition-colors',
            granularity === 'day'
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          近7天
        </button>
        <button
          onClick={() => setGranularity('week')}
          className={cn(
            'px-3 py-1 text-xs rounded-md transition-colors',
            granularity === 'week'
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          近4周
        </button>
      </div>
      <svg width={width} height={height}>
        <line
          x1={margin.left}
          y1={margin.top + innerHeight}
          x2={width - margin.right}
          y2={margin.top + innerHeight}
          stroke="#d1d5db"
          strokeWidth={1}
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + innerHeight}
          stroke="#d1d5db"
          strokeWidth={1}
        />

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={margin.left}
              y1={margin.top + innerHeight - ratio * innerHeight}
              x2={width - margin.right}
              y2={margin.top + innerHeight - ratio * innerHeight}
              stroke="#f3f4f6"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text
              x={margin.left - 8}
              y={margin.top + innerHeight - ratio * innerHeight + 4}
              fill="#9ca3af"
              fontSize={11}
              textAnchor="end"
            >
              {Math.round(maxValue * ratio)}
            </text>
          </g>
        ))}

        {chartData.map((d, i) => {
          const groupX = xScale(i);
          const countHeight = innerHeight - (yScale(d.count) - margin.top);
          const qtyHeight = innerHeight - (yScale(d.quantity) - margin.top);
          return (
            <g key={d.label}>
              <rect
                x={groupX}
                y={yScale(d.count)}
                width={barWidth}
                height={countHeight}
                fill="#6366f1"
                rx={3}
                className="transition-opacity hover:opacity-80"
              />
              <rect
                x={groupX + barWidth + barGap}
                y={yScale(d.quantity)}
                width={barWidth}
                height={qtyHeight}
                fill="#a855f7"
                rx={3}
                className="transition-opacity hover:opacity-80"
              />
              <text
                x={groupX + barWidth / 2}
                y={yScale(d.count) - 4}
                fill="#6366f1"
                fontSize={10}
                textAnchor="middle"
                fontWeight="600"
              >
                {d.count > 0 ? d.count : ''}
              </text>
              <text
                x={groupX + barWidth + barGap + barWidth / 2}
                y={yScale(d.quantity) - 4}
                fill="#a855f7"
                fontSize={10}
                textAnchor="middle"
                fontWeight="600"
              >
                {d.quantity > 0 ? d.quantity : ''}
              </text>
              <text
                x={groupX + groupWidth / 2}
                y={height - 16}
                fill="#6b7280"
                fontSize={11}
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6366f1' }} />
          <span className="text-xs text-gray-600">领用次数</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#a855f7' }} />
          <span className="text-xs text-gray-600">鲜花数量(枝)</span>
        </div>
      </div>
    </div>
  );
}

interface PackageTypeDistributionChartProps {
  records: PackageUsageRecord[];
  width?: number;
  height?: number;
}

export function PackageTypeDistributionChart({ records, width = 280, height = 220 }: PackageTypeDistributionChartProps) {
  const data = useMemo(() => buildPackageTypeDistributionData(records), [records]);
  return <PieChart data={data} width={width} height={height} />;
}
