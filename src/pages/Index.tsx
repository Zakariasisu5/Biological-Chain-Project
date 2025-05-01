
import React from 'react';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import HealthChart from '@/components/dashboard/HealthChart';
import BlockchainCard from '@/components/dashboard/BlockchainCard';
import AlertsCard from '@/components/dashboard/AlertsCard';
import RecommendationsCard from '@/components/dashboard/RecommendationsCard';
import PredictiveCard from '@/components/dashboard/PredictiveCard';
import HealthMetricCard from '@/components/dashboard/HealthMetricCard';
import { Heart, Activity, Bed, Footprints } from 'lucide-react';

import { 
  currentHealthData,
  mockHealthHistory,
  mockPredictions,
  mockBlockchainData,
  mockAlerts,
  healthTrends,
  healthRecommendations
} from '@/lib/mockData';

const Index = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor your health metrics and predictive insights</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HealthMetricCard data={currentHealthData} className="lg:col-span-1" />
          <HealthChart 
            title="Health Trends" 
            data={healthTrends} 
            dataKeys={[
              { key: 'heartRate', color: '#EF4444', name: 'Heart Rate' },
              { key: 'bloodOxygen', color: '#0EA5E9', name: 'Blood Oxygen' }
            ]}
            className="lg:col-span-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PredictiveCard prediction={mockPredictions[0]} />
          <AlertsCard alerts={mockAlerts} />
          <BlockchainCard data={mockBlockchainData} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <RecommendationsCard recommendations={healthRecommendations} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
