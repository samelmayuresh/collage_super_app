'use client';

import React, { useState } from 'react';
import styles from './DataImporter.module.css';
import { Loader2, CheckCircle, AlertCircle, Terminal, Download, Sparkles, Trash2, Calendar, Mail, Phone, Hash } from 'lucide-react';

export default function DataImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [tableName, setTableName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const suggestedName = selectedFile.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            setTableName(suggestedName);
            setResult(null);
        }
    };

    const handleDownload = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', 'export');

        try {
            const response = await fetch('/api/python/download', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cleaned_${file.name.split('.')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setResult({ success: true, tableName: "Downloaded", logs: ["✅ Cleaned file downloaded successfully."] });
        } catch (error) {
            setResult({ success: false, errors: ["Download failed. Check backend connection."] });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpload = async () => {
        if (!file || !tableName) return;
        setIsUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', tableName);

        try {
            const response = await fetch('/api/python/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`${response.status}: ${text.substring(0, 100)}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (error: any) {
            setResult({
                success: false,
                errors: [`Connection Failed: ${error.message}`]
            });
        } finally {
            setIsUploading(false);
        }
    };

    const StatBadge = ({ icon: Icon, label, value, color }: any) => (
        value > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color} text-white text-xs font-medium`}>
                <Icon size={14} />
                <span>{value} {label}</span>
            </div>
        )
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8">

            {/* 3D Folder Upload UI */}
            <div className={styles.importerWrapper}>
                <div className={styles.container}>
                    <div className={styles.folder}>
                        <div className={styles.frontSide}>
                            <div className={styles.tip} />
                            <div className={styles.cover} />
                        </div>
                        <div className={`${styles.backSide} ${styles.cover}`} />
                    </div>
                    <label className={styles.customFileUpload}>
                        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                        {file ? "Change File" : "Upload Dataset"}
                    </label>
                </div>
            </div>

            {/* Control Panel */}
            {file && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Sparkles size={16} className="text-yellow-500" />
                        <span>Flagship Engine will auto-detect & transform: Dates, Emails, Phones, Names, Currency</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-sm font-medium text-gray-700">Target Table Name</label>
                            <input
                                type="text"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all"
                                placeholder="e.g. students_2024"
                            />
                        </div>
                        <div className="flex-1 w-full space-y-3">
                            <div className="text-sm text-gray-600 font-medium">
                                📁 {file.name} <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="bg-gradient-to-r from-black to-gray-800 text-white px-4 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-black disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg"
                                >
                                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    Transform & Load
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={isUploading}
                                    className="bg-white text-black border-2 border-black px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                                >
                                    <Download size={18} />
                                    Download Clean
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className={`p-6 rounded-2xl border-2 ${result.success ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${result.success ? 'bg-green-500' : 'bg-red-500'}`}>
                            {result.success ? <CheckCircle size={24} className="text-white" /> : <AlertCircle size={24} className="text-white" />}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className={`text-xl font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                    {result.success ? '🎉 Transformation Complete' : '❌ Transformation Failed'}
                                </h3>
                                {result.success && result.rowCount && (
                                    <p className="text-sm text-green-700 mt-1">
                                        Created table <code className="bg-green-100 px-2 py-0.5 rounded font-mono">{result.tableName}</code> with {result.rowCount} records
                                    </p>
                                )}
                            </div>

                            {/* Stats Grid */}
                            {result.stats && (
                                <div className="flex flex-wrap gap-2">
                                    <StatBadge icon={Trash2} label="duplicates removed" value={result.stats.duplicates_removed} color="bg-purple-500" />
                                    <StatBadge icon={Trash2} label="empty rows removed" value={result.stats.empty_rows_removed} color="bg-gray-500" />
                                    <StatBadge icon={Calendar} label="dates standardized" value={result.stats.dates_standardized} color="bg-blue-500" />
                                    <StatBadge icon={Mail} label="emails validated" value={result.stats.emails_validated} color="bg-orange-500" />
                                    <StatBadge icon={Phone} label="phones cleaned" value={result.stats.phones_validated} color="bg-teal-500" />
                                    <StatBadge icon={Hash} label="numbers cleaned" value={result.stats.numbers_cleaned} color="bg-indigo-500" />
                                </div>
                            )}

                            {/* Console Logs */}
                            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xl">
                                <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                                    <Terminal size={14} className="text-emerald-400" />
                                    <span className="text-xs font-mono text-slate-300">Transformation Log</span>
                                </div>
                                <div className="p-4 font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
                                    {result.logs?.map((log: string, i: number) => (
                                        <div key={i} className="text-slate-300 border-l-2 border-emerald-500 pl-3 py-0.5">
                                            {log}
                                        </div>
                                    ))}
                                    {result.errors?.map((err: string, i: number) => (
                                        <div key={`err-${i}`} className="text-red-400 border-l-2 border-red-500 pl-3 py-0.5 bg-red-900/20">
                                            ❌ {err}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
