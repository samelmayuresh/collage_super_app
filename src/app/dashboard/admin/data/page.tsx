import DataImporter from '@/components/DataImporter';
import { Database, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function DataTransformationPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg">
                            <Database className="text-[#B9FF66]" size={24} />
                        </div>
                        Data Transformation Engine
                    </h1>
                    <p className="text-gray-500 mt-2 max-w-2xl">
                        Intelligent automation sequence that cleans, normalizes, and ingests raw data
                        into structured database tables. Supports CSV and Excel formats.
                    </p>
                </div>
            </div>

            {/* Steps Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                        <h3 className="font-bold">Upload Source</h3>
                        <p className="text-xs text-gray-400">CSV or Excel files</p>
                    </div>
                    <ArrowRight className="ml-auto text-gray-300" size={16} />
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                        <h3 className="font-bold">Python Processing</h3>
                        <p className="text-xs text-gray-400">Clean, Validate, Normalize</p>
                    </div>
                    <ArrowRight className="ml-auto text-gray-300" size={16} />
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                        <h3 className="font-bold">Database Ready</h3>
                        <p className="text-xs text-gray-400">Structured SQL Tables</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
                <DataImporter />
            </div>
        </div>
    );
}
