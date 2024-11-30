import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Calendar from '../components/calendar';
import EntryCard from '../components/entryCard';
import useStore from '../store/store';
import { signOut } from '../utilities/firebase_helper';

const emotions = ["😊", "😔", "😡", "😌", "🥰", "😤", "😢"];

const Dashboard = () => {
  const navigate = useNavigate();
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

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false);
  const [isCreatingRecap, setIsCreatingRecap] = useState(false);
  const [buttonText, setButtonText] = useState("Create Recap");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Restore user data from localStorage
        const savedUserId = localStorage.getItem("userId");
        const savedName = localStorage.getItem("name");
        if (savedUserId) {
          useStore.getState().setUserId(savedUserId);
        }
        if (savedName) {
          useStore.getState().setName(savedName);
        }
        
        // Fetch entries and recaps
        await Promise.all([fetchEntries(), fetchRecaps()]);
      } catch (err) {
        setError(err.message);
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchEntries, fetchRecaps]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem("userId");
      useStore.getState().setUserId(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  // Recap handlers
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
      setError("Failed to create recap. Please try again.");
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

  // Filter entries based on search, emotion, and date
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    
    return entries
      .filter((entry) => {
        const matchesSearch =
          entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.summary?.toLowerCase().includes(searchTerm.toLowerCase());
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
  }, [entries, searchTerm, selectedEmotion, selectedDate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try reloading the page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign Out
      </button>
      
      <div className="sm:max-w-6xl mx-auto space-y-6">
        <div className="flex justify-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            {name ? `${name}'s PepTalk` : "PepTalk"}
          </h1>
        </div>

        <div className="flex-row sm:flex gap-6">
          <div className="w-full sm:w-2/5">
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

          <div className="flex-1 w-full sm:w-2/5">
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
                onClick={() => navigate('/new-entry')}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition ml-3"
              >
                + Create Entry
              </button>
            </div>

            <div className="space-y-3 h-[510px] overflow-y-auto mt-4">
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
        />
      )}
    </div>
  );
};

export default Dashboard;