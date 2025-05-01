
import { HealthData, PredictionData, BlockchainData, AlertData, HealthTrend } from './types';

// Generate random date for a given range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Current health data (for real-time display)
export const currentHealthData: HealthData = {
  id: '1',
  timestamp: new Date().toISOString(),
  heartRate: 72,
  bloodPressure: {
    systolic: 120,
    diastolic: 80
  },
  bloodOxygen: 98,
  temperature: 37.0,
  sleepHours: 7.5
};

// Mock health data history (last 7 days)
export const mockHealthHistory: HealthData[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `history-${i}`,
  timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
  heartRate: 65 + Math.floor(Math.random() * 20),
  bloodPressure: {
    systolic: 115 + Math.floor(Math.random() * 15),
    diastolic: 75 + Math.floor(Math.random() * 15)
  },
  bloodOxygen: 95 + Math.floor(Math.random() * 5),
  temperature: 36.5 + (Math.random() * 1),
  sleepHours: 5 + (Math.random() * 4)
}));

// Mock prediction data
export const mockPredictions: PredictionData[] = [
  {
    id: 'pred-1',
    timestamp: new Date().toISOString(),
    riskLevel: 'low',
    riskScore: 15,
    riskFactors: ['Occasional elevated blood pressure'],
    recommendation: 'Maintain regular exercise and consider reducing sodium intake.'
  },
  {
    id: 'pred-2',
    timestamp: new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString(),
    riskLevel: 'moderate',
    riskScore: 45,
    riskFactors: ['Irregular sleep pattern', 'Elevated heart rate during rest'],
    recommendation: 'Improve sleep hygiene and consider stress reduction techniques.'
  },
  {
    id: 'pred-3',
    timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
    riskLevel: 'low',
    riskScore: 22,
    riskFactors: ['Reduced oxygen levels during sleep'],
    recommendation: 'Consider sleep position changes and consult with a specialist if issues persist.'
  }
];

// Mock blockchain data for health records
export const mockBlockchainData: BlockchainData[] = Array.from({ length: 5 }).map((_, i) => ({
  txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
  timestamp: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString(),
  dataHash: `0x${Math.random().toString(16).substring(2, 42)}`,
  blockNumber: 13000000 + i,
  verified: true
}));

// Mock alerts
export const mockAlerts: AlertData[] = [
  {
    id: 'alert-1',
    timestamp: new Date(Date.now() - (15 * 60 * 1000)).toISOString(),
    type: 'warning',
    message: 'Elevated heart rate detected during rest period.',
    resolved: false
  },
  {
    id: 'alert-2',
    timestamp: new Date(Date.now() - (120 * 60 * 1000)).toISOString(),
    type: 'info',
    message: 'Blood oxygen levels have normalized.',
    resolved: true
  },
  {
    id: 'alert-3',
    timestamp: new Date(Date.now() - (12 * 60 * 60 * 1000)).toISOString(),
    type: 'critical',
    message: 'Irregular heart rhythm detected. If symptoms persist, contact your doctor.',
    resolved: false
  }
];

// Health trends for charts (last 14 days)
export const healthTrends: HealthTrend[] = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toISOString().split('T')[0],
    heartRate: 65 + Math.floor(Math.random() * 20),
    bloodOxygen: 94 + Math.floor(Math.random() * 6),
    steps: 2000 + Math.floor(Math.random() * 8000),
    sleepHours: 5 + (Math.random() * 4)
  };
});

// Health recommendations
export const healthRecommendations = [
  "Increase daily water intake to improve hydration levels",
  "Consider 30 minutes of moderate exercise 3-4 times per week",
  "Your sleep pattern shows irregularity, try to establish a consistent bedtime",
  "Recent blood pressure readings suggest monitoring sodium intake",
  "Your heart rate variability indicates potential stress, consider mindfulness practices"
];
