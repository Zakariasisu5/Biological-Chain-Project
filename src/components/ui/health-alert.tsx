import React from 'react';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthAlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  className?: string;
  onDismiss?: () => void;
}

const HealthAlert: React.FC<HealthAlertProps> = ({
  type,
  title,
  message,
  className,
  onDismiss
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 border rounded-lg',
      getStyles(),
      className
    )}>
      {getIcon()}
      <div className="flex-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm mt-1 opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current opacity-50 hover:opacity-75 transition-opacity"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default HealthAlert;
