
import React from 'react';
import Layout from '@/components/layout/Layout';
import HealthChart from '@/components/dashboard/HealthChart';
import HealthMetricCard from '@/components/dashboard/HealthMetricCard';
import StatCard from '@/components/dashboard/StatCard';
import { Heart, Activity, Bed, Footprints } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { currentHealthData, healthTrends } from '@/lib/mockData';

const HealthMetrics = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Health Metrics</h1>
          <p className="text-muted-foreground">Detailed view of your health metrics and data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Heart Rate" 
            value={`${currentHealthData.heartRate} bpm`}
            icon={<Heart className="h-5 w-5 text-health-red" />}
            trend={{ direction: 'neutral', value: 'Normal' }}
          />
          <StatCard 
            title="Blood Oxygen" 
            value={`${currentHealthData.bloodOxygen}%`}
            icon={<Activity className="h-5 w-5 text-health-blue" />}
            trend={{ direction: 'up', value: '+2% this week' }}
          />
          <StatCard 
            title="Sleep Quality" 
            value={`${currentHealthData.sleepHours.toFixed(1)} hrs`}
            icon={<Bed className="h-5 w-5 text-health-purple" />}
            trend={{ direction: 'down', value: '-1.2 hrs this week' }}
          />
          <StatCard 
            title="Daily Steps" 
            value="8,436"
            icon={<Footprints className="h-5 w-5 text-health-green" />}
            trend={{ direction: 'up', value: '+12% this week' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-3 md:col-span-1">
            <CardHeader>
              <CardTitle>Health Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Health Score</span>
                  <span className="text-lg font-bold text-health-green">86/100</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Heart Health</span>
                    <span className="font-medium">92/100</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-health-red h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Respiratory Health</span>
                    <span className="font-medium">88/100</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-health-blue h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sleep Quality</span>
                    <span className="font-medium">76/100</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-health-purple h-full rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Physical Activity</span>
                    <span className="font-medium">83/100</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="bg-health-green h-full rounded-full" style={{ width: '83%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <HealthMetricCard data={currentHealthData} className="md:col-span-2" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <HealthChart 
            title="Weekly Health Metrics Trends" 
            data={healthTrends} 
            dataKeys={[
              { key: 'heartRate', color: '#EF4444', name: 'Heart Rate' },
              { key: 'bloodOxygen', color: '#0EA5E9', name: 'Blood Oxygen' },
              { key: 'sleepHours', color: '#8B5CF6', name: 'Sleep Hours' }
            ]}
          />
        </div>
      </div>
    </Layout>
  );
};

export default HealthMetrics;
