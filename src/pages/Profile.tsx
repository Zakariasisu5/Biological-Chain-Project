
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { User, Shield, File, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracker } from '@/utils/activityTracker';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { PersonalInfoTab } from '@/components/profile/PersonalInfoTab';
import { MedicalInfoTab } from '@/components/profile/MedicalInfoTab';
import { DocumentsTab } from '@/components/profile/DocumentsTab';
import { SecurityTab } from '@/components/profile/SecurityTab';

const Profile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { trackActivity } = useActivityTracker();
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'John Doe',
    email: currentUser?.email || 'john@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Health St, Medical City, CA 90210',
    emergencyContact: 'Jane Doe (+1 555-987-6543)',
    primaryCare: 'Dr. Sarah Johnson',
    bloodType: 'O Positive',
    allergies: 'Penicillin',
    medications: 'Lisinopril, Metformin',
    height: '5\'10"',
    weight: '175 lbs',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    trackActivity('update_profile', '/profile', { fields: ['name', 'email', 'phone', 'address'] });
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleProfileImageUpload = (filePath: string) => {
    setProfileImage(filePath);
    toast({
      title: "Profile photo updated",
      description: "Your profile photo has been updated successfully.",
    });
  };

  const toggleEditing = () => setIsEditing(!isEditing);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">Manage your account and health information</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <ProfileSidebar 
            profileData={profileData}
            profileImage={profileImage}
            isEditing={isEditing}
            currentUser={currentUser}
            onProfileImageUpload={handleProfileImageUpload}
            toggleEditing={toggleEditing}
          />

          <div className="md:w-2/3">
            <Tabs defaultValue="personal">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="medical">
                  <Shield className="h-4 w-4 mr-2" />
                  Medical
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <File className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <PersonalInfoTab 
                  profileData={profileData}
                  isEditing={isEditing}
                  handleInputChange={handleInputChange}
                  handleSave={handleSave}
                />
              </TabsContent>

              <TabsContent value="medical" className="mt-6">
                <MedicalInfoTab 
                  profileData={profileData}
                  isEditing={isEditing}
                  handleInputChange={handleInputChange}
                  handleSave={handleSave}
                />
              </TabsContent>
              
              <TabsContent value="documents" className="mt-6">
                <DocumentsTab />
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <SecurityTab 
                  isEditing={isEditing} 
                  currentUser={currentUser} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;