
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface PersonalInfoProps {
  profileData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
  };
  isEditing: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
}

export const PersonalInfoTab: React.FC<PersonalInfoProps> = ({
  profileData,
  isEditing,
  handleInputChange,
  handleSave,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <Input 
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input 
              id="email"
              name="email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
            <Input 
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="address" className="text-sm font-medium">Address</label>
            <Input 
              id="address"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</label>
            <Input 
              id="emergencyContact"
              name="emergencyContact"
              value={profileData.emergencyContact}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          
          <div className="flex justify-end mt-4">
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
  );
};
