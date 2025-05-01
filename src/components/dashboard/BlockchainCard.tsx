
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, Wallet } from 'lucide-react';
import { BlockchainData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BlockchainCardProps {
  data: BlockchainData[];
  className?: string;
}

const BlockchainCard = ({ data, className }: BlockchainCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Blockchain Health Records</CardTitle>
        <Shield className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 3).map((record) => (
            <div key={record.txHash} className="flex items-start justify-between border-b pb-2">
              <div>
                <p className="text-sm font-medium">Transaction</p>
                <p className="text-xs text-muted-foreground">{record.txHash.substring(0, 16)}...</p>
                <p className="text-xs mt-1">Block #{record.blockNumber}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  {record.verified && (
                    <span className="bg-green-100 p-1 rounded-full mr-1">
                      <Check className="h-3 w-3 text-health-green" />
                    </span>
                  )}
                  <span className="text-xs font-medium">
                    {record.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(record.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col items-center">
          <p className="text-sm text-center text-muted-foreground mb-2">
            Your health data is securely stored on blockchain
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => navigate('/blockchain')}
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainCard;
