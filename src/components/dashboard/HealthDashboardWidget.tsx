import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HealthMetricGauge from '@/components/ui/health-metric-gauge';
import HealthAlert from '@/components/ui/health-alert';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  Heart, 
  Activity, 
  Brain, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Zap
} from 'lucide-react';

interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  stressLevel: number;
  sleepQuality: number;
  steps: number;
  calories: number;
  lastUpdated: Date;
}

interface HealthDashboardWidgetProps {
  className?: string;
  onRefresh?: () => void;
}

const HealthDashboardWidget: React.FC<HealthDashboardWidgetProps> = ({
  className,
  onRefresh
}) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Simulate fetching health data
  useEffect(() => {
    const fetchHealthData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHealthData({
        heartRate: 72,
        bloodOxygen: 98,
        stressLevel: 35,
        sleepQuality: 85,
        steps: 8436,
        calories: 2150,
        lastUpdated: new Date()
      });

      // Generate some sample alerts
      setAlerts([
        {
          id: 1,
          type: 'warning',
          title: 'Sleep Quality Alert',
          message: 'Your sleep quality has decreased by 10% this week'
        },
        {
          id: 2,
          type: 'info',
          title: 'Exercise Goal',
          message: 'You\'re 85% towards your daily step goal'
        }
      ]);

      setIsLoading(false);
    };

    fetchHealthData();
  }, []);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Default refresh behavior
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <LoadingSpinner size="lg" text="Loading health data..." />
        </CardContent>
      </Card>
    );
  }

  if (!healthData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Health Data</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load your health data. Please try again.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Health Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-4">
            Last updated: {healthData.lastUpdated.toLocaleTimeString()}
          </div>

          {/* Health Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <HealthMetricGauge
              value={healthData.heartRate}
              max={100}
              label="Heart Rate"
              unit="BPM"
              color="red"
              size="sm"
            />
            <HealthMetricGauge
              value={healthData.bloodOxygen}
              max={100}
              label="Blood Oxygen"
              unit="%"
              color="blue"
              size="sm"
            />
            <HealthMetricGauge
              value={healthData.stressLevel}
              max={100}
              label="Stress Level"
              unit="%"
              color="yellow"
              size="sm"
            />
            <HealthMetricGauge
              value={healthData.sleepQuality}
              max={100}
              label="Sleep Quality"
              unit="%"
              color="purple"
              size="sm"
            />
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">Steps Today</span>
              </div>
              <div className="text-2xl font-bold">{healthData.steps.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Goal: 10,000</div>
              <Progress 
                value={(healthData.steps / 10000) * 100} 
                className="mt-2 h-2"
              />
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium">Calories</span>
              </div>
              <div className="text-2xl font-bold">{healthData.calories}</div>
              <div className="text-xs text-muted-foreground">Burned today</div>
            </div>
          </div>

          {/* Health Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Health Alerts</h4>
              {alerts.map((alert) => (
                <HealthAlert
                  key={alert.id}
                  type={alert.type}
                  title={alert.title}
                  message={alert.message}
                  onDismiss={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboardWidget;
