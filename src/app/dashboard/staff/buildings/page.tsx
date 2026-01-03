'use client';

import { useState, useEffect } from 'react';
import { createBuilding, getBuildings, deleteBuilding } from '../../../../actions/buildings';
import { Building2, Plus, Trash2, Loader2 } from 'lucide-react';

interface Building {
    id: number;
    name: string;
    created_at: string;
}

export default function BuildingsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBuildings();
    }, []);

    async function loadBuildings() {
        setLoading(true);
        const result = await getBuildings();
        if (result.buildings) {
            setBuildings(result.buildings);
        }
        setLoading(false);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;

        setCreating(true);
        setError(null);
        const result = await createBuilding(newName);

        if (result.error) {
            setError(result.error);
        } else {
            setNewName('');
            await loadBuildings();
        }
        setCreating(false);
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this building? This will also delete all floors and classrooms inside.')) return;

        await deleteBuilding(id);
        await loadBuildings();
    }

    return (
        <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Buildings</h1>
                        <p className="text-gray-500 text-sm">Create and manage campus buildings</p>
                    </div>
                </div>

                {/* Create Form */}
                <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter building name..."
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={creating || !newName.trim()}
                            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            {creating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                            Add Building
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>

                {/* Buildings List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                            Loading buildings...
                        </div>
                    ) : buildings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No buildings yet. Create your first building above.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {buildings.map((building) => (
                                <div key={building.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{building.name}</h3>
                                            <p className="text-gray-400 text-xs">ID: {building.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(building.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
