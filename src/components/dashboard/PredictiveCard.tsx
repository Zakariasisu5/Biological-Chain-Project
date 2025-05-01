
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PredictionData } from '@/lib/types';
import { BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PredictiveCardProps {
  prediction: PredictionData;
  className?: string;
}

const PredictiveCard = ({ prediction, className }: PredictiveCardProps) => {
  const getRiskColor = (level: PredictionData['riskLevel']) => {
    switch (level) {
      case 'low':
        return 'text-health-green';
      case 'moderate':
        return 'text-health-orange';
      case 'high':
        return 'text-health-red';
      default:
        return '';
    }
  };

  const getRiskProgressColor = (level: PredictionData['riskLevel']) => {
    switch (level) {
      case 'low':
        return 'bg-health-green';
      case 'moderate':
        return 'bg-health-orange';
      case 'high':
        return 'bg-health-red';
      default:
        return '';
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Health Prediction</CardTitle>
        <BrainCircuit className="h-5 w-5 text-health-purple" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <h4 className="text-sm font-medium">Risk Level</h4>
            <span className={cn("text-sm font-bold capitalize", getRiskColor(prediction.riskLevel))}>
              {prediction.riskLevel}
            </span>
          </div>
          <Progress 
            value={prediction.riskScore} 
            max={100} 
            className={cn("h-2", getRiskProgressColor(prediction.riskLevel))} 
          />
          <p className="text-xs text-muted-foreground mt-1">Risk score: {prediction.riskScore}/100</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
          <ul className="space-y-1">
            {prediction.riskFactors.map((factor, index) => (
              <li key={index} className="text-sm flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-health-blue mr-2"></span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Recommendation</h4>
          <p className="text-sm">{prediction.recommendation}</p>
        </div>
        
        <p className="text-xs text-muted-foreground italic">
          Last updated: {new Date(prediction.timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default PredictiveCard;
