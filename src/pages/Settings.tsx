
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings as SettingsIcon, Bell, Shield, Globe, Moon, SunMedium, 
  Smartphone, Languages, CloudOff, Download, Lock 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

const Settings = () => {
  const { toast } = useToast();
  const { 
    theme, 
    setTheme, 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast,
    reduceMotion,
    setReduceMotion 
  } = useTheme();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    inApp: true,
    healthAlerts: true,
    weeklyReport: true,
    newFeatures: false,
    healthTips: true
  });
  
  const [privacy, setPrivacy] = useState({
    shareHealthData: false,
    anonymousAnalytics: true,
    locationTracking: false,
    healthResearch: true
  });

  const [units, setUnits] = useState({
    temperature: 'celsius',
    weight: 'kg',
    height: 'cm',
    distance: 'km',
    bloodGlucose: 'mmol/L',
    dateFormat: 'DD/MM/YYYY'
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  const UnitSettingItem = ({ 
    label, 
    description, 
    value, 
    options, 
    onChange 
  }: { 
    label: string; 
    description?: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b">
      <div className="mb-2 sm:mb-0">
        <p className="font-medium">{label}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Select defaultValue={value} onValueChange={onChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const SwitchSettingItem = ({ 
    label, 
    description, 
    checked, 
    onChange,
    comingSoon
  }: { 
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    comingSoon?: boolean;
  }) => (
    <div className="flex flex-row items-center justify-between py-4 border-b">
      <div>
        <div className="flex items-center">
          <p className="font-medium">{label}</p>
          {comingSoon && (
            <Badge className="ml-2 text-xs" variant="outline">Coming Soon</Badge>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onChange}
        disabled={comingSoon}
      />
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your app preferences and account settings</p>
        </div>
        
        <Tabs defaultValue="notifications">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="inline sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <SunMedium className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appearance</span>
              <span className="inline sm:hidden">Display</span>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Privacy & Security</span>
              <span className="inline sm:hidden">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <SettingsIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Units & Preferences</span>
              <span className="inline sm:hidden">Units</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notification Channels</h3>
                    <div className="space-y-0">
                      <SwitchSettingItem 
                        label="Email Notifications" 
                        description="Receive notifications to your email address"
                        checked={notifications.email} 
                        onChange={(checked) => setNotifications({...notifications, email: checked})}
                      />
                      <SwitchSettingItem 
                        label="Push Notifications" 
                        description="Receive notifications on your device"
                        checked={notifications.push} 
                        onChange={(checked) => setNotifications({...notifications, push: checked})}
                      />
                      <SwitchSettingItem 
                        label="SMS Notifications" 
                        description="Receive notifications via text messages"
                        checked={notifications.sms} 
                        onChange={(checked) => setNotifications({...notifications, sms: checked})}
                      />
                      <SwitchSettingItem 
                        label="In-App Notifications" 
                        description="See notifications within the app"
                        checked={notifications.inApp} 
                        onChange={(checked) => setNotifications({...notifications, inApp: checked})}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Notification Types</h3>
                    <div className="space-y-0">
                      <SwitchSettingItem 
                        label="Health Alerts" 
                        description="Critical alerts about your health metrics"
                        checked={notifications.healthAlerts} 
                        onChange={(checked) => setNotifications({...notifications, healthAlerts: checked})}
                      />
                      <SwitchSettingItem 
                        label="Weekly Health Reports" 
                        description="Receive a summary of your weekly health data"
                        checked={notifications.weeklyReport} 
                        onChange={(checked) => setNotifications({...notifications, weeklyReport: checked})}
                      />
                      <SwitchSettingItem 
                        label="New Features and Updates" 
                        description="Be notified about new app features"
                        checked={notifications.newFeatures} 
                        onChange={(checked) => setNotifications({...notifications, newFeatures: checked})}
                      />
                      <SwitchSettingItem 
                        label="Health Tips & Recommendations" 
                        description="Personalized health advice and tips"
                        checked={notifications.healthTips} 
                        onChange={(checked) => setNotifications({...notifications, healthTips: checked})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Theme</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div 
                        className={`border rounded-md p-4 cursor-pointer flex flex-col items-center ${theme === 'light' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setTheme('light')}
                      >
                        <SunMedium className="h-8 w-8 mb-2" />
                        <span>Light</span>
                      </div>
                      <div 
                        className={`border rounded-md p-4 cursor-pointer flex flex-col items-center ${theme === 'dark' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setTheme('dark')}
                      >
                        <Moon className="h-8 w-8 mb-2" />
                        <span>Dark</span>
                      </div>
                      <div 
                        className={`border rounded-md p-4 cursor-pointer flex flex-col items-center ${theme === 'system' ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setTheme('system')}
                      >
                        <div className="flex h-8 mb-2">
                          <SunMedium className="h-8 w-8" />
                          <Moon className="h-8 w-8" />
                        </div>
                        <span>System</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Font Size</h3>
                    <Select 
                      value={fontSize}
                      onValueChange={setFontSize}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="x-large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Accessibility</h3>
                    <div className="space-y-0">
                      <SwitchSettingItem 
                        label="High Contrast Mode" 
                        description="Enhance visual distinction between elements"
                        checked={highContrast} 
                        onChange={setHighContrast}
                      />
                      <SwitchSettingItem 
                        label="Reduce Motion" 
                        description="Minimize animations throughout the app"
                        checked={reduceMotion} 
                        onChange={setReduceMotion}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your data privacy and security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
                    <div className="space-y-0">
                      <SwitchSettingItem 
                        label="Share Health Data with Healthcare Providers" 
                        description="Allow your primary care physician to access your health data"
                        checked={privacy.shareHealthData} 
                        onChange={(checked) => setPrivacy({...privacy, shareHealthData: checked})}
                      />
                      <SwitchSettingItem 
                        label="Anonymous Analytics" 
                        description="Help improve our service with anonymous usage data"
                        checked={privacy.anonymousAnalytics} 
                        onChange={(checked) => setPrivacy({...privacy, anonymousAnalytics: checked})}
                      />
                      <SwitchSettingItem 
                        label="Location Tracking" 
                        description="Allow the app to track your location for fitness tracking"
                        checked={privacy.locationTracking} 
                        onChange={(checked) => setPrivacy({...privacy, locationTracking: checked})}
                      />
                      <SwitchSettingItem 
                        label="Contribute to Health Research" 
                        description="Allow anonymized data to be used for medical research"
                        checked={privacy.healthResearch} 
                        onChange={(checked) => setPrivacy({...privacy, healthResearch: checked})}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Blockchain Security</h3>
                    <div className="space-y-4 border rounded-md p-4">
                      <p className="text-sm">Your health data is secured using blockchain technology. Below are controls to manage your secure data storage.</p>
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" className="justify-start">
                          <Lock className="h-4 w-4 mr-2" />
                          Manage Access Permissions
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Export Encrypted Backup
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          View Security Audit Log
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Data Management</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full sm:w-auto justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Download My Data
                      </Button>
                      <Button variant="destructive" className="w-full sm:w-auto justify-start">
                        Delete All My Data
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Units & Preferences</CardTitle>
                <CardDescription>Set your preferred measurement units and regional settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Measurement Units</h3>
                    <div className="space-y-0">
                      <UnitSettingItem 
                        label="Temperature" 
                        description="Unit for body temperature"
                        value={units.temperature} 
                        options={[
                          { value: 'celsius', label: '°C (Celsius)' },
                          { value: 'fahrenheit', label: '°F (Fahrenheit)' }
                        ]}
                        onChange={(value) => setUnits({...units, temperature: value})}
                      />
                      <UnitSettingItem 
                        label="Weight" 
                        value={units.weight} 
                        options={[
                          { value: 'kg', label: 'kg (Kilograms)' },
                          { value: 'lb', label: 'lb (Pounds)' }
                        ]}
                        onChange={(value) => setUnits({...units, weight: value})}
                      />
                      <UnitSettingItem 
                        label="Height" 
                        value={units.height} 
                        options={[
                          { value: 'cm', label: 'cm (Centimeters)' },
                          { value: 'ft', label: 'ft & in (Feet & Inches)' }
                        ]}
                        onChange={(value) => setUnits({...units, height: value})}
                      />
                      <UnitSettingItem 
                        label="Distance" 
                        description="For activity tracking"
                        value={units.distance} 
                        options={[
                          { value: 'km', label: 'km (Kilometers)' },
                          { value: 'mi', label: 'mi (Miles)' }
                        ]}
                        onChange={(value) => setUnits({...units, distance: value})}
                      />
                      <UnitSettingItem 
                        label="Blood Glucose" 
                        value={units.bloodGlucose} 
                        options={[
                          { value: 'mmol/L', label: 'mmol/L' },
                          { value: 'mg/dL', label: 'mg/dL' }
                        ]}
                        onChange={(value) => setUnits({...units, bloodGlucose: value})}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Regional Settings</h3>
                    <div className="space-y-0">
                      <UnitSettingItem 
                        label="Date Format" 
                        value={units.dateFormat} 
                        options={[
                          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                        ]}
                        onChange={(value) => setUnits({...units, dateFormat: value})}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b">
                        <div className="mb-2 sm:mb-0">
                          <p className="font-medium">Language</p>
                          <p className="text-sm text-muted-foreground">Change the app display language</p>
                        </div>
                        <Select defaultValue="en">
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Advanced Features</h3>
                    <div className="space-y-0">
                      <SwitchSettingItem 
                        label="Offline Mode" 
                        description="Access core features without internet connection"
                        checked={false} 
                        onChange={() => {}}
                        comingSoon
                      />
                      <SwitchSettingItem 
                        label="Smart Predictions" 
                        description="Use AI for advanced health predictions"
                        checked={true} 
                        onChange={() => {}}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
