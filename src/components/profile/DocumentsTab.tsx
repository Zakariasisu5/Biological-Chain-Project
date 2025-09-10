import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from '@/components/profile/FileUploader';
import { FileImage, FileVideo, File, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileObject as SupabaseFileObject } from '@supabase/storage-js';

interface FileObject extends SupabaseFileObject {
}

export const DocumentsTab: React.FC = () => {
  const [recentUploads, setRecentUploads] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentUploads();
  }, [currentUser]);

  const fetchRecentUploads = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .list(currentUser.id, {
          sortBy: { column: 'created_at', order: 'desc' },
          limit: 10
        });

      if (error) {
        console.error('Error fetching files:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching files',
          description: error.message,
        });
        return;
      }

      setRecentUploads(data as unknown as FileObject[]);
    } catch (err) {
      console.error('Error in fetchRecentUploads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (filePath: string) => {
    if (!currentUser?.id) return;
    
    try {
      const { error } = await supabase.storage
        .from('user-files')
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting file:', error);
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description: 'There was a problem deleting your file.',
        });
        return;
      }
      
      fetchRecentUploads();
      
      toast({
        title: 'File deleted',
        description: 'Your file has been successfully deleted.',
      });
    } catch (err) {
      console.error('Error in handleFileDelete:', err);
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype?.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (mimetype?.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />;
    return <File className="h-5 w-5 text-amber-500" />;
  };

  const handleUploadComplete = () => {
    fetchRecentUploads();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents & Media</CardTitle>
        <CardDescription>Upload and manage your health-related documents and media</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Upload Files</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileImage className="h-4 w-4 mr-1" />
                  Images
                </h4>
                <FileUploader 
                  type="image" 
                  maxSizeMB={10}
                  onUploadComplete={handleUploadComplete} 
                />
              </div>
              <div>
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <FileVideo className="h-4 w-4 mr-1" />
                  Videos
                </h4>
                <FileUploader 
                  type="video" 
                  maxSizeMB={100}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <File className="h-4 w-4 mr-1" />
                  Documents
                </h4>
                <FileUploader 
                  type="any" 
                  maxSizeMB={20}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Recent Uploads</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchRecentUploads}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {loading ? (
              <div className="border rounded-md p-4 text-center text-muted-foreground text-sm">
                Loading recent uploads...
              </div>
            ) : recentUploads.length > 0 ? (
              <div className="border rounded-md">
                <div className="divide-y">
                  {recentUploads.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 hover:bg-muted/30">
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.metadata?.mimetype || '')}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(file.created_at).toLocaleDateString()} • {Math.round((file.metadata?.size || 0) / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = supabase.storage
                              .from('user-files')
                              .getPublicUrl(`${currentUser?.id}/${file.name}`).data.publicUrl;
                            window.open(url, '_blank');
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleFileDelete(`${currentUser?.id}/${file.name}`)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-4 text-center text-muted-foreground text-sm">
                No recent uploads. Upload files to see them here.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
