
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/utils/activityTracker';

export type FileType = 'image' | 'video' | 'document' | 'any';

interface UseFileUploadProps {
  type?: FileType;
  maxSizeMB?: number;
  onUploadComplete?: (filePath: string) => void;
}

export function useFileUpload({
  type = 'any',
  maxSizeMB = 10,
  onUploadComplete
}: UseFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { trackActivity } = useActivityTracker();

  // Check if the bucket exists and is accessible
  useEffect(() => {
    const checkBucket = async () => {
      try {
        if (!currentUser?.id) {
          console.log('No authenticated user, storage access will be limited');
          setBucketStatus('unavailable');
          return;
        }

        // Check if the bucket exists by trying to list objects
        const { data, error } = await supabase.storage.from('user-files').list();
        
        if (error) {
          console.error('Error checking user-files bucket:', error);
          setBucketStatus('unavailable');
        } else {
          console.log('user-files bucket found and accessible');
          setBucketStatus('available');
        }
      } catch (err) {
        console.error('Error checking bucket access:', err);
        setBucketStatus('unavailable');
      }
    };
    
    checkBucket();
  }, [currentUser?.id]);

  // Simulate progress during upload
  useEffect(() => {
    let interval: number | undefined;
    
    if (uploading) {
      interval = window.setInterval(() => {
        setProgress(prev => {
          // Start slow, accelerate in the middle, then decelerate near completion
          const increment = prev < 30 ? 2 : prev < 70 ? 5 : 1;
          const next = Math.min(prev + increment, 95); // Never reach 100 automatically
          return next;
        });
      }, 200);
    } else if (progress === 100) {
      // Reset progress after a delay when complete
      const timeout = window.setTimeout(() => {
        setProgress(0);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploading, progress]);

  // Determine accepted file types
  const getAcceptedFileTypes = () => {
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx';
      case 'any':
      default:
        return '*';
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const selectedFile = e.target.files[0];
    
    // Check file size
    const fileSizeInMB = selectedFile.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeMB) {
      setError(`File size exceeds the ${maxSizeMB}MB limit`);
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  // Upload file to Supabase storage
  const uploadFile = async () => {
    if (!file || !currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'You must be logged in to upload files.',
      });
      return;
    }
    
    if (bucketStatus !== 'available') {
      setError('Storage not available. Please try again later or contact support.');
      toast({
        variant: 'destructive',
        title: 'Storage Error',
        description: 'File storage is not available at this time.',
      });
      return;
    }
    
    setUploading(true);
    setProgress(5); // Start at 5%
    setError(null);
    
    try {
      // Create a unique file path for the user's uploaded file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;
      
      console.log('Uploading file to path:', filePath);
      
      // Upload to Supabase
      const { error: uploadError, data } = await supabase.storage
        .from('user-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful:', data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-files')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      console.log('Public URL:', publicUrl);
      
      // Track activity
      if (currentUser.id) {
        trackActivity('upload_file', '/profile', {
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size
        });
      }
      
      // Set progress to 100% to indicate completion
      setProgress(100);
      
      toast({
        title: 'File uploaded successfully',
        description: 'Your file has been uploaded and saved to your account.',
      });
      
      // Call the callback with the file path
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
      
      // Reset file state after a short delay
      setTimeout(() => {
        setFile(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(`Failed to upload file: ${error.message || 'Unknown error'}`);
      
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was a problem uploading your file.',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetFile = () => setFile(null);

  return {
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
  };
}
