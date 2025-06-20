
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExportMedicalHistory } from '@/components/profile/ExportMedicalHistory';
import { Save } from 'lucide-react';

interface MedicalInfoProps {
  profileData: {
    primaryCare: string;
    bloodType: string;
    allergies: string;
    medications: string;
    height: string;
    weight: string;
  };
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
}

export const MedicalInfoTab: React.FC<MedicalInfoProps> = ({
  profileData,
  isEditing,
  handleInputChange,
  handleSave,
}) => {
  return (<>
    <Card>
      <CardHeader>
        <CardTitle>Medical Information</CardTitle>
        <CardDescription>Update your medical profile and health information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="primaryCare" className="text-sm font-medium">Primary Care Physician</label>
            <Input 
              id="primaryCare"
              name="primaryCare"
              value={profileData.primaryCare}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="bloodType" className="text-sm font-medium">Blood Type</label>
              <Input 
                id="bloodType"
                name="bloodType"
                value={profileData.bloodType}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="allergies" className="text-sm font-medium">Allergies</label>
              <Input 
                id="allergies"
                name="allergies"
                value={profileData.allergies}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="medications" className="text-sm font-medium">Current Medications</label>
            <Input 
              id="medications"
              name="medications"
              value={profileData.medications}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="height" className="text-sm font-medium">Height</label>
              <Input 
                id="height"
                name="height"
                value={profileData.height}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="weight" className="text-sm font-medium">Weight</label>
              <Input 
                id="weight"
                name="weight"
                value={profileData.weight}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <ExportMedicalHistory />
            {isEditing && (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
