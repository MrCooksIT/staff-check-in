import React, { useState, useEffect } from 'react';
import {
    Users, Clock, Calendar, TrendingUp, Download,
    Filter, RefreshCw, ChevronDown, Printer
} from 'lucide-react';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [dateRange, setDateRange] = useState('today');
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Export Functions
    const exportToExcel = async () => {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=exportExcel&department=${selectedDepartment}&range=${dateRange}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SJMC_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const printReport = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6 bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="bg-white/20 rounded-lg px-4 py-2"
                    >
                        <option value="All">All Departments</option>
                        {CONFIG.DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white/20 rounded-lg px-4 py-2"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="term">Current Term</option>
                    </select>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2"
                    >
                        <Download className="w-4 h-4" />
                        Export
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl text-gray-800 py-2">
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            >
                                <Download className="w-4 h-4" />
                                Export to Excel
                            </button>
                            <button
                                onClick={printReport}
                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                            >
                                <Printer className="w-4 h-4" />
                                Print Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Rest of your dashboard components */}
        </div>
    );
};

// Add this to your Google Apps Script
function exportToExcel() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TIMESHEET);

    // Create a temporary spreadsheet for the export
    const tempSpreadsheet = SpreadsheetApp.create('Temp Export ' + new Date().toISOString());
    const tempSheet = tempSpreadsheet.getSheets()[0];

    // Copy data
    const data = sheet.getDataRange().getValues();
    tempSheet.getRange(1, 1, data.length, data[0].length).setValues(data);

    // Format the temp sheet
    tempSheet.getRange(1, 1, 1, data[0].length).setFontWeight('bold');
    tempSheet.setFrozenRows(1);
    tempSheet.autoResizeColumns(1, data[0].length);

    // Convert to Excel
    const url = "https://docs.google.com/feeds/download/spreadsheets/Export?key=" + tempSpreadsheet.getId() + "&exportFormat=xlsx";

    const token = ScriptApp.getOAuthToken();
    const response = UrlFetchApp.fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    // Clean up
    DriveApp.getFileById(tempSpreadsheet.getId()).setTrashed(true);

    return response.getBlob();
}