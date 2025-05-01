
import React from 'react';
import { File, FileImage, FileVideo, Upload, AlertCircle, Check } from 'lucide-react';
import { FileType } from '@/hooks/useFileUpload';

interface FileInputAreaProps {
  id: string;
  type: FileType;
  maxSizeMB: number;
  error: string | null;
  bucketStatus: 'checking' | 'available' | 'unavailable';
  disabled: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
  currentUser: any;
  acceptedFileTypes: string;
}

export const FileInputArea: React.FC<FileInputAreaProps> = ({
  id,
  type,
  maxSizeMB,
  error,
  bucketStatus,
  disabled,
  onFileChange,
  fileName,
  currentUser,
  acceptedFileTypes
}) => {
  // Get icon based on file type
  const getFileIcon = () => {
    if (fileName) {
      if (type === 'image') return <FileImage className="h-8 w-8 text-blue-500" />;
      if (type === 'video') return <FileVideo className="h-8 w-8 text-purple-500" />;
      return <File className="h-8 w-8 text-amber-500" />;
    }
    return <Upload className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <>
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
          ${error ? 'border-destructive bg-destructive/10' : 'border-gray-300 hover:border-primary bg-gray-50 hover:bg-gray-100'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {getFileIcon()}
          <p className="mt-2 text-sm text-gray-500">
            {fileName ? fileName : `Click to upload ${type !== 'any' ? type : 'file'}`}
          </p>
          <p className="text-xs text-gray-500">Max size: {maxSizeMB}MB</p>
        </div>
        <input
          id={id}
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={onFileChange}
          disabled={disabled || !currentUser?.id || bucketStatus !== 'available'}
        />
      </label>
      
      {error && (
        <div className="flex items-center text-destructive text-sm gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {bucketStatus === 'checking' && (
        <div className="flex items-center text-muted-foreground text-sm gap-1">
          <Upload className="h-4 w-4 animate-pulse" />
          <span>Checking storage availability...</span>
        </div>
      )}
      
      {bucketStatus === 'unavailable' && !currentUser?.id && (
        <div className="flex items-center text-amber-500 text-sm gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>Please login to upload files</span>
        </div>
      )}
      
      {bucketStatus === 'unavailable' && currentUser?.id && (
        <div className="flex items-center text-amber-500 text-sm gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>Storage is currently unavailable</span>
        </div>
      )}

      {bucketStatus === 'available' && currentUser?.id && (
        <div className="flex items-center text-green-500 text-sm gap-1">
          <Check className="h-4 w-4" />
          <span>Storage is ready</span>
        </div>
      )}
    </>
  );
};
