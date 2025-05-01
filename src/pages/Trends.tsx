
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Activity, Bed, Footprints } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HealthChart from '@/components/dashboard/HealthChart';
import { healthTrends } from '@/lib/mockData';

const Trends = () => {
  const [timeRange, setTimeRange] = React.useState('14');

  // Create sleep quality score for each day based on sleep hours
  const sleepScores = healthTrends.map(day => {
    const hours = day.sleepHours;
    let score;
    if (hours >= 7 && hours <= 9) score = 80 + Math.random() * 20;  // Optimal: 80-100
    else if (hours >= 6 && hours < 7) score = 60 + Math.random() * 20;  // Suboptimal: 60-80
    else if (hours > 9 && hours <= 10) score = 60 + Math.random() * 20;  // Too much: 60-80
    else score = 40 + Math.random() * 20;  // Poor: 40-60
    
    return {
      ...day,
      sleepScore: Math.round(score)
    };
  });

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Health Trends</h1>
            <p className="text-muted-foreground">Track your health metrics over time</p>
          </div>
          <div className="w-full md:w-48">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Combined Health Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <HealthChart
                title=""
                data={healthTrends}
                dataKeys={[
                  { key: 'heartRate', color: '#EF4444', name: 'Heart Rate (bpm)' },
                  { key: 'bloodOxygen', color: '#0EA5E9', name: 'Blood Oxygen (%)' },
                  { key: 'sleepHours', color: '#8B5CF6', name: 'Sleep (hrs)' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="heart">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="heart">
              <Heart className="mr-2 h-4 w-4" />
              Heart
            </TabsTrigger>
            <TabsTrigger value="oxygen">
              <Activity className="mr-2 h-4 w-4" />
              Oxygen
            </TabsTrigger>
            <TabsTrigger value="sleep">
              <Bed className="mr-2 h-4 w-4" />
              Sleep
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Footprints className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heart">
            <Card>
              <CardHeader>
                <CardTitle>Heart Rate Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <HealthChart
                    title=""
                    data={healthTrends}
                    dataKeys={[{ key: 'heartRate', color: '#EF4444', name: 'Heart Rate (bpm)' }]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Average</p>
                      <p className="text-2xl font-bold">{Math.round(healthTrends.reduce((acc, day) => acc + day.heartRate, 0) / healthTrends.length)} bpm</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Min</p>
                      <p className="text-2xl font-bold">{Math.min(...healthTrends.map(day => day.heartRate))} bpm</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Max</p>
                      <p className="text-2xl font-bold">{Math.max(...healthTrends.map(day => day.heartRate))} bpm</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <p className="text-2xl font-bold text-health-green">Stable</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="oxygen">
            <Card>
              <CardHeader>
                <CardTitle>Blood Oxygen Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <HealthChart
                    title=""
                    data={healthTrends}
                    dataKeys={[{ key: 'bloodOxygen', color: '#0EA5E9', name: 'Blood Oxygen (%)' }]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Average</p>
                      <p className="text-2xl font-bold">{(healthTrends.reduce((acc, day) => acc + day.bloodOxygen, 0) / healthTrends.length).toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Min</p>
                      <p className="text-2xl font-bold">{Math.min(...healthTrends.map(day => day.bloodOxygen))}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Max</p>
                      <p className="text-2xl font-bold">{Math.max(...healthTrends.map(day => day.bloodOxygen))}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <p className="text-2xl font-bold text-health-green">Improving</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sleep">
            <Card>
              <CardHeader>
                <CardTitle>Sleep Quality Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <HealthChart
                    title=""
                    data={sleepScores}
                    dataKeys={[
                      { key: 'sleepHours', color: '#8B5CF6', name: 'Sleep Duration (hrs)' },
                      { key: 'sleepScore', color: '#10B981', name: 'Sleep Quality Score' }
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Avg Duration</p>
                      <p className="text-2xl font-bold">{(healthTrends.reduce((acc, day) => acc + day.sleepHours, 0) / healthTrends.length).toFixed(1)} hrs</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Avg Quality</p>
                      <p className="text-2xl font-bold">{Math.round(sleepScores.reduce((acc, day) => acc + day.sleepScore, 0) / sleepScores.length)}/100</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Consistency</p>
                      <p className="text-2xl font-bold text-health-orange">Moderate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <p className="text-2xl font-bold text-health-red">Declining</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Physical Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <HealthChart
                    title=""
                    data={healthTrends}
                    dataKeys={[{ key: 'steps', color: '#10B981', name: 'Daily Steps' }]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Average Steps</p>
                      <p className="text-2xl font-bold">{Math.round(healthTrends.reduce((acc, day) => acc + day.steps, 0) / healthTrends.length)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Total Distance</p>
                      <p className="text-2xl font-bold">{(healthTrends.reduce((acc, day) => acc + day.steps, 0) * 0.0008).toFixed(1)} km</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Active Days</p>
                      <p className="text-2xl font-bold">{healthTrends.filter(day => day.steps > 7500).length}/{healthTrends.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <p className="text-2xl font-bold text-health-green">Improving</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Trends;
