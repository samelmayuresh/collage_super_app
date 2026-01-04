import DataImporter from '@/components/DataImporter';
import { Database, FolderArchive, ArrowRight } from 'lucide-react';

export default function OfficeDataPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                            <Database className="text-[#B9FF66]" size={24} />
                        </div>
                        Administrative Data Engine
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-2xl">
                        Securely import and normalize administrative records. Ideal for processing bulk admissions,
                        reconciling fee payments from bank statements, and updating student registries.
                    </p>
                </div>
            </div>

            {/* Office Use Cases */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                <div className="min-w-[200px] bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="font-bold text-green-900 mb-1">Fee Reconciliation</div>
                    <p className="text-xs text-green-700">Upload bank transaction CSVs to verify payments.</p>
                </div>
                <div className="min-w-[200px] bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="font-bold text-blue-900 mb-1">Bulk Admissions</div>
                    <p className="text-xs text-blue-700">Import student lists from DTE/Government portals.</p>
                </div>
                <div className="min-w-[200px] bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="font-bold text-amber-900 mb-1">Scholarship Data</div>
                    <p className="text-xs text-amber-700">Load beneficiary lists for audit and tracking.</p>
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
                <DataImporter />
            </div>
        </div>
    );
}
