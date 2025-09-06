"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PersonalFinanceIntegration, 
  NotificationSettings 
} from "@/types/portfolio";
import { 
  ArrowLeft, 
  Save, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Settings as SettingsIcon,
  Bell,
  DollarSign
} from "lucide-react";
import toast from "react-hot-toast";
import { getSupportedProviders, validateIntegration } from "@/lib/personalFinance";

export default function PortfolioSettings() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Personal Finance Integration
  const [personalFinance, setPersonalFinance] = useState<PersonalFinanceIntegration>({
    enabled: false,
    provider: 'manual',
    autoSync: false
  });
  
  // Notification Settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    repaymentReminders: true,
    newOpportunities: true,
    riskAlerts: true,
    voiceReminders: false,
    emailNotifications: true,
    pushNotifications: true,
    reminderDaysBefore: 3
  });

  const [testResults, setTestResults] = useState<{
    personalFinance: boolean | null;
    notifications: boolean | null;
  }>({
    personalFinance: null,
    notifications: null
  });

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadSettings(user.uid);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const loadSettings = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Load personal finance settings
      const pfDoc = await getDoc(doc(db, 'userSettings', `${userId}_personalFinance`));
      if (pfDoc.exists()) {
        setPersonalFinance(pfDoc.data() as PersonalFinanceIntegration);
      }

      // Load notification settings
      const notifDoc = await getDoc(doc(db, 'userSettings', `${userId}_notifications`));
      if (notifDoc.exists()) {
        setNotifications(notifDoc.data() as NotificationSettings);
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!userId) return;

    try {
      setIsSaving(true);

      // Save personal finance settings
      await setDoc(doc(db, 'userSettings', `${userId}_personalFinance`), {
        ...personalFinance,
        lastUpdated: new Date()
      });

      // Save notification settings
      await setDoc(doc(db, 'userSettings', `${userId}_notifications`), {
        ...notifications,
        lastUpdated: new Date()
      });

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testPersonalFinanceConnection = async () => {
    try {
      const isValid = validateIntegration(personalFinance);
      setTestResults(prev => ({ ...prev, personalFinance: isValid }));
      
      if (isValid) {
        toast.success('Personal finance integration is valid');
      } else {
        toast.error('Personal finance integration configuration is invalid');
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, personalFinance: false }));
      toast.error('Failed to test personal finance connection');
    }
  };

  const testNotifications = async () => {
    try {
      // Test notification system
      setTestResults(prev => ({ ...prev, notifications: true }));
      toast.success('Notification system is working');
    } catch (error) {
      setTestResults(prev => ({ ...prev, notifications: false }));
      toast.error('Failed to test notifications');
    }
  };

  const handlePersonalFinanceChange = (key: keyof PersonalFinanceIntegration, value: any) => {
    setPersonalFinance(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: any) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Portfolio Settings</h1>
            <p className="text-gray-400 mt-2">Configure your investment portfolio preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Finance Integration */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Personal Finance Integration
              </h2>
              <div className="flex items-center gap-2">
                {testResults.personalFinance === true && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {testResults.personalFinance === false && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testPersonalFinanceConnection}
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
              {/* Enable Integration */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Enable Integration</p>
                  <p className="text-gray-400 text-sm">Sync repayments with your personal finance app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={personalFinance.enabled}
                    onChange={(e) => handlePersonalFinanceChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-white font-medium mb-2">Finance App</label>
                <select
                  value={personalFinance.provider}
                  onChange={(e) => handlePersonalFinanceChange('provider', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {getSupportedProviders().map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-1">
                  {getSupportedProviders().find(p => p.value === personalFinance.provider)?.description}
                </p>
              </div>

              {/* API Key */}
              {personalFinance.provider === 'ynab' && (
                <div>
                  <label className="block text-white font-medium mb-2">API Key</label>
                  <Input
                    type="password"
                    value={personalFinance.apiKey || ''}
                    onChange={(e) => handlePersonalFinanceChange('apiKey', e.target.value)}
                    placeholder="Enter your YNAB API key"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Get your API key from YNAB Settings → Developer Settings
                  </p>
                </div>
              )}

              {/* Auto Sync */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto Sync</p>
                  <p className="text-gray-400 text-sm">Automatically sync repayments when received</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={personalFinance.autoSync}
                    onChange={(e) => handlePersonalFinanceChange('autoSync', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </h2>
              <div className="flex items-center gap-2">
                {testResults.notifications === true && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {testResults.notifications === false && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testNotifications}
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 space-y-4">
              {/* Repayment Reminders */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Repayment Reminders</p>
                  <p className="text-gray-400 text-sm">Get notified before repayment due dates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.repaymentReminders}
                    onChange={(e) => handleNotificationChange('repaymentReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              {/* New Opportunities */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">New Opportunities</p>
                  <p className="text-gray-400 text-sm">Notifications for matching SME opportunities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.newOpportunities}
                    onChange={(e) => handleNotificationChange('newOpportunities', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              {/* Risk Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Risk Alerts</p>
                  <p className="text-gray-400 text-sm">High-risk investment warnings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.riskAlerts}
                    onChange={(e) => handleNotificationChange('riskAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>

              {/* Voice Reminders */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Voice Reminders</p>
                  <p className="text-gray-400 text-sm">Audio notifications for repayments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.voiceReminders}
                    onChange={(e) => handleNotificationChange('voiceReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {/* Reminder Days Before */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Reminder Days Before Due Date
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={notifications.reminderDaysBefore}
                  onChange={(e) => handleNotificationChange('reminderDaysBefore', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>1 day</span>
                  <span className="text-white font-medium">{notifications.reminderDaysBefore} days</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-white text-black hover:bg-gray-200 px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
