/**
 * Geo Utilities for Attendance System
 * Haversine formula for GPS distance calculation
 */

const EARTH_RADIUS_M = 6371000; // Earth's radius in meters

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two GPS points using Haversine formula
 * @returns Distance in meters
 */
export function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_M * c;
}

/**
 * Check if a point is within a radius from center
 * @returns true if within radius
 */
export function isWithinRadius(
    studentLat: number,
    studentLng: number,
    centerLat: number,
    centerLng: number,
    radiusM: number
): boolean {
    const distance = haversineDistance(studentLat, studentLng, centerLat, centerLng);
    return distance <= radiusM;
}

/**
 * Generate a random QR token
 */
export function generateQRToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
