import { cn } from '@/utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: preact.ComponentChildren;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  className?: string;
}

const colorStyles: Record<string, string> = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ title, value, icon, trend, color = 'green', className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl p-5 shadow-sm border border-gray-100',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-2 flex items-center text-sm">
              <span className={cn(
                'font-medium',
                trend.value >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="ml-1 text-gray-500">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          colorStyles[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
