
export interface HealthData {
  id: string;
  timestamp: string;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  bloodOxygen: number;
  temperature: number;
  sleepHours: number;
}

export interface PredictionData {
  id: string;
  timestamp: string;
  riskLevel: 'low' | 'moderate' | 'high';
  riskScore: number;
  riskFactors: string[];
  recommendation: string;
}

export interface BlockchainData {
  txHash: string;
  timestamp: string;
  dataHash: string;
  blockNumber: number;
  verified: boolean;
}

export interface AlertData {
  id: string;
  timestamp: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  resolved: boolean;
}

export interface HealthTrend {
  date: string;
  heartRate: number;
  bloodOxygen: number;
  steps: number;
  sleepHours: number;
}
