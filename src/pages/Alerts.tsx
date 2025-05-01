
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAlerts } from '@/lib/mockData';
import { AlertData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, AlertTriangle, Info, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Alerts = () => {
  const [alerts, setAlerts] = useState<AlertData[]>(mockAlerts);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    critical: true,
    warning: true,
    info: true
  });

  const handleResolveAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-health-red" />;
      case 'warning':
        return <Bell className="h-5 w-5 text-health-orange" />;
      case 'info':
        return <Info className="h-5 w-5 text-health-blue" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Health Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage critical health notifications</p>
        </div>

        <Tabs defaultValue="active">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="active">
                Active Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{activeAlerts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved
                {resolvedAlerts.length > 0 && (
                  <Badge variant="outline" className="ml-2">{resolvedAlerts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active">
            {activeAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No active alerts</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You don't have any active health alerts at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeAlerts.map((alert) => {
                  const alertColor = 
                    alert.type === 'critical' ? 'border-l-health-red bg-health-red/5' :
                    alert.type === 'warning' ? 'border-l-health-orange bg-health-orange/5' :
                    'border-l-health-blue bg-health-blue/5';
                  
                  return (
                    <div 
                      key={alert.id} 
                      className={`border-l-4 rounded-md shadow-sm p-4 ${alertColor}`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {alert.type === 'critical' ? 'Critical Alert' : 
                                 alert.type === 'warning' ? 'Warning' : 'Information'}
                              </h3>
                              <Badge 
                                variant={
                                  alert.type === 'critical' ? 'destructive' : 
                                  alert.type === 'warning' ? 'default' : 'secondary'
                                }
                              >
                                {alert.type}
                              </Badge>
                            </div>
                            <p className="mt-1">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-2"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {resolvedAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Check className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No resolved alerts</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You don't have any resolved health alerts in your history.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {resolvedAlerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-gray-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div className="flex items-start gap-3">
                          {getAlertIcon(alert.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-muted-foreground">
                                {alert.type === 'critical' ? 'Critical Alert' : 
                                 alert.type === 'warning' ? 'Warning' : 'Information'}
                              </h3>
                              <Badge variant="outline">{alert.type}</Badge>
                            </div>
                            <p className="mt-1 text-muted-foreground">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                Resolved
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDismissAlert(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Alert Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive alerts to your registered email</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.email}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, email: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.push}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, push: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive alerts via text message</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.sms}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, sms: checked})
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Alert Categories</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-health-red" />
                        <div>
                          <p className="font-medium">Critical Alerts</p>
                          <p className="text-sm text-muted-foreground">Urgent health issues that need immediate attention</p>
                        </div>
                      </div>
                      <Switch 
                        checked={notificationSettings.critical}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, critical: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-health-orange" />
                        <div>
                          <p className="font-medium">Warning Alerts</p>
                          <p className="text-sm text-muted-foreground">Important health notices that need attention</p>
                        </div>
                      </div>
                      <Switch 
                        checked={notificationSettings.warning}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, warning: checked})
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-health-blue" />
                        <div>
                          <p className="font-medium">Informational Alerts</p>
                          <p className="text-sm text-muted-foreground">General health updates and information</p>
                        </div>
                      </div>
                      <Switch 
                        checked={notificationSettings.info}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, info: checked})
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Alerts;
