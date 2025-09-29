import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Activity, 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Shield,
  Clock,
  Target
} from 'lucide-react';

interface HealthInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  title: string;
  description: string;
  confidence: number;
  recommendation?: string;
  timestamp: Date;
}

interface PredictiveData {
  riskScore: number;
  predictions: {
    heartAttack: number;
    stroke: number;
    diabetes: number;
    hypertension: number;
  };
  trends: {
    improving: string[];
    declining: string[];
    stable: string[];
  };
}

const AdvancedHealthMonitor: React.FC = () => {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [predictiveData, setPredictiveData] = useState<PredictiveData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [realTimeData, setRealTimeData] = useState({
    heartRate: 72,
    bloodOxygen: 98,
    stressLevel: 35,
    sleepQuality: 85
  });

  // Generate AI-powered health insights
  const generateInsights = () => {
    const newInsights: HealthInsight[] = [
      {
        id: '1',
        type: 'info',
        title: 'Sleep Pattern Optimization',
        description: 'Your sleep quality has improved by 12% this week. Consider maintaining your current bedtime routine.',
        confidence: 87,
        recommendation: 'Continue your current sleep schedule for optimal health benefits.',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'warning',
        title: 'Heart Rate Variability',
        description: 'Your heart rate variability is slightly below optimal range. This may indicate increased stress levels.',
        confidence: 73,
        recommendation: 'Try incorporating 10 minutes of meditation or deep breathing exercises daily.',
        timestamp: new Date()
      },
      {
        id: '3',
        type: 'success',
        title: 'Exercise Consistency',
        description: 'Excellent! You\'ve maintained your exercise routine for 5 consecutive days.',
        confidence: 95,
        recommendation: 'Keep up the great work! Consider adding variety to prevent plateau.',
        timestamp: new Date()
      },
      {
        id: '4',
        type: 'critical',
        title: 'Blood Pressure Alert',
        description: 'Your blood pressure readings have been elevated for 3 consecutive days.',
        confidence: 91,
        recommendation: 'Consult with your healthcare provider and consider reducing sodium intake.',
        timestamp: new Date()
      }
    ];
    setInsights(newInsights);
  };

  // Generate predictive health data
  const generatePredictiveData = () => {
    const data: PredictiveData = {
      riskScore: 23, // Low risk
      predictions: {
        heartAttack: 2.3,
        stroke: 1.8,
        diabetes: 4.1,
        hypertension: 12.7
      },
      trends: {
        improving: ['Sleep Quality', 'Physical Activity', 'Stress Management'],
        declining: ['Blood Pressure', 'Heart Rate Variability'],
        stable: ['Blood Oxygen', 'Body Weight']
      }
    };
    setPredictiveData(data);
  };

  // Simulate real-time monitoring
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setRealTimeData(prev => ({
          heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
          bloodOxygen: Math.max(95, Math.min(100, prev.bloodOxygen + (Math.random() - 0.5) * 2)),
          stressLevel: Math.max(0, Math.min(100, prev.stressLevel + (Math.random() - 0.5) * 10)),
          sleepQuality: Math.max(0, Math.min(100, prev.sleepQuality + (Math.random() - 0.5) * 5))
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  useEffect(() => {
    generateInsights();
    generatePredictiveData();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Brain className="h-4 w-4 text-blue-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Real-time Health Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
              </span>
            </div>
            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "default"}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{Math.round(realTimeData.heartRate)}</p>
              <p className="text-sm text-muted-foreground">BPM</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{realTimeData.bloodOxygen}%</p>
              <p className="text-sm text-muted-foreground">SPO2</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{realTimeData.stressLevel}%</p>
              <p className="text-sm text-muted-foreground">Stress</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{realTimeData.sleepQuality}%</p>
              <p className="text-sm text-muted-foreground">Sleep</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <Alert key={insight.id} className={getInsightColor(insight.type)}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <AlertDescription className="mb-2">
                      {insight.description}
                    </AlertDescription>
                    {insight.recommendation && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                        <strong>Recommendation:</strong> {insight.recommendation}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {insight.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Health Analytics */}
      {predictiveData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Predictive Health Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Risk Score */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Overall Health Risk Score</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${predictiveData.riskScore}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">{predictiveData.riskScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Low Risk</p>
              </div>

              {/* Disease Risk Predictions */}
              <div>
                <h4 className="font-semibold mb-4">5-Year Disease Risk Predictions</h4>
                <div className="space-y-3">
                  {Object.entries(predictiveData.predictions).map(([disease, risk]) => (
                    <div key={disease} className="flex items-center justify-between">
                      <span className="capitalize">{disease.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-2 w-32">
                        <Progress value={risk} className="flex-1" />
                        <span className="text-sm font-medium w-8">{risk}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Trends */}
              <div>
                <h4 className="font-semibold mb-4">Health Trends</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Improving
                    </h5>
                    <ul className="space-y-1">
                      {predictiveData.trends.improving.map((trend, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {trend}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      Declining
                    </h5>
                    <ul className="space-y-1">
                      {predictiveData.trends.declining.map((trend, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {trend}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Stable
                    </h5>
                    <ul className="space-y-1">
                      {predictiveData.trends.stable.map((trend, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {trend}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedHealthMonitor;
