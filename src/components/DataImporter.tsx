'use client';

import React, { useState, useEffect } from 'react';
import styles from './DataImporter.module.css';
import { Loader2, CheckCircle, AlertCircle, Terminal, Download, Sparkles, Plus, Trash2, Settings2, Database, Table, Eye, RefreshCw } from 'lucide-react';

interface SchemaField {
    name: string;
    type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'boolean';
    required: boolean;
    mapFrom?: string;
}

type Tab = 'import' | 'tables';

export default function DataImporter() {
    const [activeTab, setActiveTab] = useState<Tab>('import');
    const [file, setFile] = useState<File | null>(null);
    const [tableName, setTableName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showSchema, setShowSchema] = useState(false);
    const [schema, setSchema] = useState<SchemaField[]>([]);
    const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

    // Table Browser State
    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableData, setTableData] = useState<any>(null);
    const [loadingTables, setLoadingTables] = useState(false);

    // Fetch tables on mount and when tab changes
    useEffect(() => {
        if (activeTab === 'tables') {
            fetchTables();
        }
    }, [activeTab]);

    const fetchTables = async () => {
        setLoadingTables(true);
        try {
            const res = await fetch('/api/python/tables');
            const data = await res.json();
            if (data.success) {
                setTables(data.tables);
            }
        } catch (e) {
            console.error(e);
        }
        setLoadingTables(false);
    };

    const fetchTableData = async (name: string) => {
        setSelectedTable(name);
        setLoadingTables(true);
        try {
            const res = await fetch(`/api/python/tables/${name}`);
            const data = await res.json();
            if (data.success) {
                setTableData(data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoadingTables(false);
    };

    const deleteTable = async (name: string) => {
        if (!confirm(`Delete table "${name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/python/tables/${name}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchTables();
                setTableData(null);
                setSelectedTable('');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const suggestedName = selectedFile.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            setTableName(suggestedName);
            setResult(null);

            if (selectedFile.name.endsWith('.csv')) {
                const text = await selectedFile.slice(0, 2000).text();
                const firstLine = text.split('\n')[0];
                const cols = firstLine.split(',').map(c => c.trim().replace(/"/g, ''));
                setDetectedColumns(cols);
            }
        }
    };

    const addSchemaField = () => setSchema([...schema, { name: '', type: 'text', required: false }]);
    const removeSchemaField = (i: number) => setSchema(schema.filter((_, idx) => idx !== i));
    const updateSchemaField = (i: number, field: Partial<SchemaField>) => {
        const newSchema = [...schema];
        newSchema[i] = { ...newSchema[i], ...field };
        setSchema(newSchema);
    };

    const handleDownload = async () => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', 'export');
        if (schema.length > 0) formData.append('schema', JSON.stringify(schema));
        try {
            const response = await fetch('/api/python/download', { method: 'POST', body: formData });
            if (!response.ok) throw new Error("Download failed");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cleaned_${file.name.split('.')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setResult({ success: true, logs: ["✅ File downloaded"] });
        } catch (error) {
            setResult({ success: false, errors: ["Download failed"] });
        }
        setIsUploading(false);
    };

    const handleUpload = async () => {
        if (!file || !tableName) return;
        setIsUploading(true);
        setResult(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', tableName);
        if (schema.length > 0) formData.append('schema', JSON.stringify(schema));
        try {
            const response = await fetch('/api/python/upload', { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`${response.status}`);
            const data = await response.json();
            setResult(data);
        } catch (error: any) {
            setResult({ success: false, errors: [error.message] });
        }
        setIsUploading(false);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">

            {/* Tab Switcher */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('import')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'import' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Sparkles size={18} /> Import Data
                </button>
                <button
                    onClick={() => setActiveTab('tables')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'tables' ? 'bg-white text-black shadow' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Database size={18} /> Browse Tables
                </button>
            </div>

            {/* === IMPORT TAB === */}
            {activeTab === 'import' && (
                <>
                    {/* 3D Folder */}
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

                    {file && (
                        <div className="bg-white p-6 rounded-2xl shadow-lg border space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">📁 {file.name}</span>
                                <button onClick={() => setShowSchema(!showSchema)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${showSchema ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                                    <Settings2 size={16} /> {showSchema ? 'Hide Schema' : 'Define Schema'}
                                </button>
                            </div>

                            {showSchema && (
                                <div className="bg-purple-50 p-4 rounded-xl space-y-3">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold text-purple-900">🎯 Target Schema</h3>
                                        <button onClick={addSchemaField} className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-sm"><Plus size={14} /> Add</button>
                                    </div>
                                    {schema.map((f, i) => (
                                        <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg">
                                            <input placeholder="Column name" value={f.name} onChange={e => updateSchemaField(i, { name: e.target.value })} className="flex-1 px-2 py-1 border rounded text-sm" />
                                            <select value={f.type} onChange={e => updateSchemaField(i, { type: e.target.value as any })} className="px-2 py-1 border rounded text-sm">
                                                <option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="email">Email</option><option value="phone">Phone</option>
                                            </select>
                                            {detectedColumns.length > 0 && (
                                                <select value={f.mapFrom || ''} onChange={e => updateSchemaField(i, { mapFrom: e.target.value })} className="px-2 py-1 border rounded text-sm">
                                                    <option value="">Map from...</option>
                                                    {detectedColumns.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            )}
                                            <button onClick={() => removeSchemaField(i)} className="p-1 text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <input value={tableName} onChange={e => setTableName(e.target.value)} placeholder="Table name" className="flex-1 px-4 py-3 border-2 rounded-xl" />
                                <button onClick={handleUpload} disabled={isUploading} className="bg-black text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Transform
                                </button>
                                <button onClick={handleDownload} disabled={isUploading} className="border-2 border-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                                    <Download size={18} /> Download
                                </button>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className={`p-5 rounded-2xl border-2 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h3 className={`font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                                {result.success ? '🎉 Success' : '❌ Failed'}
                            </h3>
                            <div className="mt-3 bg-slate-900 rounded-xl p-4 font-mono text-xs max-h-48 overflow-auto">
                                {result.logs?.map((l: string, i: number) => <div key={i} className="text-slate-300 border-l-2 border-emerald-500 pl-3 py-0.5">{l}</div>)}
                                {result.errors?.map((e: string, i: number) => <div key={i} className="text-red-400 border-l-2 border-red-500 pl-3">{e}</div>)}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* === TABLES TAB === */}
            {activeTab === 'tables' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Database size={24} /> Your Tables</h2>
                        <button onClick={fetchTables} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                            <RefreshCw size={16} className={loadingTables ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>

                    {tables.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No tables found. Import data to create tables.</p>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {tables.map(t => (
                                <button
                                    key={t}
                                    onClick={() => fetchTableData(t)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedTable === t ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <Table size={20} className="text-gray-400 mb-2" />
                                    <span className="font-mono text-sm">{t}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {tableData && (
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Eye size={20} /> {tableData.table_name}
                                    <span className="text-sm font-normal text-gray-500">
                                        ({tableData.showing} of {tableData.total_rows} rows)
                                    </span>
                                </h3>
                                <button onClick={() => deleteTable(tableData.table_name)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">
                                    <Trash2 size={16} /> Delete Table
                                </button>
                            </div>

                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {tableData.columns.map((c: any) => (
                                                <th key={c.name} className="px-4 py-3 text-left font-semibold">
                                                    {c.name}
                                                    <span className="text-xs font-normal text-gray-400 ml-1">({c.type})</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData.rows.map((row: any, i: number) => (
                                            <tr key={i} className="border-t hover:bg-gray-50">
                                                {tableData.columns.map((c: any) => (
                                                    <td key={c.name} className="px-4 py-2 font-mono text-xs">
                                                        {String(row[c.name] ?? '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
