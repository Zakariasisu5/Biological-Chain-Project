
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Save } from 'lucide-react';
import { FileUploader } from '@/components/profile/FileUploader';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileSidebarProps {
  profileData: {
    name: string;
    email: string;
  };
  profileImage: string | null;
  isEditing: boolean;
  currentUser: any;
  onProfileImageUpload: (filePath: string) => void;
  toggleEditing: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profileData,
  profileImage,
  isEditing,
  currentUser,
  onProfileImageUpload,
  toggleEditing,
}) => {
  return (
    <Card className="md:w-1/3">
      <CardContent className="pt-6 flex flex-col items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profileImage || ""} />
          <AvatarFallback className="text-2xl">{profileData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="mt-4 text-xl font-semibold">{profileData.name}</h2>
        <p className="text-sm text-muted-foreground">{profileData.email}</p>
        <Badge className="mt-2 bg-primary text-primary-foreground">
          {currentUser?.plan || 'Premium'} Plan
        </Badge>
        <div className="w-full mt-4">
          <FileUploader
            type="image" 
            maxSizeMB={5}
            onUploadComplete={onProfileImageUpload}
            className="mb-4"
          />
          <Button
            className="w-full"
            variant={isEditing ? "default" : "outline"}
            onClick={toggleEditing}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
