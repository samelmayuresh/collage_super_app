import { getSession } from '../../../actions/auth';
import { getEvents } from '../../../actions/events';
import { Calendar, MapPin, Clock, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { EventDescription } from '../../../components/dashboard/EventDescription';

const eventTypeColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-700',
    academic: 'bg-blue-100 text-blue-700',
    sports: 'bg-green-100 text-green-700',
    cultural: 'bg-purple-100 text-purple-700',
    workshop: 'bg-orange-100 text-orange-700',
};

export default async function EventsPage() {
    const session = await getSession();

    // Redirect if not logged in
    if (!session || !session.id) {
        return <div className="p-8 text-center">Please log in to view events.</div>;
    }

    const { events, error } = await getEvents();

    if (error) {
        return <div className="p-8 text-red-500">Error loading events: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/dashboard/${session.role.toLowerCase()}`}
                        className="p-2 bg-white hover:bg-gray-50 rounded-xl shadow-sm border transition-colors"
                    >
                        <ArrowLeft className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                            <Calendar className="text-violet-600" size={32} /> All Events
                        </h1>
                        <p className="text-gray-500 mt-1">Browse all upcoming college events and activities</p>
                    </div>
                </div>

                {/* Events Grid */}
                {events && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event: any) => (
                            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                                {/* Badges */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${eventTypeColors[event.event_type] || eventTypeColors.general}`}>
                                        {event.event_type.toUpperCase()}
                                    </span>
                                    {event.is_mandatory && (
                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                                            Required
                                        </span>
                                    )}
                                </div>

                                {/* Image */}
                                {event.images && event.images.length > 0 && (
                                    <div className="h-48 mb-4 rounded-xl overflow-hidden bg-gray-100">
                                        <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}


                                {/* Title & Desc */}
                                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{event.title}</h3>
                                <EventDescription text={event.description} />

                                {/* Links */}
                                {event.links && event.links.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {event.links.map((link: any, i: number) => (
                                            <a
                                                key={i}
                                                href={link.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <Tag size={12} /> {link.title}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Meta Info */}
                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <div className="p-2 bg-gray-50 rounded-lg text-violet-500">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(event.start_date).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-xs">
                                                {new Date(event.start_date).toLocaleTimeString('en-US', {
                                                    hour: 'numeric', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {event.location && (
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="p-2 bg-gray-50 rounded-lg text-blue-500">
                                                <MapPin size={16} />
                                            </div>
                                            <span className="font-medium">{event.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No events found</h3>
                        <p className="text-gray-500">Check back later for updates</p>
                    </div>
                )}
            </div>
        </div>
    );
}
