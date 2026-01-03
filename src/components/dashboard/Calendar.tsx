'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Get first day of month (0 = Sunday, adjust for Monday start)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get days from previous month
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const isToday = (day: number) => {
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    // Build calendar grid
    const calendarDays = [];

    // Previous month days
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        calendarDays.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            isToday: false
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: true,
            isToday: isToday(i)
        });
    }

    // Next month days (fill to complete grid)
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= Math.min(remainingDays, 14); i++) {
        calendarDays.push({
            day: i,
            isCurrentMonth: false,
            isToday: false
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={goToPrevMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <h4 className="font-bold text-slate-700">
                    {monthNames[currentMonth]} {currentYear}
                </h4>
                <button
                    onClick={goToNextMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
            <div className="bg-white rounded-2xl p-2">
                <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-medium mb-2">
                    {daysOfWeek.map(day => (
                        <div key={day}>{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 text-center text-sm gap-y-1">
                    {calendarDays.slice(0, 35).map((item, index) => (
                        <div
                            key={index}
                            className={`
                                w-8 h-8 flex items-center justify-center mx-auto rounded-full
                                ${item.isToday ? 'bg-blue-500 text-white font-bold shadow-md' : ''}
                                ${!item.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                                ${item.isCurrentMonth && !item.isToday ? 'hover:bg-gray-100 cursor-pointer' : ''}
                            `}
                        >
                            {item.day}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
