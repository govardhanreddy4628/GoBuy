import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { formatTime, parseISODate } from "../utils/dateUtils";
import type { CalendarEvent } from "../types/calendar";
import { GET } from "../../../api/api_utility";
import { getUpcomingEvents } from "../services/calendarService";

type SidebarProps = {
  handleNewEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
};
const Sidebar: React.FC<SidebarProps> = ({ handleNewEvent, onEventClick }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    

    useEffect(() => {
        const loadUpcoming = async () => {
            try {
                const data = await getUpcomingEvents(5);
                setEvents(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadUpcoming();
    }, []);


    return (
        <aside className="w-72 border-r bg-white flex flex-col h-full">

            {/* Top Button */}
            <div className="p-4 border-b">
                <button
                    onClick={handleNewEvent}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Event
                </button>
            </div>

            {/* Upcoming Section */}
            <div className="p-4 flex-1 overflow-y-auto">
                <h4 className="font-semibold text-gray-800 mb-3">Upcoming</h4>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : events.length === 0 ? (
                    <p className="text-sm text-gray-500">No upcoming events</p>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={event._id}
                                onClick={() => onEventClick(event)}
                                className="p-3 rounded-lg border hover:shadow-md transition cursor-pointer" 
                            >
                                {/* Title */}
                                <div className="font-medium text-sm text-gray-900">
                                    {event.title}
                                </div>

                                {/* Time */}
                                <div className="text-xs text-gray-500 mt-1">
                                    🕒 {formatTime(parseISODate(event.start_time))}
                                </div>

                                {/* Type + Priority */}
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full text-white"
                                        style={{ backgroundColor: event.color }}
                                    >
                                        {event.event_type}
                                    </span>

                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                        {event.priority}
                                    </span>
                                </div>

                                {/* Location */}
                                {event.location && (
                                    <div className="text-xs text-gray-400 mt-2">
                                        📍 {event.location}
                                    </div>
                                )}

                                {/* Status */}
                                <div className="text-[10px] mt-2 text-gray-500">
                                    Status: {event.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;