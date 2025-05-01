
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Heart, Stethoscope } from 'lucide-react';
import { currentHealthData, mockHealthHistory } from '@/lib/mockData';
import HealthChart from '@/components/dashboard/HealthChart';

const Vitals = () => {
  // Generate hourly data for the past 24 hours for vitals charts
  const generateHourlyData = (baseValue: number, variance: number) => {
    const hourlyData = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(now.getHours() - i);
      
      hourlyData.push({
        date: date.toISOString(),
        value: baseValue + (Math.random() * variance * 2 - variance)
      });
    }
    
    return hourlyData;
  };

  const heartRateData = generateHourlyData(72, 15);
  const bloodOxygenData = generateHourlyData(98, 3);
  const bloodPressureData = generateHourlyData(120, 10).map((item, index) => ({
    ...item,
    systolic: item.value,
    diastolic: item.value - 40 + (Math.random() * 10 - 5)
  }));

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Vital Signs</h1>
          <p className="text-muted-foreground">Monitor your critical vital signs in real-time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-white to-red-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Heart Rate</CardTitle>
              <Heart className="h-5 w-5 text-health-red" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center my-4">{currentHealthData.heartRate} <span className="text-base font-normal">BPM</span></div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Normal range:</span>
                <span>60-100 BPM</span>
              </div>
              <div className="flex items-center justify-center mt-4">
                <div className="h-24 w-24 rounded-full border-4 border-health-red flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-health-red animate-pulse"></div>
                  <Heart className="h-10 w-10 text-health-red animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Blood Oxygen</CardTitle>
              <Activity className="h-5 w-5 text-health-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center my-4">{currentHealthData.bloodOxygen}<span className="text-base font-normal">%</span></div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Normal range:</span>
                <span>95-100%</span>
              </div>
              <div className="flex items-center justify-center mt-4">
                <div className="h-24 w-24 rounded-full border-4 border-health-blue flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-health-blue opacity-50"></div>
                  <Activity className="h-10 w-10 text-health-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Blood Pressure</CardTitle>
              <Stethoscope className="h-5 w-5 text-health-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center my-4">
                {currentHealthData.bloodPressure.systolic}/{currentHealthData.bloodPressure.diastolic} 
                <span className="text-base font-normal"> mmHg</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Normal range:</span>
                <span>&lt;120/80 mmHg</span>
              </div>
              <div className="flex items-center justify-center mt-4">
                <div className="h-24 w-24 rounded-full border-4 border-health-green flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-health-green opacity-50"></div>
                  <Stethoscope className="h-10 w-10 text-health-green" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="heart-rate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
            <TabsTrigger value="blood-oxygen">Blood Oxygen</TabsTrigger>
            <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="heart-rate">
            <Card>
              <CardHeader>
                <CardTitle>Heart Rate - Last 24 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <HealthChart 
                    title="" 
                    data={heartRateData}
                    dataKeys={[{ key: 'value', color: '#EF4444', name: 'Heart Rate (BPM)' }]}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{Math.round(heartRateData.reduce((sum, item) => sum + item.value, 0) / heartRateData.length)} BPM</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Minimum</p>
                    <p className="text-xl font-bold">{Math.round(Math.min(...heartRateData.map(item => item.value)))} BPM</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="text-xl font-bold">{Math.round(Math.max(...heartRateData.map(item => item.value)))} BPM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="blood-oxygen">
            <Card>
              <CardHeader>
                <CardTitle>Blood Oxygen - Last 24 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <HealthChart 
                    title="" 
                    data={bloodOxygenData}
                    dataKeys={[{ key: 'value', color: '#0EA5E9', name: 'SPO2 (%)' }]}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{bloodOxygenData.reduce((sum, item) => sum + item.value, 0) / bloodOxygenData.length}%</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Minimum</p>
                    <p className="text-xl font-bold">{Math.min(...bloodOxygenData.map(item => item.value))}%</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="text-xl font-bold">{Math.max(...bloodOxygenData.map(item => item.value))}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="blood-pressure">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure - Last 24 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <HealthChart 
                    title="" 
                    data={bloodPressureData}
                    dataKeys={[
                      { key: 'systolic', color: '#EF4444', name: 'Systolic (mmHg)' },
                      { key: 'diastolic', color: '#3B82F6', name: 'Diastolic (mmHg)' }
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Systolic</p>
                    <p className="text-xl font-bold">{Math.round(bloodPressureData.reduce((sum, item) => sum + item.systolic, 0) / bloodPressureData.length)} mmHg</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Diastolic</p>
                    <p className="text-xl font-bold">{Math.round(bloodPressureData.reduce((sum, item) => sum + item.diastolic, 0) / bloodPressureData.length)} mmHg</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Vitals;
