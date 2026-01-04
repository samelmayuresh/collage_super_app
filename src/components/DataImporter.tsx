'use client';

import React, { useState } from 'react';
import styles from './DataImporter.module.css';
import { Loader2, CheckCircle, AlertCircle, Terminal, Download, Sparkles, Plus, Trash2, Settings2 } from 'lucide-react';

interface SchemaField {
    name: string;
    type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'boolean';
    required: boolean;
    mapFrom?: string;
}

export default function DataImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [tableName, setTableName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showSchema, setShowSchema] = useState(false);
    const [schema, setSchema] = useState<SchemaField[]>([]);
    const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const suggestedName = selectedFile.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            setTableName(suggestedName);
            setResult(null);

            // Detect columns from CSV header
            if (selectedFile.name.endsWith('.csv')) {
                const text = await selectedFile.slice(0, 2000).text();
                const firstLine = text.split('\n')[0];
                const cols = firstLine.split(',').map(c => c.trim().replace(/"/g, ''));
                setDetectedColumns(cols);
            }
        }
    };

    const addSchemaField = () => {
        setSchema([...schema, { name: '', type: 'text', required: false }]);
    };

    const removeSchemaField = (index: number) => {
        setSchema(schema.filter((_, i) => i !== index));
    };

    const updateSchemaField = (index: number, field: Partial<SchemaField>) => {
        const newSchema = [...schema];
        newSchema[index] = { ...newSchema[index], ...field };
        setSchema(newSchema);
    };

    const handleDownload = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', 'export');
        if (schema.length > 0) {
            formData.append('schema', JSON.stringify(schema));
        }

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
        if (schema.length > 0) {
            formData.append('schema', JSON.stringify(schema));
        }

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

    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-6">

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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Sparkles size={16} className="text-yellow-500" />
                            <span>📁 {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                            onClick={() => setShowSchema(!showSchema)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showSchema ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Settings2 size={16} />
                            {showSchema ? 'Hide Schema' : 'Define Schema'}
                        </button>
                    </div>

                    {/* Schema Builder */}
                    {showSchema && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-purple-900">🎯 Target Schema</h3>
                                <button
                                    onClick={addSchemaField}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                                >
                                    <Plus size={14} /> Add Column
                                </button>
                            </div>

                            {schema.length === 0 && (
                                <p className="text-sm text-purple-600 italic">Define columns to enforce a specific structure. Leave empty for auto-detection.</p>
                            )}

                            {schema.map((field, index) => (
                                <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg shadow-sm">
                                    <input
                                        type="text"
                                        placeholder="Column name"
                                        value={field.name}
                                        onChange={(e) => updateSchemaField(index, { name: e.target.value })}
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300"
                                    />
                                    <select
                                        value={field.type}
                                        onChange={(e) => updateSchemaField(index, { type: e.target.value as any })}
                                        className="px-3 py-2 border rounded-lg text-sm bg-white"
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                        <option value="boolean">Yes/No</option>
                                    </select>
                                    {detectedColumns.length > 0 && (
                                        <select
                                            value={field.mapFrom || ''}
                                            onChange={(e) => updateSchemaField(index, { mapFrom: e.target.value })}
                                            className="px-3 py-2 border rounded-lg text-sm bg-white"
                                        >
                                            <option value="">Map from...</option>
                                            {detectedColumns.map(col => (
                                                <option key={col} value={col}>{col}</option>
                                            ))}
                                        </select>
                                    )}
                                    <label className="flex items-center gap-1 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateSchemaField(index, { required: e.target.checked })}
                                        />
                                        Required
                                    </label>
                                    <button
                                        onClick={() => removeSchemaField(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

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
                        <div className="flex-1 w-full grid grid-cols-2 gap-2">
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
