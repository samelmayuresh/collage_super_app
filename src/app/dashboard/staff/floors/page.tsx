'use client';

import { useState, useEffect } from 'react';
import { getBuildings, createFloor, getFloors, setFloorLocation } from '../../../../actions/buildings';
import { Layers, Plus, MapPin, Loader2, CheckCircle, Building2 } from 'lucide-react';

interface Building {
    id: number;
    name: string;
}

interface Floor {
    id: number;
    building_id: number;
    floor_number: number;
    center_lat: number | null;
    center_lng: number | null;
    radius_m: number;
}

export default function FloorsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
    const [floors, setFloors] = useState<Floor[]>([]);
    const [newFloorNumber, setNewFloorNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Location setup state
    const [settingLocation, setSettingLocation] = useState<number | null>(null);
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [radius, setRadius] = useState('100');
    const [gettingGPS, setGettingGPS] = useState(false);

    useEffect(() => {
        loadBuildings();
    }, []);

    useEffect(() => {
        if (selectedBuilding) {
            loadFloors(selectedBuilding);
        }
    }, [selectedBuilding]);

    async function loadBuildings() {
        const result = await getBuildings();
        if (result.buildings) {
            setBuildings(result.buildings);
            if (result.buildings.length > 0) {
                setSelectedBuilding(result.buildings[0].id);
            }
        }
        setLoading(false);
    }

    async function loadFloors(buildingId: number) {
        const result = await getFloors(buildingId);
        if (result.floors) {
            setFloors(result.floors);
        }
    }

    async function handleCreateFloor(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedBuilding || !newFloorNumber) return;

        setCreating(true);
        setError(null);
        const result = await createFloor(selectedBuilding, parseInt(newFloorNumber));

        if (result.error) {
            setError(result.error);
        } else {
            setNewFloorNumber('');
            await loadFloors(selectedBuilding);
        }
        setCreating(false);
    }

    async function handleAutoDetect() {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setGettingGPS(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLat(position.coords.latitude.toString());
                setLng(position.coords.longitude.toString());
                setGettingGPS(false);
            },
            (err) => {
                setError('Unable to get location: ' + err.message);
                setGettingGPS(false);
            },
            { enableHighAccuracy: true }
        );
    }

    async function handleSaveLocation(floorId: number) {
        if (!lat || !lng) {
            setError('Please enter or auto-detect coordinates');
            return;
        }

        const result = await setFloorLocation(
            floorId,
            parseFloat(lat),
            parseFloat(lng),
            parseInt(radius)
        );

        if (result.error) {
            setError(result.error);
        } else {
            setSettingLocation(null);
            setLat('');
            setLng('');
            setRadius('100');
            if (selectedBuilding) {
                await loadFloors(selectedBuilding);
            }
        }
    }

    return (
        <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Floors & Location</h1>
                        <p className="text-gray-500 text-sm">Add floors and set GPS geo-fencing locations</p>
                    </div>
                </div>

                {/* Building Selector */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Building</label>
                    <select
                        value={selectedBuilding || ''}
                        onChange={(e) => setSelectedBuilding(parseInt(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
                    >
                        <option value="">Choose a building...</option>
                        {buildings.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {selectedBuilding && (
                    <>
                        {/* Create Floor Form */}
                        <form onSubmit={handleCreateFloor} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="number"
                                    value={newFloorNumber}
                                    onChange={(e) => setNewFloorNumber(e.target.value)}
                                    placeholder="Floor number (e.g., 1, 2, 3)"
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
                                />
                                <button
                                    type="submit"
                                    disabled={creating || !newFloorNumber}
                                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50"
                                >
                                    {creating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                    Add Floor
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        </form>

                        {/* Floors List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {floors.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No floors yet. Add a floor above.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {floors.map((floor) => (
                                        <div key={floor.id} className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${floor.center_lat ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Layers size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Floor {floor.floor_number}</h3>
                                                        <p className="text-gray-400 text-xs">
                                                            {floor.center_lat
                                                                ? `📍 Location set (${floor.radius_m}m radius)`
                                                                : '⚠️ No location set'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSettingLocation(floor.id);
                                                        if (floor.center_lat) {
                                                            setLat(floor.center_lat.toString());
                                                            setLng(floor.center_lng?.toString() || '');
                                                            setRadius(floor.radius_m.toString());
                                                        }
                                                    }}
                                                    className="px-4 py-2 text-sm bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 flex items-center gap-2"
                                                >
                                                    <MapPin size={16} />
                                                    {floor.center_lat ? 'Update' : 'Set'} Location
                                                </button>
                                            </div>

                                            {/* Location Setup Panel */}
                                            {settingLocation === floor.id && (
                                                <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                                    <h4 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
                                                        <MapPin size={18} />
                                                        Set Floor Location
                                                    </h4>

                                                    <button
                                                        onClick={handleAutoDetect}
                                                        disabled={gettingGPS}
                                                        className="w-full mb-4 px-4 py-3 bg-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-50"
                                                    >
                                                        {gettingGPS ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                                                        📡 Use Current Location
                                                    </button>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                                        <div>
                                                            <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
                                                            <input
                                                                type="text"
                                                                value={lat}
                                                                onChange={(e) => setLat(e.target.value)}
                                                                placeholder="19.076045"
                                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
                                                            <input
                                                                type="text"
                                                                value={lng}
                                                                onChange={(e) => setLng(e.target.value)}
                                                                placeholder="72.877702"
                                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <input
                                                                type="number"
                                                                value={radius}
                                                                onChange={(e) => setRadius(e.target.value)}
                                                                placeholder="100"
                                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                                            />
                                                            <p className="text-[10px] text-orange-600 mt-1">Recommended: 80-150m for indoor GPS stability</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSaveLocation(floor.id)}
                                                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-600"
                                                        >
                                                            <CheckCircle size={18} />
                                                            Save Location
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSettingLocation(null);
                                                                setLat('');
                                                                setLng('');
                                                                setRadius('100');
                                                            }}
                                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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
