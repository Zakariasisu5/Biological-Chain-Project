
import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/utils/activityTracker';

export function ExportMedicalHistory() {
  const [isExporting, setIsExporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { trackActivity } = useActivityTracker();
  
  // This is a mock function that would be replaced with real data in a production environment
  const generateMedicalHistory = (): any => {
    // In a real application, this would retrieve data from your backend
    return {
      personalInfo: {
        name: currentUser?.name || 'John Doe',
        birthDate: '1985-05-15',
        bloodType: 'O Positive',
      },
      allergies: ['Penicillin'],
      medications: ['Lisinopril', 'Metformin'],
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      vitalHistory: [
        { date: '2023-01-15', heartRate: 72, bloodPressure: '120/80', weight: '175 lbs' },
        { date: '2023-03-20', heartRate: 75, bloodPressure: '124/82', weight: '172 lbs' },
        { date: '2023-06-10', heartRate: 70, bloodPressure: '118/78', weight: '170 lbs' },
      ],
      vaccinations: [
        { name: 'COVID-19', date: '2021-04-10' },
        { name: 'Influenza', date: '2022-11-15' },
      ],
      procedures: [
        { name: 'Appendectomy', date: '2015-08-22' },
      ]
    };
  };

  const safelyTrackActivity = (activityType: 'export_medical_history', format: string) => {
    if (currentUser?.id) {
      try {
        trackActivity(activityType, '/profile', { format });
      } catch (error) {
        console.error('Error tracking activity:', error);
      }
    }
  };

  const exportAsJson = () => {
    setIsExporting(true);
    
    try {
      // Get medical data
      const medicalData = generateMedicalHistory();
      
      // Convert to JSON string
      const jsonString = JSON.stringify(medicalData, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Setup download attributes
      link.href = url;
      link.download = `medical_history_${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Track this activity
      safelyTrackActivity('export_medical_history', 'json');
      
      // Show success message
      toast({
        title: 'Medical History Exported',
        description: 'Your medical history has been downloaded as a JSON file.',
      });
    } catch (error) {
      console.error('Error exporting medical history:', error);
      
      // Show error message
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'There was a problem exporting your medical history.',
      });
    } finally {
      setIsExporting(false);
      setShowDialog(false);
    }
  };

  const exportAsPdf = () => {
    setIsExporting(true);
    
    // This is a mock function - in a real app you would generate a PDF
    // using a library like jspdf or by calling a backend API
    setTimeout(() => {
      safelyTrackActivity('export_medical_history', 'pdf');
      
      toast({
        title: 'Medical History Exported',
        description: 'Your medical history has been downloaded as a PDF file.',
      });
      
      setIsExporting(false);
      setShowDialog(false);
    }, 1500);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="flex gap-1" 
        onClick={() => setShowDialog(true)}
      >
        <Download className="h-4 w-4" />
        Export Medical History
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Medical History</DialogTitle>
            <DialogDescription>
              Choose a format to export your medical history. This file will contain your personal health information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Your exported file will include personal information, allergies, medications, 
              vital history, and other medical records associated with your account.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={exportAsJson} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              JSON Format
            </Button>
            <Button onClick={exportAsPdf} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              PDF Format
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
