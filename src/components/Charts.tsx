import type { Flower, OperationRecord } from '@/types';

interface StatusChartProps {
  flowers: Flower[];
  width?: number;
  height?: number;
}

export function StatusDistributionChart({ flowers, width = 280, height = 220 }: StatusChartProps) {
  const statusCounts = flowers.reduce((acc, flower) => {
    acc[flower.status] = (acc[flower.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { label: '正常', value: statusCounts['正常'] || 0, color: '#10b981' },
    { label: '偏低', value: statusCounts['偏低'] || 0, color: '#f59e0b' },
    { label: '缺货', value: statusCounts['缺货'] || 0, color: '#ef4444' },
    { label: '停用', value: statusCounts['停用'] || 0, color: '#9ca3af' },
  ].filter(d => d.value > 0);

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

interface RecordChartProps {
  records: OperationRecord[];
  width?: number;
  height?: number;
}

const CHART_ITEMS = [
  { key: '补货', color: '#10b981' },
  { key: '盘盈', color: '#3b82f6' },
  { key: '损耗', color: '#ef4444' },
  { key: '盘亏', color: '#f97316' },
] as const;

export function RecordTrendChart({ records, width = 580, height = 250 }: RecordChartProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyData = last7Days.map(date => {
    const dayRecords = records.filter(r => r.date === date);
    return {
      date: date.slice(5),
      补货: dayRecords.filter(r => r.type === '补货').reduce((sum, r) => sum + r.quantity, 0),
      盘盈: dayRecords.filter(r => r.type === '盘盈').reduce((sum, r) => sum + r.quantity, 0),
      损耗: dayRecords.filter(r => r.type === '损耗').reduce((sum, r) => sum + r.quantity, 0),
      盘亏: dayRecords.filter(r => r.type === '盘亏').reduce((sum, r) => sum + r.quantity, 0),
    };
  });

  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(
    ...dailyData.map(d => Math.max(d.补货, d.盘盈, d.损耗, d.盘亏)),
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
            <g key={d.date}>
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
                {d.date}
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
