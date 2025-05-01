
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendationsCardProps {
  recommendations: string[];
  className?: string;
}

const RecommendationsCard = ({ recommendations, className }: RecommendationsCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Recommendations</CardTitle>
        <Lightbulb className="h-5 w-5 text-health-purple" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="bg-health-purple/20 text-health-purple rounded-full p-1 mt-0.5 flex-shrink-0">
                <Lightbulb className="h-4 w-4" />
              </div>
              <p className="text-sm">{recommendation}</p>
            </li>
          ))}
        </ul>
        <Button variant="outline" className="w-full mt-4">View All Recommendations</Button>
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
