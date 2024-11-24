import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
    Loader,
    Save,
    ChevronDown,
    ChevronRight,
    Bell,
    Shield,
    Paintbrush,
    Archive,
    Settings as SettingsIcon,
    Clock
} from 'lucide-react';;
const functions = getFunctions()
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
    },
    archive: {
        selectedYear: new Date().getFullYear(),
        exportToSheets: true,
        history: []
    }
};
const handleArchive = async () => {
    if (!window.confirm(`Are you sure you want to archive records from ${settings.archive.selectedYear}?`)) {
        return;
    }

    try {
        setSaving(true);

        // Call Firebase Function
        const archiveRecords = httpsCallable(functions, 'archiveRecords');
        const result = await archiveRecords({
            year: settings.archive.selectedYear
        });

        // Update archive history
        const newHistory = [{
            date: new Date().toLocaleDateString(),
            year: settings.archive.selectedYear,
            recordCount: result.data.count,
            status: 'Completed'
        }, ...settings.archive.history];

        handleSettingChange('archive.history', newHistory);

        setMessage(`Archive complete: ${result.data.message}`);
    } catch (error) {
        setError('Archive process failed: ' + error.message);
    } finally {
        setSaving(false);
    }
};

const Settings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const handleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    };
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains('dark')
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState({
        departments: true,
        notifications: true,
        attendance: true,
        security: true,
        customization: true,
        archive: true
    });
    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };
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
        const darkModeObserver = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });

        darkModeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => darkModeObserver.disconnect();
    }, []);


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
                        <Clock className="w-5 h-5" />
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
            {/* Archive Settings */}
            <div className="bg-white rounded-lg shadow">
                <button
                    onClick={() => toggleSection('archive')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                    <div className="flex items-center gap-2">
                        <Archive className="w-5 h-5" />
                        <h2 className="text-xl font-semibold">Archive Management</h2>
                    </div>
                    {collapsedSections.archive ? <ChevronRight /> : <ChevronDown />}
                </button>

                {!collapsedSections.archive && (
                    <div className="p-4 border-t space-y-6">
                        {/* Year Selection and Archive Trigger */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Archive Records for Year
                                </label>
                                <div className="flex gap-4">
                                    <select
                                        className="px-3 py-2 border rounded-lg flex-grow"
                                        value={settings.archive?.selectedYear || new Date().getFullYear()}
                                        onChange={e => handleSettingChange('archive.selectedYear', e.target.value)}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleArchive()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                    >
                                        <Archive className="w-4 h-4" />
                                        Archive Year
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Export Options */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Export Options</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-medium">Export to Google Sheets</span>
                                    <p className="text-sm text-gray-500">Automatically export archived data to Google Sheets</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.archive?.exportToSheets || false}
                                        onChange={e => handleSettingChange('archive.exportToSheets', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Archive History */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Archive History</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="pb-2">Date</th>
                                            <th className="pb-2">Year</th>
                                            <th className="pb-2">Records</th>
                                            <th className="pb-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {settings.archive?.history?.map((record, index) => (
                                            <tr key={index}>
                                                <td className="py-2">{record.date}</td>
                                                <td className="py-2">{record.year}</td>
                                                <td className="py-2">{record.recordCount}</td>
                                                <td className="py-2">
                                                    <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Customization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <button
                    onClick={() => toggleSection('customization')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <div className="flex items-center gap-2">
                        <Paintbrush className="w-5 h-5" />
                        <h2 className="text-xl font-semibold dark:text-white">Appearance</h2>
                    </div>
                    {collapsedSections.customization ? <ChevronRight /> : <ChevronDown />}
                </button>

                {!collapsedSections.customization && (
                    <div className="p-4 border-t dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-medium dark:text-white">Dark Mode</span>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enable dark mode
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={() => {
                                        document.documentElement.classList.toggle('dark');
                                        localStorage.setItem(
                                            'darkMode',
                                            document.documentElement.classList.contains('dark')
                                        );
                                    }}
                                    className="sr-only peer"
                                />

                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer 
                        peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                        after:bg-white after:border-gray-300 after:border after:rounded-full 
                        after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                                </div>
                                <span className="ml-3 text-gray-600 dark:text-gray-300">
                                    {document.documentElement.classList.contains('dark') ? 'On' : 'Off'}
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;