'use client';

import React, { useState } from 'react';
import styles from './DataImporter.module.css';
import { Loader2, CheckCircle, AlertCircle, Terminal } from 'lucide-react';

export default function DataImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [tableName, setTableName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            // Auto-suggest table name from filename
            const suggestedName = selectedFile.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            setTableName(suggestedName);
            setResult(null);
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
            // Call Python Microservice
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Upload failed", error);
            setResult({
                success: false,
                errors: ["Failed to connect to Python Data Service. ensure backend is running."]
            });
        } finally {
            setIsUploading(false);
        }
    };

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
                        <input className="title" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                        {file ? "Change File" : "Upload Dataset"}
                    </label>
                </div>
            </div>

            {/* Control Panel */}
            {file && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-sm font-medium text-gray-700">Target Table Name</label>
                            <input
                                type="text"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
                                placeholder="e.g. students_2024"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <div className="text-sm text-gray-500 mb-2">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</div>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-full bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing...
                                    </>
                                ) : (
                                    <>Start Transformation</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results & Logs */}
            {result && (
                <div className={`p-6 rounded-2xl border ${result.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} animate-in fade-in zoom-in-95`}>
                    <div className="flex items-start gap-4">
                        <div className={`mt-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className={`text-lg font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                    {result.success ? 'Transformation Complete' : 'Transformation Failed'}
                                </h3>
                                <p className="text-sm opacity-80 mt-1">
                                    {result.success
                                        ? `Successfully created table "${result.tableName}" with ${result.rowCount} rows.`
                                        : "The data pipeline encountered critical errors."}
                                </p>
                            </div>

                            {/* Console / Log Output */}
                            <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner">
                                <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                                    <Terminal size={14} className="text-slate-400" />
                                    <span className="text-xs font-mono text-slate-400">System Logs</span>
                                </div>
                                <div className="p-4 font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
                                    {result.logs?.map((log: string, i: number) => (
                                        <div key={i} className="text-slate-300 border-l-2 border-slate-700 pl-2">
                                            <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                            {log}
                                        </div>
                                    ))}
                                    {result.errors?.map((err: string, i: number) => (
                                        <div key={`err-${i}`} className="text-red-400 border-l-2 border-red-500 pl-2 bg-red-900/10">
                                            <span className="text-red-500 mr-2">[ERROR]</span>
                                            {err}
                                        </div>
                                    ))}
                                    {!result.logs && !result.errors && <div className="text-slate-500 italic">No output received.</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
