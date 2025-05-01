
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload } from 'lucide-react';

interface FileStatusIndicatorProps {
  file: File | null;
  uploading: boolean;
  progress: number;
  onUpload: () => void;
  onCancel: () => void;
  disabled: boolean;
}

export const FileStatusIndicator: React.FC<FileStatusIndicatorProps> = ({
  file,
  uploading,
  progress,
  onUpload,
  onCancel,
  disabled
}) => {
  if (!file) return null;
  
  return (
    <div className="w-full space-y-2">
      {(uploading || progress > 0) && (
        <Progress value={progress} className="h-2 w-full" />
      )}
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={onUpload} 
          disabled={uploading || disabled}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onCancel}
          disabled={uploading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
