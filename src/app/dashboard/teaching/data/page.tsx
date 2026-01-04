import DataImporter from '@/components/DataImporter';
import { Database, FileText, ArrowRight } from 'lucide-react';

export default function TeachingDataPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                            <Database className="text-[#B9FF66]" size={24} />
                        </div>
                        Academic Data Importer
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-2xl">
                        Upload and process bulk academic data. Use this tool for importing offline attendance records,
                        assignment grades from spreadsheets, or external exam results (OMR data).
                    </p>
                </div>
            </div>

            {/* Teacher Use Cases */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                <div className="min-w-[200px] bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="font-bold text-indigo-900 mb-1">Exam Marks</div>
                    <p className="text-xs text-indigo-700">Import CSVs of student marks for analysis or bulk entry.</p>
                </div>
                <div className="min-w-[200px] bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="font-bold text-purple-900 mb-1">Attendance Logs</div>
                    <p className="text-xs text-purple-700">Upload physical attendance sheets digitized as Excel.</p>
                </div>
                <div className="min-w-[200px] bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="font-bold text-orange-900 mb-1">Project Scores</div>
                    <p className="text-xs text-orange-700">Bulk upload external project evaluation metrics.</p>
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
                <DataImporter />
            </div>
        </div>
    );
}
