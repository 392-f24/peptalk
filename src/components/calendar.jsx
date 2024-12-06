import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ 
  currentDate,
  selectedDate,
  entries,
  onDateChange,
  onCreateRecap,
  onViewRecap,
  isCreatingRecap 
}) => {
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const formatDate = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange('month', newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange('month', newDate);
  };

  const handleDayClick = (day) => {
    // If the clicked day is already selected, unselect it (set to null or empty string)
    onDateChange('day', day.date === selectedDate ? '' : day.date);
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );

      const dayEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate.getDate() === day &&
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear()
        );
      });

      const earliestEmoji = dayEntries.length > 0 ? dayEntries[0].emoji : null;

      days.push({
        day,
        date,
        emoji: earliestEmoji,
        entryCount: dayEntries.length
      });
    }

    return days;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = generateCalendarDays();

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-700">
          My Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 mb-1"
          >
            {day[0]}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => day && handleDayClick(day)}
            className={`aspect-square p-1 border rounded ${
              day ? "cursor-pointer hover:bg-gray-50" : ""
            } ${
              day?.date === selectedDate ? "border-blue-500 bg-blue-50" : ""
            }`}
          >
            {day && (
              <div className="h-full flex flex-col justify-between items-center">
                <div className="text-xs text-gray-600">{day.day}</div>
                <div className="mb-1">
                  {day.emoji || ""}
                  {day.entryCount > 1 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{day.entryCount - 1}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='flex flex-row mt-3 gap-2'>
        <button
          onClick={onCreateRecap}
          disabled={isCreatingRecap}
          className={`w-full mt-2 px-4 py-2 text-sm rounded-lg ${
            isCreatingRecap ? "bg-gray-400 text-gray-700" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isCreatingRecap ? 'Creating Recap...' : 'Create Recap'}
        </button>

        <button
          onClick={onViewRecap}
          className="w-full mt-2 px-4 py-2 text-sm border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition"
        >
          View Recap
        </button>
      </div>
    </div>
  );
};

export default Calendar;