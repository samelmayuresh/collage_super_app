'use client';

import { useState, useEffect } from 'react';
import { getBuildings, getFloors, createClassroom, getClassrooms, deleteClassroom } from '../../../../actions/buildings';
import { DoorOpen, Plus, Trash2, Loader2, Layers, Building2 } from 'lucide-react';

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

export default function ClassroomsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedFloor || !newRoomNumber.trim()) return;

        setCreating(true);
        setError(null);
        const result = await createClassroom(selectedFloor, newRoomNumber);

        if (result.error) {
            setError(result.error);
        } else {
            setNewRoomNumber('');
            await loadClassrooms(selectedFloor);
        }
        setCreating(false);
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this classroom?')) return;

        await deleteClassroom(id);
        if (selectedFloor) {
            await loadClassrooms(selectedFloor);
        }
    }

    return (
        <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                        <DoorOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Classrooms</h1>
                        <p className="text-gray-500 text-sm">Create and manage classrooms on each floor</p>
                    </div>
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500"
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                            >
                                <option value="">Choose floor...</option>
                                {floors.map((f) => (
                                    <option key={f.id} value={f.id}>Floor {f.floor_number}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {selectedFloor && (
                    <>
                        {/* Create Classroom Form */}
                        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={newRoomNumber}
                                    onChange={(e) => setNewRoomNumber(e.target.value)}
                                    placeholder="Room number (e.g., 101, A-201)"
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    type="submit"
                                    disabled={creating || !newRoomNumber.trim()}
                                    className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-600 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                    Add Classroom
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </form>

                        {/* Classrooms List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {classrooms.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No classrooms on this floor. Add one above.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {classrooms.map((classroom) => (
                                        <div key={classroom.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                                    <DoorOpen size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">Room {classroom.room_number}</h3>
                                                    <p className="text-gray-400 text-xs">ID: {classroom.id}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(classroom.id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
