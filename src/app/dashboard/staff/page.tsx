import { getSession } from '../../../actions/auth';
import { redirect } from 'next/navigation';
import { Building2, Layers, DoorOpen, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

export default async function StaffDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'STAFF') {
        redirect('/dashboard');
    }

    const cards = [
        { title: 'Buildings', icon: Building2, href: '/dashboard/staff/buildings', color: 'bg-blue-500', desc: 'Manage buildings' },
        { title: 'Floors', icon: Layers, href: '/dashboard/staff/floors', color: 'bg-green-500', desc: 'Configure floors' },
        { title: 'Classrooms', icon: DoorOpen, href: '/dashboard/staff/classrooms', color: 'bg-purple-500', desc: 'Assign rooms' },
        { title: 'Floor Locations', icon: MapPin, href: '/dashboard/staff/location', color: 'bg-orange-500', desc: 'Set GPS coordinates' },
    ];

    return (
        <div className="flex-1 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Staff Dashboard</h1>
                <p className="text-gray-500 mb-8">Manage buildings, floors, and classroom locations</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            href={card.href}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                        >
                            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                            <p className="text-gray-500 text-sm">{card.desc}</p>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Quick Setup Guide
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Create a <strong>Building</strong> (e.g., "Main Campus Block A")</li>
                        <li>Add <strong>Floors</strong> to the building (e.g., Floor 1, Floor 2)</li>
                        <li>Set <strong>GPS Location</strong> for each floor (use auto-detect or manual entry)</li>
                        <li>Create <strong>Classrooms</strong> on each floor (e.g., "Room 101")</li>
                        <li>Teachers can now start attendance sessions!</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
