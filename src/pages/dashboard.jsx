import React, { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import useStore from "../store/store"; 
import { useNavigate } from "react-router-dom";
import { signOut } from "../utilities/firebase_helper";

const emotions = ["😊", "😔", "😡", "😌", "🥰", "😤", "😢"];

const Dashboard = () => {
  const { entries, recaps, fetchEntries, createEntry, deleteEntry, fetchRecaps, createRecap, deleteRecap } = useStore();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false); // State for Recap Modal
  const [newEntry, setNewEntry] = useState({
    name: "",
    date: "",
    emoji: "",
    summary: "",
    transcript: "",
  });

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      useStore.getState().setUserId(savedUserId); 
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchRecaps();
    console.log(recaps[0])
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(); 
      localStorage.removeItem("userId");
      useStore.getState().setUserId(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCreateEntry = async () => {
    try {
      await createEntry(newEntry.name, newEntry.date, newEntry.emoji, newEntry.summary, newEntry.transcript);
      setIsModalOpen(false); 
      setNewEntry({ name: "", date: "", emoji: "", summary: "", transcript: "" });
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await deleteEntry(entryId); // Call deleteEntry from Zustand
      console.log(`Entry with ID ${entryId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const getRecapForSelectedMonth = () => {
    return recaps.find((recap) => {
      const recapDate = new Date(recap.month);
      return (
        recapDate.getUTCMonth() === currentDate.getUTCMonth() &&
        recapDate.getUTCFullYear() === currentDate.getUTCFullYear()
      );
    });
  };

  const handleCreateRecap = async () => {
    try {
      const existingRecap = getRecapForSelectedMonth();
  
      if (existingRecap) {
        console.log("Deleting existing recap for the month:", existingRecap);
        await deleteRecap(existingRecap._id);
      }
  
      const selectedMonthEntries = entries.filter(
        (entry) =>
          new Date(entry.date).getMonth() === currentDate.getMonth() &&
          new Date(entry.date).getFullYear() === currentDate.getFullYear()
      );
  
      await createRecap(selectedMonthEntries, currentDate);
  
      console.log("Recap created successfully!");
    } catch (error) {
      console.error("Error creating recap:", error);
    }
  };
  
  const selectedMonthRecap = getRecapForSelectedMonth();
  const handleViewRecap = () => {
    if (selectedMonthRecap) {
      setIsRecapModalOpen(true);
    } else {
      console.log("No recap found for the selected month");
    }
  };
  

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
      const entry = entries.find((e) => e.date === date);
      days.push({ day, date, entry });
    }

    return days;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = generateCalendarDays();

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
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
    .filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmotion = selectedEmotion
        ? entry.emoji === selectedEmotion
        : true;
      const matchesDate = selectedDate ? entry.date === selectedDate : true;

      return matchesSearch && matchesEmotion && matchesDate;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign Out
      </button>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">
            PepTalk Journal
          </h1>
        </div>

        <div className="flex-row sm:flex gap-6">
          <div className="w-2/5 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">
                Emotional Journey
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={previousMonth}
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
                  onClick={nextMonth}
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
                  className={`aspect-square p-1 border rounded cursor-pointer ${
                    day ? "hover:bg-gray-50" : ""
                  } ${
                    day?.date === selectedDate
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  {day && (
                    <div className="h-full flex flex-col justify-between">
                      <div className="text-xs text-gray-600">{day.day}</div>
                      <div className="text-base flex justify-center">
                        {day.entry?.emoji || ""}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Create Recap Button */}
            <button
              onClick={handleCreateRecap}
              className="w-full mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Create Recap
            </button>

            {/* View Recap Button */}
            <button
              onClick={handleViewRecap}
              className="w-full mt-2 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              View Recap
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search entries..."
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-1">
                {emotions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() =>
                      setSelectedEmotion(selectedEmotion === emoji ? "" : emoji)
                    }
                    className={`text-xl p-1.5 rounded hover:bg-gray-100 ${
                      selectedEmotion === emoji ? "bg-gray-100" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition ml-3"
              >
                + Create Entry
              </button>
            </div>

            <div className="space-y-3 h-[510px] overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No entries found for the selected filters
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    {/* Delete Icon */}
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Delete Entry"
                    >
                      ✖️
                    </button>

                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 truncate">
                          {entry.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <span>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span className="text-lg">{entry.emoji}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      {entry.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Recap */}
      {isRecapModalOpen && selectedMonthRecap && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">{selectedMonthRecap.recapName}</h3>
            
            <p className="mb-2">
              <strong>Month:</strong>{" "}
              {new Date(selectedMonthRecap.month).toLocaleString("default", {
                month: "long",
                year: "numeric",
                timeZone: "UTC", // Ensure the correct month is displayed
              })}
            </p>


            <p className="mb-2">
              <strong>Mood Summary:</strong> {JSON.stringify(selectedMonthRecap.moodSummary)}
            </p>

            <p className="mb-2">
              <strong>Total Entries:</strong> {selectedMonthRecap.totalEntries}
            </p>

            <p className="mb-2">
              <strong>Favorite Day:</strong>{" "}
              {new Date(selectedMonthRecap.favoriteDay.date).toLocaleDateString()} -{" "}
              {selectedMonthRecap.favoriteDay.description}
            </p>

            <p className="mb-4">
              <strong>Summary:</strong> {selectedMonthRecap.summary}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setIsRecapModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-medium mb-4">Create New Entry</h3>
            <input
              type="text"
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded"
              value={newEntry.name}
              onChange={(e) =>
                setNewEntry({ ...newEntry, name: e.target.value })
              }
            />
            <input
              type="date"
              className="w-full mb-2 p-2 border rounded"
              value={newEntry.date}
              onChange={(e) =>
                setNewEntry({ ...newEntry, date: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Emoji"
              className="w-full mb-2 p-2 border rounded"
              value={newEntry.emoji}
              onChange={(e) =>
                setNewEntry({ ...newEntry, emoji: e.target.value })
              }
            />
            <textarea
              placeholder="Summary"
              className="w-full mb-2 p-2 border rounded"
              value={newEntry.summary}
              onChange={(e) =>
                setNewEntry({ ...newEntry, summary: e.target.value })
              }
            />
            <textarea
              placeholder="Transcript"
              className="w-full mb-2 p-2 border rounded"
              value={newEntry.transcript}
              onChange={(e) =>
                setNewEntry({ ...newEntry, transcript: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
