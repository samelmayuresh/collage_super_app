'use server';

import { appDb } from '../../lib/db';
import { getSession } from './auth';

// ============ BUILDINGS ============

export async function createBuilding(name: string) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        const result = await appDb.query(
            'INSERT INTO buildings (name, created_by) VALUES ($1, $2) RETURNING *',
            [name, session.id]
        );
        return { success: true, building: result.rows[0] };
    } catch (error) {
        console.error('Error creating building:', error);
        return { error: 'Failed to create building' };
    }
}

export async function getBuildings() {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query('SELECT * FROM buildings ORDER BY name');
        return { buildings: result.rows };
    } catch (error) {
        console.error('Error fetching buildings:', error);
        return { error: 'Failed to fetch buildings' };
    }
}

export async function updateBuilding(id: number, name: string) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        await appDb.query('UPDATE buildings SET name = $1 WHERE id = $2', [name, id]);
        return { success: true };
    } catch (error) {
        console.error('Error updating building:', error);
        return { error: 'Failed to update building' };
    }
}

export async function deleteBuilding(id: number) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        await appDb.query('DELETE FROM buildings WHERE id = $1', [id]);
        return { success: true };
    } catch (error) {
        console.error('Error deleting building:', error);
        return { error: 'Failed to delete building' };
    }
}

// ============ FLOORS ============

export async function createFloor(buildingId: number, floorNumber: number) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        const result = await appDb.query(
            'INSERT INTO floors (building_id, floor_number) VALUES ($1, $2) RETURNING *',
            [buildingId, floorNumber]
        );
        return { success: true, floor: result.rows[0] };
    } catch (error) {
        console.error('Error creating floor:', error);
        return { error: 'Failed to create floor' };
    }
}

export async function getFloors(buildingId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'SELECT * FROM floors WHERE building_id = $1 ORDER BY floor_number',
            [buildingId]
        );
        return { floors: result.rows };
    } catch (error) {
        console.error('Error fetching floors:', error);
        return { error: 'Failed to fetch floors' };
    }
}

export async function setFloorLocation(floorId: number, lat: number, lng: number, radiusM: number = 45) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        const result = await appDb.query(
            'UPDATE floors SET center_lat = $1, center_lng = $2, radius_m = $3 WHERE id = $4 RETURNING *',
            [lat, lng, radiusM, floorId]
        );
        return { success: true, floor: result.rows[0] };
    } catch (error) {
        console.error('Error setting floor location:', error);
        return { error: 'Failed to set floor location' };
    }
}

// ============ CLASSROOMS ============

export async function createClassroom(floorId: number, roomNumber: string) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        const result = await appDb.query(
            'INSERT INTO classrooms (floor_id, room_number) VALUES ($1, $2) RETURNING *',
            [floorId, roomNumber]
        );
        return { success: true, classroom: result.rows[0] };
    } catch (error) {
        console.error('Error creating classroom:', error);
        return { error: 'Failed to create classroom' };
    }
}

export async function getClassrooms(floorId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await appDb.query(
            'SELECT * FROM classrooms WHERE floor_id = $1 ORDER BY room_number',
            [floorId]
        );
        return { classrooms: result.rows };
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        return { error: 'Failed to fetch classrooms' };
    }
}

export async function deleteClassroom(id: number) {
    const session = await getSession();
    if (!session || session.role !== 'STAFF') {
        return { error: 'Unauthorized - Staff only' };
    }

    try {
        await appDb.query('DELETE FROM classrooms WHERE id = $1', [id]);
        return { success: true };
    } catch (error) {
        console.error('Error deleting classroom:', error);
        return { error: 'Failed to delete classroom' };
    }
}
