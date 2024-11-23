// src/components/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import {
    Loader,
    Save,
    ChevronDown,
    ChevronRight,
    Moon,
    Bell,
    Shield,
    Ruler,
    AlertCircle,
    Settings as SettingsIcon,
    Clock  // Add this import
} from 'lucide-react';;


const defaultSettings = {
    notifications: {
        emailAlerts: false,
        lateNotifications: false,
        earlyDepartureAlerts: false,
        adminEmails: []
    },
    attendance: {
        requireLocation: true,
        maxDistanceMeters: 100,
        allowRemoteSignIn: false,
        enforceSchedule: true
    },
    departments: {
        Jnr: { startTime: '07:30', endTime: '14:30', lateAfter: '07:45' },
        Snr: { startTime: '07:30', endTime: '15:00', lateAfter: '07:45' },
        Admin: { startTime: '07:30', endTime: '16:00', lateAfter: '07:45' },
        Estate: { startTime: '07:00', endTime: '16:00', lateAfter: '07:15' }
    },
    security: {
        enforceDeviceRestrictions: false,
        allowedDevices: [],
        requirePhotoVerification: false
    },
    customization: {
        schoolLogo: '',
        primaryColor: '#1a73e8',
        secondaryColor: '#ea4335',
        schoolName: 'SJMC',
        timezone: 'Africa/Johannesburg'
    }
};


const Settings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const handleDarkModeChange = (checked) => {
        handleSettingChange('customization.darkMode', checked);
        if (checked) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState({
        departments: false,
        notifications: false,
        attendance: false,
        security: false,
        customization: false
    });
    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
    const [darkMode, setDarkMode] = useState(false);
    const handleSettingChange = (path, value) => {
        setSettings(prev => {
            const newSettings = { ...prev };
            const keys = path.split('.');
            let current = newSettings;

            // Navigate to the nested object
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }

            // Set the value
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };
    // Safe getter for nested values
    const getSetting = (path) => {
        try {
            return path.split('.').reduce((obj, key) =>
                (obj && obj[key] !== undefined) ? obj[key] : defaultSettings[path.split('.')[0]][path.split('.')[1]],
                settings
            );
        } catch (e) {
            console.error(`Error accessing setting: ${path}`, e);
            return null;
        }
    };
    // Notification settings handler
    const handleNotificationChange = (setting, value) => {
        handleSettingChange(`notifications.${setting}`, value);
        if (setting === 'emailAlerts' && value) {
            // Here you would typically set up email notifications
            // This is where you'd integrate with your email service
            console.log('Email alerts enabled');
        }
    }

    useEffect(() => {
        fetchSettings();
        const isDark = settings?.customization?.darkMode;
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings?.customization?.darkMode]);


    const fetchSettings = async () => {
        try {
            setLoading(true);
            const settingsRef = collection(db, 'settings');
            const snapshot = await getDocs(settingsRef);

            if (!snapshot.empty) {
                const settingsDoc = snapshot.docs[0];
                // Merge with defaultSettings to ensure all properties exist
                setSettings({
                    ...defaultSettings,
                    ...settingsDoc.data()
                });
            } else {
                // If no settings exist in Firebase, use defaultSettings
                setSettings(defaultSettings);
            }
        } catch (err) {
            setError('Failed to load settings: ' + err.message);
            // Still use defaultSettings on error
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };
    const handleTimeChange = (department, field, value) => {
        setSettings(prev => ({
            ...prev,
            departments: {
                ...prev.departments,
                [department]: {
                    ...prev.departments[department],
                    [field]: value
                }
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            // Save to Firebase
            const settingsRef = doc(db, 'settings', 'timeSettings');
            await setDoc(settingsRef, settings);

            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError('Failed to save settings: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <SettingsIcon className="w-6 h-6" />
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    {saving ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            {/* Department Hours*/}
            <div className="bg-white rounded-lg shadow">
                <button
                    onClick={() => toggleSection('departments')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-semibold">Department Hours</h2>
                    </div>
                    {collapsedSections.departments ? <ChevronRight /> : <ChevronDown />}
                </button>
                {!collapsedSections.departments && (
                    <div className="p-4 border-t space-y-8">


                        <h2 className="text-xl font-semibold mb-4">Department Hours</h2>
                        <div className="space-y-8">
                            {Object.entries(settings.departments).map(([dept, times]) => (
                                <div key={dept} className="border-t pt-4 first:border-0 first:pt-0">
                                    <h3 className="text-lg font-medium mb-3">{dept}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                value={times.startTime}
                                                onChange={(e) => handleTimeChange(dept, 'startTime', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                value={times.endTime}
                                                onChange={(e) => handleTimeChange(dept, 'endTime', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Late After
                                            </label>
                                            <input
                                                type="time"
                                                value={times.lateAfter}
                                                onChange={(e) => handleTimeChange(dept, 'lateAfter', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>


            {/* Notifications Section */}
            < div className="bg-white rounded-lg shadow" >
                <button
                    onClick={() => toggleSection('notifications')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        <h2 className="text-xl font-semibold">Notifications</h2>
                    </div>
                    {collapsedSections.notifications ? <ChevronRight /> : <ChevronDown />}
                </button>

                {!collapsedSections.notifications && (
                    <div className="p-4 border-t">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-medium">Email Alerts</span>
                                    <p className="text-sm text-gray-500">Send email notifications for:</p>
                                    <ul className="text-sm text-gray-500 ml-4 list-disc">
                                        <li>Late arrivals</li>
                                        <li>Early departures</li>
                                        <li>Absent staff</li>
                                        <li>Daily attendance summary</li>
                                    </ul>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={getSetting('notifications.emailAlerts') || false}
                                        onChange={e => handleSettingChange('notifications.emailAlerts', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Security */}

            <div className="bg-white rounded-lg shadow">
                <button
                    onClick={() => toggleSection('security')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <h2 className="text-xl font-semibold">Security</h2>
                    </div>
                    {collapsedSections.security ? <ChevronRight /> : <ChevronDown />}
                </button>

                {!collapsedSections.security && (
                    <div className="p-4 border-t space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-medium">Device Restrictions</span>
                                <p className="text-sm text-gray-500">Only allow check-ins from registered devices</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.security.enforceDeviceRestrictions}
                                    onChange={e => handleSettingChange('security.enforceDeviceRestrictions', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                )}
            </div>
            {/* Customization */}
            <div className="p-6 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="bg-white rounded-lg shadow">
                        <button
                            onClick={() => toggleSection('customization')}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2">
                                <Moon className="w-5 h-5" />
                                <h2 className="text-xl font-semibold">Appearance</h2>
                            </div>
                            {collapsedSections.customization ? <ChevronRight /> : <ChevronDown />}
                        </button>

                        {!collapsedSections.customization && (
                            <div className="p-4 border-t">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-medium">Dark Mode</span>
                                        <p className="text-sm text-gray-500">Enable dark theme for the dashboard</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.customization.darkMode}
                                            onChange={(e) => handleDarkModeChange(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Settings;