import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({
  currentDate,
  selectedDate,
  entries,
  onPreviousMonth,
  onNextMonth,
  onDayClick,
  onCreateRecap,
  onViewRecap,
  isCreatingRecap,
  buttonText
}) => {
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const formatDate = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

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
      });
    }

    return days;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = generateCalendarDays();

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-700">
          Emotional Journey
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousMonth}
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
            onClick={onNextMonth}
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
            onClick={() => day && onDayClick(day)}
            className={`aspect-square p-1 border rounded cursor-pointer ${
              day ? "hover:bg-gray-50" : ""
            } ${
              day?.date === selectedDate ? "border-blue-500 bg-blue-50" : ""
            }`}
          >
            {day && (
              <div className="h-full flex flex-col justify-between items-center">
                <div className="text-xs text-gray-600">{day.day}</div>
                <div className="mb-1">{day.emoji || ""}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onCreateRecap}
        disabled={isCreatingRecap}
        className={`w-full mt-4 px-4 py-2 text-sm rounded transition ${
          isCreatingRecap ? "bg-gray-400 text-gray-700" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {buttonText}
      </button>

      <button
        onClick={onViewRecap}
        className="w-full mt-2 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        View Recap
      </button>
    </div>
  );
};

export default Calendar;