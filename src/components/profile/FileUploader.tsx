import React from 'react';
import { ChangeEvent } from "react";
import { useLocalFileUpload, FileType } from '@/hooks/useLocalFileUpload';
import type { FileType as LegacyFileType } from '@/hooks/useFileUpload';
import { FileInputArea } from '@/components/profile/FileInputArea';
import { FileStatusIndicator } from '@/components/profile/FileStatusIndicator';
import  uploadFileToWeb3Storage  from '@/integrations/ipfs';

interface FileUploaderProps {
  type?: FileType;
  maxSizeMB?: number;
  onUploadComplete?: (cid: string, localId?: string) => void;
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
  } = useLocalFileUpload({
    type,
    maxSizeMB,
    onUploadComplete: undefined
  });

  // upload flow: persist locally, then upload to web3.storage and call onUploadComplete(cid, localId)
  const handleUpload = async () => {
    if (!file) return;
    // capture file reference before hook clears it
    const fileRef = file;
    // persist locally (this updates localStorage via hook)
    await uploadFile();

    try {
      const cid = await uploadFileToWeb3Storage(fileRef);
      // store mapping cid -> localId in localStorage for local rendering
      try {
        const raw = localStorage.getItem('bcp_cid_map') || '{}';
        const map = JSON.parse(raw);
        // find most recent local id for this filename (heuristic)
        const saved = JSON.parse(localStorage.getItem('bcp_uploads') || '[]') as any[];
        const maybeLocal = saved.find((s: any) => s.name === fileRef.name);
        const localId = maybeLocal?.id;
        map[cid] = localId || null;
        localStorage.setItem('bcp_cid_map', JSON.stringify(map));
      } catch (e) {
        console.warn('cid map write failed', e);
      }

      onUploadComplete?.(cid, undefined);
    } catch (err) {
      console.error('IPFS upload failed', err);
      // optionally surface error via hook or toast
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-center w-full">
          <FileInputArea
            id={`file-upload-${type}`}
            type={type as unknown as LegacyFileType}
            onChange={handleFileChange}
          />
          <FileStatusIndicator
            file={file}
            uploading={uploading}
            progress={progress}
            onUpload={handleUpload}
            onCancel={resetFile}
            disabled={!currentUser?.id || bucketStatus !== 'available'}
          />
        </div>
      </div>
    </div>
  );
}
