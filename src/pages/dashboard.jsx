import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/store";
import { signOut } from "../utilities/firebase_helper";
import Calendar from "../components/calendar";
import EntryCard from "../components/entryCard";
import RecapModal from "./recapModal";

const emotions = ["😊", "😔", "😡", "😌", "🥰", "😤", "😢"];

const Dashboard = () => {
  const { 
    name, 
    entries = [], // Provide default empty array
    recaps = [], // Provide default empty array
    fetchEntries, 
    createEntry, 
    deleteEntry, 
    fetchRecaps, 
    createRecap, 
    deleteRecap 
  } = useStore();
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);
  const [isCreatingRecap, setIsCreatingRecap] = useState(false);
  const [buttonText, setButtonText] = useState("Create Recap");
  const [error, setError] = useState(null);
  const [newEntry, setNewEntry] = useState({
    name: "",
    date: "",
    emoji: "",
    summary: "",
    transcript: "",
  });

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    const savedName = localStorage.getItem("name");
    if (savedUserId) {
      useStore.getState().setUserId(savedUserId);
    }
    if (savedName) {
      useStore.getState().setName(savedName);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchEntries(), fetchRecaps()]);
      } catch (err) {
        setError(err.message);
        console.error("Error loading data:", err);
      } 
    };
    loadData();
  }, [fetchEntries, fetchRecaps]);

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
      await createEntry(
        newEntry.name,
        newEntry.date,
        newEntry.emoji,
        newEntry.summary,
        newEntry.transcript
      );
      setIsModalOpen(false);
      setNewEntry({ name: "", date: "", emoji: "", summary: "", transcript: "" });
    } catch (error) {
      console.error("Error creating entry:", error);
    }
    navigate('/new-entry')
  };

  const handleCreateRecap = async () => {
    try {
      setIsCreatingRecap(true);
      setButtonText("Creating Recap...");
      
      const existingRecap = getRecapForSelectedMonth();
      if (existingRecap) {
        await deleteRecap(existingRecap._id);
      }

      const selectedMonthEntries = entries.filter(
        (entry) =>
          new Date(entry.date).getMonth() === currentDate.getMonth() &&
          new Date(entry.date).getFullYear() === currentDate.getFullYear()
      );

      await createRecap(selectedMonthEntries, currentDate);
      
      setButtonText("Done!");
      setTimeout(() => {
        setButtonText("Create Recap");
      }, 1500);
    } catch (error) {
      console.error("Error creating recap:", error);
      setButtonText("Create Recap");
    } finally {
      setIsCreatingRecap(false);
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

  const filteredEntries = entries
    .filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmotion = selectedEmotion
        ? entry.emoji === selectedEmotion
        : true;
      const matchesDate = selectedDate
        ? new Date(entry.date).toDateString() ===
          new Date(selectedDate).toDateString()
        : true;

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
        <div className="flex justify-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            {name ? `${name}'s PepTalk` : "PepTalk"}
          </h1>
        </div>

        <div className="flex-row sm:flex gap-6">
          <div className="w-2/5">
            <Calendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              entries={entries}
              onPreviousMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              onDayClick={(day) => setSelectedDate(selectedDate === day.date ? null : day.date)}
              onCreateRecap={handleCreateRecap}
              onViewRecap={() => setIsRecapModalOpen(true)}
              isCreatingRecap={isCreatingRecap}
              buttonText={buttonText}
            />
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
                    onClick={() => setSelectedEmotion(selectedEmotion === emoji ? "" : emoji)}
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
                  <EntryCard 
                    key={entry._id} 
                    entry={entry} 
                    onDelete={deleteEntry}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Recap */}
      {isRecapModalOpen && (
        <RecapModal 
          isOpen={isRecapModalOpen}
          onClose={() => setIsRecapModalOpen(false)}
          selectedMonthRecap={getRecapForSelectedMonth()}
          onDeleteRecap={deleteRecap}
        />)}

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