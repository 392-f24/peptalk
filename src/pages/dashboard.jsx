import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { usePepContext } from '../utilities/context';
import Calendar from '../components/calendar';
import EntryCard from '../components/entryCard';
import ToolBar from '../components/toolbar';
import RecapModal from './recapModal';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, 
    userEntries = [], 
    loading, 
    error, 
    fetchEntries, 
    recaps, 
    createRecap, 
    fetchRecaps, 
    deleteRecap 
  } = usePepContext();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [isRecapModalOpen, setIsRecapModalOpen] = useState(false)
  const [isCreatingRecap, setIsCreatingRecap] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchRecaps();
    }
  }, [user]);

  const handleDateChange = useCallback((type, date) => {
    if (type === 'month') {
      setCurrentDate(date);
    } else if (type === 'day') {
      setSelectedDate(date);
    }
  }, []);

  const handleCreateRecap = async () => {
    setIsCreatingRecap(true)
    try {
      const currentMonthEntries = userEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        return (
          entryDate.getMonth() === currentDate.getMonth() &&
          entryDate.getFullYear() === currentDate.getFullYear()
        )
      })

      const recapMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
      await createRecap(currentMonthEntries, recapMonth)
    } catch (error) {
      console.error('Error creating recap:', error)
    } finally {
      setIsCreatingRecap(false)
    }
  }

  const handleViewRecap = () => {
    setIsRecapModalOpen(true)
  }

  const filteredEntries = useMemo(() => {
    if (!Array.isArray(userEntries)) return [];

    return userEntries.filter(entry => {
      if (!entry) return false;
      const matchesSelectedDate = !selectedDate || 
        new Date(entry.date).toISOString().split('T')[0] === selectedDate;
      const matchesSearch = !searchTerm || 
        (entry.name && entry.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.summary && entry.summary.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesEmotion = !selectedEmotion || entry.emoji === selectedEmotion;
      return matchesSelectedDate && matchesSearch && matchesEmotion;
    });
  }, [userEntries, searchTerm, selectedEmotion, selectedDate]);

  const handleCreateNewEntry = () => {
    navigate('/entry')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 bg-slate-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading entries: {error.message || error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div>
          <ToolBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedEmotion={selectedEmotion}
            setSelectedEmotion={setSelectedEmotion}
            onCreateNewEntry={handleCreateNewEntry}
          />
        </div>
        <RecapModal
        isOpen={isRecapModalOpen}
        onClose={() => setIsRecapModalOpen(false)}
        selectedMonth={currentDate}
        recaps={recaps}
        onDeleteRecap={async () => {
          await deleteRecap()
          setIsRecapModalOpen(false)
        }}
      />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Thought of the day</p>
                    <p className="text-slate-600 italic">
                      "Each day is a new beginning, a chance to reflect and grow."
                    </p>
                  </div>
                </div>
              </div>
                <Calendar
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  entries={userEntries}
                  onDateChange={handleDateChange}
                  onCreateRecap={handleCreateRecap}
                  onViewRecap={handleViewRecap}
                  isCreatingRecap={isCreatingRecap}
                />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-4 overflow-y-auto md:max-h-[62vh] pr-2">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="transition-transform duration-200 hover:-translate-y-0.5">
                    <EntryCard entry={entry} />
                  </div>
                ))
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
                  <p className="text-lg text-slate-600">Take a moment to reflect...</p>
                  <p className="mt-2 text-slate-500">Your thoughts are waiting to be captured</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;