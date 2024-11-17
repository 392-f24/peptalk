import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Entry from './pages/entry';
import { Search, BookmarkPlus, BookmarkCheck, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';

const sampleJournalEntries = [
  {
    id: 1,
    title: "Morning Reflection",
    date: "2024-11-11",
    content: "Today started with a peaceful meditation session. I felt centered and ready to take on the day's challenges. The morning sunshine through my window really lifted my spirits.",
    emotion: "😊",
    bookmarked: false
  },
  {
    id: 2,
    title: "Challenging Afternoon",
    date: "2024-11-10",
    content: "Work was particularly stressful today. Had a difficult meeting but managed to stay composed. Learning to handle pressure better but still feeling the weight of responsibilities.",
    emotion: "😔",
    bookmarked: true
  },
  {
    id: 3,
    title: "Evening Breakthrough",
    date: "2024-11-08",
    content: "Finally solved that coding problem I've been stuck on for days! The satisfaction of figuring it out made my whole week better.",
    emotion: "🥰",
    bookmarked: false
  },
];

const emotions = ["😊", "😔", "😡", "😌", "🥰", "😤", "😢"];

const Dashboard = () => {
  const [entries, setEntries] = useState(sampleJournalEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
      const entry = entries.find(e => e.date === date);
      days.push({
        day,
        date,
        entry
      });
    }

    return days;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = generateCalendarDays();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDate(selectedDate === day.date ? null : day.date);
    setSearchTerm("");
    setSelectedEmotion("");
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSearchTerm("");
    setSelectedEmotion("");
  };

  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmotion = selectedEmotion ? entry.emotion === selectedEmotion : true;
      const matchesDate = selectedDate ? entry.date === selectedDate : true;
      
      return matchesSearch && matchesEmotion && matchesDate;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const toggleBookmark = (id) => {
    setEntries(entries.map(entry =>
      entry.id === id ? { ...entry, bookmarked: !entry.bookmarked } : entry
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">PepTalk Journal</h1>
          <Link 
            to="/new-entry" 
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus size={24} />
          </Link>
        </div>

        <div className="flex-row sm:flex gap-6">
          {/* Emotional Calendar */}
          <div className="w-2/5 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Emotional Journey</h2>
              <div className="flex items-center gap-2">
                <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 mb-1">
                  {day[0]}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day && handleDayClick(day)}
                  className={`aspect-square p-1 border rounded cursor-pointer 
                    ${day ? 'hover:bg-gray-50' : ''}
                    ${day?.date === selectedDate ? 'border-blue-500 bg-blue-50' : ''}`}
                >
                  {day && (
                    <div className="h-full flex flex-col justify-between">
                      <div className="text-xs text-gray-600">{day.day}</div>
                      <div className="text-base flex justify-center">
                        {day.entry?.emotion || ''}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search and Entries Section */}
          <div className="flex-1 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search entries..."
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1">
                {emotions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmotion(selectedEmotion === emoji ? "" : emoji)}
                    className={`text-xl p-1.5 rounded hover:bg-gray-100 ${
                      selectedEmotion === emoji ? "bg-gray-100" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {(selectedDate || searchTerm || selectedEmotion) && (
                <button
                  onClick={clearFilters}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                  title="Clear all filters"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Journal Entries */}
            <div className="space-y-3">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No entries found for the selected filters
                </div>
              ) : (
                filteredEntries.map(entry => (
                  <div key={entry.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{entry.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                          <span className="text-lg">{entry.emotion}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBookmark(entry.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {entry.bookmarked ? (
                          <BookmarkCheck size={16} />
                        ) : (
                          <BookmarkPlus size={16} />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-entry" element={<Entry />} />
      </Routes>
    </Router>
  );
};

export default App;