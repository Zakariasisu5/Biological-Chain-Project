
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertData } from '@/lib/types';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsCardProps {
  alerts: AlertData[];
  className?: string;
}

const AlertsCard = ({ alerts, className }: AlertsCardProps) => {
  const getAlertStyles = (type: AlertData['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-health-red/10 border-l-4 border-health-red text-health-red';
      case 'warning':
        return 'bg-health-orange/10 border-l-4 border-health-orange text-health-orange';
      case 'info':
        return 'bg-health-blue/10 border-l-4 border-health-blue text-health-blue';
      default:
        return 'bg-muted border-l-4 border-muted-foreground';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Alerts</CardTitle>
        <Bell className="h-5 w-5 text-health-orange" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn("p-3 rounded-md relative", getAlertStyles(alert.type))}
            >
              <p className="text-sm font-medium">{alert.message}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs opacity-80">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
                {alert.resolved ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    Resolved
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsCard;
