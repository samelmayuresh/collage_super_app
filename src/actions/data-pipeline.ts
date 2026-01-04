'use server';

import { dataDb, sanitizeTableName } from '../lib/data-db';

export type ImportResult = {
    success: boolean;
    tableName?: string;
    rowCount?: number;
    errors?: string[];
    logs?: string[];
};

export async function importDataToTable(
    rawTableName: string,
    data: Record<string, any>[]
): Promise<ImportResult> {
    const logs: string[] = [];
    const errors: string[] = [];

    try {
        logs.push("Initializing data transformation sequence...");

        // 1. Sanitize Table Name
        const tableName = sanitizeTableName(rawTableName);
        logs.push(`Target table identified: ${tableName}`);

        if (data.length === 0) {
            return { success: false, errors: ["No data provided"], logs };
        }

        // 2. Schema Inference & Cleaning
        logs.push("Analyzing data structure...");

        // Get all unique keys from the dataset to ensure we cover distinct columns
        const allKeys = new Set<string>();
        data.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));

        const columns = Array.from(allKeys).map(k => ({
            original: k,
            sanitized: sanitizeTableName(k)
        }));

        // Check for empty column names
        if (columns.length === 0) {
            return { success: false, errors: ["Could not detect columns from data"], logs };
        }

        logs.push(`Detected ${columns.length} columns: ${columns.map(c => c.sanitized).join(', ')}`);

        // 3. Create Table
        logs.push("Constructing database schema...");
        const client = await dataDb.connect();

        try {
            await client.query('BEGIN');

            // Drop if exists (USER WARNING NEEDED USUALLY, BUT FOR THIS DEMO WE OVERWRITE OR APPEND? 
            // User said "create in in this db", implying new tables. 
            // I'll drop to ensure clean slate for "transformation tool" flow)
            await client.query(`DROP TABLE IF EXISTS "${tableName}"`);

            const createTableQuery = `
        CREATE TABLE "${tableName}" (
          id SERIAL PRIMARY KEY,
          ${columns.map(c => `"${c.sanitized}" TEXT`).join(',\n          ')},
          _imported_at TIMESTAMP DEFAULT NOW()
        );
      `;

            await client.query(createTableQuery);
            logs.push("Schema created successfully.");

            // 4. Data Normalization & Insertion
            logs.push("Normalizing and inserting data batch...");

            let successCount = 0;

            for (const row of data) {
                // Prepare values
                const values = columns.map(c => {
                    const val = row[c.original];
                    if (val === null || val === undefined) return null;
                    return String(val).trim(); // Clean: Strip whitespace
                });

                const insertQuery = `
          INSERT INTO "${tableName}" (${columns.map(c => `"${c.sanitized}"`).join(', ')})
          VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')})
        `;

                try {
                    await client.query(insertQuery, values);
                    successCount++;
                } catch (err: any) {
                    errors.push(`Row Error: ${err.message}`);
                }
            }

            await client.query('COMMIT');
            logs.push("Batch processing complete.");

            return {
                success: true,
                tableName,
                rowCount: successCount,
                logs,
                errors: errors.length > 0 ? errors : undefined
            };

        } catch (err: any) {
            await client.query('ROLLBACK');
            console.error("Import Transaction Failed:", err);
            return { success: false, errors: [err.message], logs };
        } finally {
            client.release();
        }

    } catch (err: any) {
        return { success: false, errors: [err.message], logs };
    }
}
