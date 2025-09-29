import React from 'react';
import Layout from '@/components/layout/Layout';
import AdvancedHealthMonitor from '@/components/health/AdvancedHealthMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Activity, 
  Shield, 
  Target,
  Download,
  Share2,
  Settings
} from 'lucide-react';

const AdvancedHealth = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Hero / Banner */}
        <div className="rounded-lg overflow-hidden">
          <div className="bg-gradient-to-br from-white/60 to-primary/10 dark:from-gray-900 dark:to-primary/10 p-6 rounded-lg border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Advanced Health Monitoring</h1>
                <p className="text-muted-foreground mt-1 max-w-xl">
                  AI-driven health insights, predictive analytics, and secure, real-time monitoring of your vitals and medical records.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring">
            <AdvancedHealthMonitor />
          </TabsContent>

          <TabsContent value="insights">
            <div className="rounded-lg overflow-hidden">
              <div className="relative bg-gradient-to-br from-primary/6 via-white/50 to-primary/8 dark:from-gray-900 dark:via-gray-800 p-6 rounded-lg border">
                {/* decorative blur shapes */}
                <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-gradient-to-tr from-primary/40 to-transparent opacity-30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-gradient-to-bl from-emerald-300/30 to-transparent opacity-20 blur-3xl" />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <Brain className="h-8 w-8 text-primary" />
                      <h2 className="text-2xl md:text-3xl font-semibold">AI Health Insights</h2>
                    </div>
                    <p className="text-muted-foreground mt-3 leading-relaxed">
                      Private, actionable insights from your verified on‑chain records and live sensor streams. Our
                      privacy-preserving models surface trends, flag anomalies, and generate personalized recommendations
                      so you can act confidently on your health data.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-5">
                      <Button className="flex items-center gap-2" size="sm">Analyze Now</Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">Schedule Review</Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">Export Report</Button>
                    </div>
                  </div>

                  <div className="w-full md:w-96">
                    <div className="bg-card p-5 rounded-lg shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">Latest Insight</div>
                          <div className="font-medium">Improved sleep quality</div>
                        </div>
                        <div className="text-xs text-primary">88% confidence</div>
                      </div>

                      <div className="mt-3 text-sm text-muted-foreground">
                        Weekly sleep score improved by 12% vs. last month. Keep consistent bedtimes and reduce evening screen exposure to maintain progress.
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Verified on-chain</div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <Target className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Trend</div>
                        <div className="font-semibold">Heart rate variability ↑</div>
                      </div>
                      <div className="text-sm text-muted-foreground">+5% wk</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Alert</div>
                        <div className="font-semibold">Low hydration risk</div>
                      </div>
                      <div className="text-sm text-red-500">Action</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Recommendation</div>
                        <div className="font-semibold">Increase daily steps</div>
                      </div>
                      <div className="text-sm text-muted-foreground">+1500 goal</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle>Health Predictions & Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Predictive Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced risk assessment and health trend predictions
                  </p>
                  <Button>Run Risk Analysis</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Health Reports & Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Comprehensive Reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed health reports for healthcare providers and personal records.
                  </p>
                  <Button className="bg-primary text-primary-foreground">Generate Report</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdvancedHealth;
