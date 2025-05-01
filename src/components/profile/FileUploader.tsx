
import React from 'react';
import { FileInputArea } from '@/components/profile/FileInputArea';
import { FileStatusIndicator } from '@/components/profile/FileStatusIndicator';
import { useFileUpload, FileType } from '@/hooks/useFileUpload';

interface FileUploaderProps {
  type?: FileType;
  maxSizeMB?: number;
  onUploadComplete?: (filePath: string) => void;
  className?: string;
}

export function FileUploader({
  type = 'any',
  maxSizeMB = 10,
  onUploadComplete,
  className
}: FileUploaderProps) {
  const {
    file,
    uploading,
    progress,
    error,
    bucketStatus,
    getAcceptedFileTypes,
    handleFileChange,
    uploadFile,
    resetFile,
    currentUser
  } = useFileUpload({
    type,
    maxSizeMB,
    onUploadComplete
  });

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-center w-full">
          <FileInputArea
            id={`file-upload-${type}`}
            type={type}
            maxSizeMB={maxSizeMB}
            error={error}
            bucketStatus={bucketStatus}
            disabled={uploading}
            onFileChange={handleFileChange}
            fileName={file?.name}
            currentUser={currentUser}
            acceptedFileTypes={getAcceptedFileTypes()}
          />
        </div>
        
        <FileStatusIndicator
          file={file}
          uploading={uploading}
          progress={progress}
          onUpload={uploadFile}
          onCancel={resetFile}
          disabled={!currentUser?.id || bucketStatus !== 'available'}
        />
      </div>
    </div>
  );
}
