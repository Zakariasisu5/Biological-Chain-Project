import React from 'react';
import { cn } from '@/lib/utils';

interface HealthMetricGaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const HealthMetricGauge: React.FC<HealthMetricGaugeProps> = ({
  value,
  max,
  label,
  unit = '',
  color = 'blue',
  size = 'md',
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'text-green-500';
      case 'yellow':
        return 'text-yellow-500';
      case 'red':
        return 'text-red-500';
      case 'blue':
        return 'text-blue-500';
      case 'purple':
        return 'text-purple-500';
      default:
        return 'text-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-16 h-16 text-xs';
      case 'md':
        return 'w-24 h-24 text-sm';
      case 'lg':
        return 'w-32 h-32 text-base';
      default:
        return 'w-24 h-24 text-sm';
    }
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn('relative', getSizeClasses())}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <path
            className="text-gray-200"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Progress circle */}
          <path
            className={getColorClasses()}
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold">{value}</span>
          {unit && <span className="text-xs opacity-75">{unit}</span>}
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-2 text-center">{label}</span>
    </div>
  );
};

export default HealthMetricGauge;
