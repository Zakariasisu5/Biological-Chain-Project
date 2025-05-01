
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { HealthData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface HealthMetricCardProps {
  data: HealthData;
  className?: string;
}

const HealthMetricCard = ({ data, className }: HealthMetricCardProps) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Current Health Status</CardTitle>
        <Activity className="h-5 w-5 text-health-blue" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center gap-3 bg-health-blue/10 p-3 rounded-lg">
            <div className="bg-white p-2 rounded-full">
              <Heart className="h-6 w-6 text-health-red" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heart Rate</p>
              <p className="text-2xl font-bold">{data.heartRate} <span className="text-sm font-normal">bpm</span></p>
            </div>
          </div>
          
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground">Blood Pressure</p>
            <p className="text-xl font-semibold mt-1">
              {data.bloodPressure.systolic}/{data.bloodPressure.diastolic}
            </p>
            <p className="text-xs text-muted-foreground mt-1">mmHg</p>
          </div>
          
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground">Blood Oxygen</p>
            <p className="text-xl font-semibold mt-1">{data.bloodOxygen}%</p>
            <p className="text-xs text-muted-foreground mt-1">SpO<sub>2</sub></p>
          </div>
          
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="text-xl font-semibold mt-1">{data.temperature.toFixed(1)}°C</p>
            <p className="text-xs text-muted-foreground mt-1">Body Temp</p>
          </div>
          
          <div className="border rounded-md p-3">
            <p className="text-xs text-muted-foreground">Sleep</p>
            <p className="text-xl font-semibold mt-1">{data.sleepHours.toFixed(1)} hrs</p>
            <p className="text-xs text-muted-foreground mt-1">Last Night</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Updated: {new Date(data.timestamp).toLocaleTimeString()}</p>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium">Live Data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetricCard;
