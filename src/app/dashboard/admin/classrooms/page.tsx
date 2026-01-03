'use client';

import { useState, useEffect } from 'react';
import { getBuildings, getFloors, getClassrooms } from '../../../../actions/buildings';
import { DoorOpen, Loader2, Layers, Building2, AlertCircle } from 'lucide-react';

interface Building {
    id: number;
    name: string;
}

interface Floor {
    id: number;
    floor_number: number;
}

interface Classroom {
    id: number;
    floor_id: number;
    room_number: string;
}

export default function AdminClassroomsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBuildings();
    }, []);

    useEffect(() => {
        if (selectedBuilding) {
            loadFloors(selectedBuilding);
            setSelectedFloor(null);
            setClassrooms([]);
        }
    }, [selectedBuilding]);

    useEffect(() => {
        if (selectedFloor) {
            loadClassrooms(selectedFloor);
        }
    }, [selectedFloor]);

    async function loadBuildings() {
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

    async function loadClassrooms(floorId: number) {
        const result = await getClassrooms(floorId);
        if (result.classrooms) {
            setClassrooms(result.classrooms);
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
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                        <DoorOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Classrooms</h1>
                        <p className="text-gray-500 text-sm">View classrooms created by Staff</p>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-blue-800 mb-6">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm">Classrooms are created and managed by <span className="font-bold">Staff</span>. Select a building and floor to view available rooms.</p>
                </div>

                {/* Building & Floor Selector */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Building2 size={16} />
                                Building
                            </label>
                            <select
                                value={selectedBuilding || ''}
                                onChange={(e) => setSelectedBuilding(parseInt(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Choose building...</option>
                                {buildings.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Layers size={16} />
                                Floor
                            </label>
                            <select
                                value={selectedFloor || ''}
                                onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
                                disabled={!selectedBuilding}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                            >
                                <option value="">Choose floor...</option>
                                {floors.map((f) => (
                                    <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Classrooms List */}
                {selectedFloor && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-bold">Classrooms ({classrooms.length})</h2>
                        </div>
                        {classrooms.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No classrooms found on this floor. Staff needs to add them.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {classrooms.map((classroom) => (
                                    <div key={classroom.id} className="flex items-center p-4 hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                                <DoorOpen size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Room {classroom.room_number}</h3>
                                                <p className="text-gray-400 text-xs">ID: {classroom.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!selectedFloor && !selectedBuilding && (
                    <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
                        Select a building and floor to view classrooms
                    </div>
                )}
            </div>
        </div>
    );
}
