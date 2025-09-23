import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from '@/components/profile/FileUploader';
import { FileImage, FileVideo, File, Trash2, RefreshCw } from 'lucide-react';
import { getFirestoreClient, getStorageClient } from '@/integrations/firebase/client';
import { ref as sRef, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, query, where, orderBy, limit as limitFn, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addRecordOnChain, fetchRecords } from '@/integrations/medicalContract';
import OnChainRecords from '@/components/blockchain/OnChainRecords';

interface FileObject {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  public_url?: string;
  mime_type?: string;
  size?: number;
  created_at?: any;
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
      const db = getFirestoreClient();
      if (!db) throw new Error('Firestore not initialized');
      const { collection, query, where, orderBy, limit: limitFn, getDocs } = await import('firebase/firestore');

      const q = query(
        collection(db, 'user_files'),
        where('user_id', '==', currentUser.id),
        orderBy('created_at', 'desc'),
        limitFn(10)
      );

      const snap = await getDocs(q);
      const items: FileObject[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setRecentUploads(items);
    } catch (err) {
      console.error('Error in fetchRecentUploads:', err);
      toast({ variant: 'destructive', title: 'Error fetching files', description: (err as any)?.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (filePath: string) => {
    if (!currentUser?.id) return;
    try {
      // filePath expected to be the Firestore doc id for our migration
      const db = getFirestoreClient();
      const storage = getStorageClient();
      if (!db || !storage) throw new Error('Firestore or Storage not initialized');

      // Fetch the metadata doc
      const metaRef = doc(db, 'user_files', filePath);
      const metaSnap = await getDoc(metaRef);
      if (!metaSnap.exists()) {
        throw new Error('File metadata not found');
      }
      const meta = metaSnap.data() as any;

      // Delete storage object
      const storageReference = sRef(storage, meta.storage_path);
      await deleteObject(storageReference);

      // Delete Firestore metadata
      await deleteDoc(metaRef);

      fetchRecentUploads();

      toast({ title: 'File deleted', description: 'Your file has been successfully deleted.' });
    } catch (err) {
      console.error('Error in handleFileDelete:', err);
      toast({ variant: 'destructive', title: 'Delete failed', description: (err as any)?.message || String(err) });
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype?.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (mimetype?.startsWith('video/')) return <FileVideo className="h-5 w-5 text-purple-500" />;
    return <File className="h-5 w-5 text-amber-500" />;
  };

  // called with (cid, localId)
  const handleUploadComplete = async (cid?: string, localId?: string) => {
     try {
       // get the connected wallet address (patient)
       if (!(window as any).ethereum) {
         toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Please connect your wallet to record the upload on-chain.' });
         return;
       }
 
       // use ethers provider to get signer address
       const provider = new (await import('ethers')).BrowserProvider((window as any).ethereum);
       const signer = await provider.getSigner();
       const patientAddress = await signer.getAddress();
 
      if (!cid) {
        toast({ variant: 'destructive', title: 'Upload failed', description: 'No CID returned from IPFS upload.' });
        return;
      }
      // add IPFS CID on-chain (store pointer only)
      await addRecordOnChain(patientAddress, cid, "document", localId ? `local:${localId}` : "local-upload");
 
       toast({ title: 'Recorded on-chain', description: 'Upload reference saved to blockchain.' });
       fetchRecentUploads();
     } catch (err: any) {
       console.error('on-chain record failed', err);
       toast({ variant: 'destructive', title: 'On-chain record failed', description: err?.message || String(err) });
     }
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
                        {getFileIcon(file.mime_type || '')}
                        <div>
                          <p className="text-sm font-medium">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.created_at ? new Date(file.created_at.seconds ? file.created_at.seconds * 1000 : file.created_at).toLocaleDateString() : ''} • {Math.round((file.size || 0) / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const storage = getStorageClient();
                              if (!storage) throw new Error('Storage not initialized');
                              const storageModule = await import('firebase/storage');
                              const sRef = storageModule.ref;
                              const getDownloadURL = storageModule.getDownloadURL;
                              const ref = sRef(storage, file.storage_path);
                              const url = await getDownloadURL(ref);
                              window.open(url, '_blank');
                            } catch (e) {
                              console.error('Error opening file:', e);
                              toast({ variant: 'destructive', title: 'View failed', description: (e as any)?.message || String(e) });
                            }
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleFileDelete(file.id)}
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

          <div>
            <h3 className="text-lg font-medium mb-2">On-chain Records</h3>
            <OnChainRecords />
          </div>
         </div>
       </CardContent>
     </Card>
   );
 };