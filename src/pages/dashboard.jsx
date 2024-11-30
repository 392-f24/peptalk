import React, { useState, useCallback, useMemo } from 'react';
import { usePepContext } from '../utilities/context';
import Calendar from '../components/calendar';
import EntryCard from '../components/entryCard';
import ToolBar from '../components/toolbar';
import { useNavigate } from 'react-router-dom';
import { firebaseJournalService } from '../utilities/EntryFirebaseHelper';

const Dashboard = () => {
  const { user,userEntries = [], loading, error, deleteEntry } = usePepContext();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreatingRecap, setIsCreatingRecap] = useState(false);
  
  // New state for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');

  const handleDateChange = useCallback((type, date) => {
    if (type === 'month') {
      setCurrentDate(date);
    } else if (type === 'day') {
      setSelectedDate(date);
    }
  }, []);

  const handleCreateRecap = async () => {
    setIsCreatingRecap(true);
    try {
      // Implement recap creation logic using context
    } catch (error) {
      console.error('Error creating recap:', error);
    } finally {
      setIsCreatingRecap(false);
    }
  };

  const handleViewRecap = useCallback(() => {
    // Implement recap viewing logic using context
  }, []);


  const handleDeleteEntry = async (entry) => {
    if (!entry || !user) return;
    
    try {
      await firebaseJournalService.deleteEntry(user.uid, entry);
      navigate('/');
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };  

  // const handleDeleteEntry = async (entryId) => {
  //   if (!deleteEntry) return;
    
  //   try {
  //     await deleteEntry(entryId);
  //   } catch (error) {
  //     console.error('Error deleting entry:', error);
  //   }
  // };

  // Filtered and searched entries
  const filteredEntries = useMemo(() => {
    if (!Array.isArray(userEntries)) return [];

    return userEntries.filter(entry => {
      if (!entry) return false;

      // If no date is selected, show all entries
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading entries: {error.message || error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <ToolBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedEmotion={selectedEmotion}
        setSelectedEmotion={setSelectedEmotion}
        onCreateNewEntry={handleCreateNewEntry}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
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
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={() => handleDeleteEntry(entry.id)}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm">
                <p className="text-lg">No entries found</p>
                <p className="mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;