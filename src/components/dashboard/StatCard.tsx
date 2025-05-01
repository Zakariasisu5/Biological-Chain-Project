
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center">
            <span className={cn(
              "inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5",
              trend.direction === 'up' 
                ? 'text-health-green bg-health-green/10' 
                : trend.direction === 'down' 
                ? 'text-health-red bg-health-red/10'
                : 'text-health-blue bg-health-blue/10'
            )}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
