'use client';

import React, { useState, useEffect } from 'react';
import styles from './DataImporter.module.css';
import { Loader2, CheckCircle, AlertCircle, Terminal, Download, Sparkles, Plus, Trash2, Settings2, Database, Table, Eye, RefreshCw, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

interface SchemaField {
    name: string;
    type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'boolean';
    required: boolean;
    mapFrom?: string;
}

type Tab = 'import' | 'tables';
type ViewMode = 'table' | 'charts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#6366f1'];

export default function DataImporter() {
    const [activeTab, setActiveTab] = useState<Tab>('import');
    const [file, setFile] = useState<File | null>(null);
    const [tableName, setTableName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showSchema, setShowSchema] = useState(false);
    const [schema, setSchema] = useState<SchemaField[]>([]);
    const [detectedColumns, setDetectedColumns] = useState<string[]>([]);

    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [tableData, setTableData] = useState<any>(null);
    const [loadingTables, setLoadingTables] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('table');

    useEffect(() => {
        if (activeTab === 'tables') fetchTables();
    }, [activeTab]);

    const fetchTables = async () => {
        setLoadingTables(true);
        try {
            const res = await fetch('/api/python/tables');
            const data = await res.json();
            if (data.success) setTables(data.tables);
        } catch (e) { console.error(e); }
        setLoadingTables(false);
    };

    const fetchTableData = async (name: string) => {
        setSelectedTable(name);
        setLoadingTables(true);
        try {
            const res = await fetch(`/api/python/tables/${name}?limit=500`);
            const data = await res.json();
            if (data.success) setTableData(data);
        } catch (e) { console.error(e); }
        setLoadingTables(false);
    };

    const deleteTable = async (name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        await fetch(`/api/python/tables/${name}`, { method: 'DELETE' });
        fetchTables();
        setTableData(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setTableName(f.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase());
            setResult(null);
            if (f.name.endsWith('.csv')) {
                const text = await f.slice(0, 2000).text();
                setDetectedColumns(text.split('\n')[0].split(',').map(c => c.trim().replace(/"/g, '')));
            }
        }
    };

    const addSchemaField = () => setSchema([...schema, { name: '', type: 'text', required: false }]);
    const removeSchemaField = (i: number) => setSchema(schema.filter((_, idx) => idx !== i));
    const updateSchemaField = (i: number, field: Partial<SchemaField>) => {
        const n = [...schema]; n[i] = { ...n[i], ...field }; setSchema(n);
    };

    const handleUpload = async () => {
        if (!file || !tableName) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', tableName);
        if (schema.length) formData.append('schema', JSON.stringify(schema));
        try {
            const res = await fetch('/api/python/upload', { method: 'POST', body: formData });
            setResult(await res.json());
        } catch (e: any) { setResult({ success: false, errors: [e.message] }); }
        setIsUploading(false);
    };

    const handleDownload = async () => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('table_name', 'export');
        try {
            const res = await fetch('/api/python/download', { method: 'POST', body: formData });
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `cleaned_${file.name}`;
            a.click();
        } catch (e) { }
        setIsUploading(false);
    };

    // Generate chart data from table
    const generateCharts = () => {
        if (!tableData?.rows?.length) return null;

        const numericCols = tableData.columns.filter((c: any) =>
            ['integer', 'numeric', 'double precision', 'real', 'bigint'].includes(c.type)
        );
        const textCols = tableData.columns.filter((c: any) =>
            ['text', 'character varying', 'varchar'].includes(c.type)
        );

        const charts = [];

        // Bar chart for first numeric column
        if (numericCols.length > 0) {
            const col = numericCols[0].name;
            const labelCol = textCols[0]?.name || tableData.columns[0].name;
            const chartData = tableData.rows.slice(0, 10).map((r: any, i: number) => ({
                name: String(r[labelCol] || `Item ${i + 1}`).slice(0, 15),
                value: Number(r[col]) || 0
            }));

            charts.push(
                <div key="bar" className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-2xl border border-purple-100">
                    <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} /> {col} by {labelCol}
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {chartData.map((_: any, i: number) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        // Pie chart for categorical distribution
        if (textCols.length > 0) {
            const col = textCols[0].name;
            const counts: Record<string, number> = {};
            tableData.rows.forEach((r: any) => {
                const val = String(r[col] || 'Unknown').slice(0, 20);
                counts[val] = (counts[val] || 0) + 1;
            });
            const pieData = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([name, value]) => ({ name, value }));

            charts.push(
                <div key="pie" className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <PieIcon size={20} /> Distribution: {col}
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        // Area chart for numeric trend
        if (numericCols.length > 1) {
            const col1 = numericCols[0].name;
            const col2 = numericCols[1].name;
            const areaData = tableData.rows.slice(0, 20).map((r: any, i: number) => ({
                x: i + 1,
                [col1]: Number(r[col1]) || 0,
                [col2]: Number(r[col2]) || 0
            }));

            charts.push(
                <div key="area" className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-green-100 col-span-2">
                    <h4 className="font-bold text-green-900 mb-4">📈 Trend: {col1} vs {col2}</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={areaData}>
                            <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey={col1} stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                            <Area type="monotone" dataKey={col2} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return charts.length ? charts : <p className="text-gray-500">No chartable data found</p>;
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">

            {/* Tab Switcher */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                <button onClick={() => setActiveTab('import')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'import' ? 'bg-white shadow' : 'text-gray-500'}`}>
                    <Sparkles size={18} /> Import
                </button>
                <button onClick={() => setActiveTab('tables')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'tables' ? 'bg-white shadow' : 'text-gray-500'}`}>
                    <Database size={18} /> Tables
                </button>
            </div>

            {/* IMPORT TAB */}
            {activeTab === 'import' && (
                <>
                    <div className={styles.importerWrapper}>
                        <div className={styles.container}>
                            <div className={styles.folder}>
                                <div className={styles.frontSide}><div className={styles.tip} /><div className={styles.cover} /></div>
                                <div className={`${styles.backSide} ${styles.cover}`} />
                            </div>
                            <label className={styles.customFileUpload}>
                                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
                                {file ? "Change" : "Upload"}
                            </label>
                        </div>
                    </div>

                    {file && (
                        <div className="bg-white p-6 rounded-2xl shadow-lg border space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">📁 {file.name}</span>
                                <button onClick={() => setShowSchema(!showSchema)} className={`px-4 py-2 rounded-lg text-sm ${showSchema ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}>
                                    <Settings2 size={16} className="inline mr-1" /> Schema
                                </button>
                            </div>

                            {showSchema && (
                                <div className="bg-purple-50 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-purple-900">🎯 Schema</span>
                                        <button onClick={addSchemaField} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm"><Plus size={14} className="inline" /> Add</button>
                                    </div>
                                    {schema.map((f, i) => (
                                        <div key={i} className="flex gap-2 bg-white p-2 rounded-lg">
                                            <input value={f.name} onChange={e => updateSchemaField(i, { name: e.target.value })} className="flex-1 px-2 py-1 border rounded text-sm" placeholder="Name" />
                                            <select value={f.type} onChange={e => updateSchemaField(i, { type: e.target.value as any })} className="px-2 py-1 border rounded text-sm">
                                                <option value="text">Text</option><option value="number">Number</option><option value="date">Date</option>
                                            </select>
                                            <button onClick={() => removeSchemaField(i)} className="text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <input value={tableName} onChange={e => setTableName(e.target.value)} className="flex-1 px-4 py-3 border-2 rounded-xl" placeholder="Table name" />
                                <button onClick={handleUpload} disabled={isUploading} className="bg-black text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Transform
                                </button>
                                <button onClick={handleDownload} className="border-2 border-black px-6 py-3 rounded-xl"><Download size={18} /></button>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className={`p-5 rounded-2xl border-2 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h3 className="font-bold">{result.success ? '🎉 Success' : '❌ Failed'}</h3>
                            <div className="mt-3 bg-slate-900 rounded-xl p-4 font-mono text-xs max-h-40 overflow-auto">
                                {result.logs?.map((l: string, i: number) => <div key={i} className="text-slate-300 border-l-2 border-emerald-500 pl-3">{l}</div>)}
                                {result.errors?.map((e: string, i: number) => <div key={i} className="text-red-400 pl-3">{e}</div>)}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* TABLES TAB */}
            {activeTab === 'tables' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border space-y-4">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Database size={24} /> Tables</h2>
                        <button onClick={fetchTables} className="px-4 py-2 bg-gray-100 rounded-lg text-sm"><RefreshCw size={16} className={`inline mr-1 ${loadingTables ? 'animate-spin' : ''}`} /> Refresh</button>
                    </div>

                    {tables.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No tables. Import data first.</p>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {tables.map(t => (
                                <button key={t} onClick={() => fetchTableData(t)} className={`p-4 rounded-xl border-2 text-left ${selectedTable === t ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                                    <Table size={20} className="text-gray-400 mb-2" /><span className="font-mono text-sm">{t}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {tableData && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg"><Eye size={20} className="inline mr-2" />{tableData.table_name} <span className="text-sm font-normal text-gray-500">({tableData.total_rows} rows)</span></h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-lg text-sm ${viewMode === 'table' ? 'bg-black text-white' : 'bg-gray-100'}`}><Table size={16} className="inline mr-1" /> Table</button>
                                    <button onClick={() => setViewMode('charts')} className={`px-4 py-2 rounded-lg text-sm ${viewMode === 'charts' ? 'bg-black text-white' : 'bg-gray-100'}`}><BarChart3 size={16} className="inline mr-1" /> Charts</button>
                                    <button onClick={() => deleteTable(tableData.table_name)} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm"><Trash2 size={16} className="inline mr-1" /> Delete</button>
                                </div>
                            </div>

                            {viewMode === 'table' && (
                                <div className="overflow-x-auto border rounded-xl max-h-96">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>{tableData.columns.map((c: any) => <th key={c.name} className="px-4 py-3 text-left font-semibold">{c.name}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {tableData.rows.slice(0, 50).map((row: any, i: number) => (
                                                <tr key={i} className="border-t hover:bg-gray-50">
                                                    {tableData.columns.map((c: any) => <td key={c.name} className="px-4 py-2 font-mono text-xs">{String(row[c.name] ?? '')}</td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {viewMode === 'charts' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {generateCharts()}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
