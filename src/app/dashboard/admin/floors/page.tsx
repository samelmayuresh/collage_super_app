'use client';

import { useState, useEffect } from 'react';
import { getBuildings, getFloors } from '../../../../actions/buildings';
import { Layers, Loader2, Building2, MapPin } from 'lucide-react';

interface Building { id: number; name: string; }
interface Floor { id: number; floor_number: number; center_lat?: number; center_lng?: number; radius_m?: number; }

export default function AdminFloorsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBuildings();
    }, []);

    useEffect(() => {
        if (selectedBuilding) {
            loadFloors(selectedBuilding);
        } else {
            setFloors([]);
        }
    }, [selectedBuilding]);

    async function loadBuildings() {
        setLoading(true);
        const result = await getBuildings();
        if (result.buildings) {
            setBuildings(result.buildings);
        }
        setLoading(false);
    }

    async function loadFloors(buildingId: number) {
        const result = await getFloors(buildingId);
        if (result.floors) {
            setFloors(result.floors);
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-8 bg-[#F5F7FA]">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Floors</h1>
                        <p className="text-gray-500 text-sm">View building floors and locations</p>
                    </div>
                </div>

                {/* Building Selector */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Building2 size={16} />
                        Select Building
                    </label>
                    <select
                        value={selectedBuilding || ''}
                        onChange={(e) => setSelectedBuilding(parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">Choose building...</option>
                        {buildings.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {/* Floors List */}
                {selectedBuilding && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-700">Floors in {buildings.find(b => b.id === selectedBuilding)?.name}</h2>
                        </div>
                        {floors.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No floors found in this building.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {floors.map((floor) => (
                                    <div key={floor.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                                    {floor.floor_number}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Floor {floor.floor_number}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded">ID: {floor.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {floor.center_lat && floor.center_lng ? (
                                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                                                    <MapPin size={14} />
                                                    <span>Location Configured</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium">
                                                    <MapPin size={14} />
                                                    <span>No Location</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
