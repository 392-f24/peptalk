import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Edit2, Check, XCircle } from 'lucide-react';
import { firebaseJournalService } from '../utilities/EntryFirebaseHelper';
import { usePepContext } from '../utilities/context';

const JournalEntryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = usePepContext();
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntry = async () => {
      if (!user) {

        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Current user:', user);
      console.log('Attempting to load entry with ID:', id);

      try {
        const entryData = await firebaseJournalService.fetchEntry(user.uid, id);
        console.log('Entry data received:', entryData);

        if (entryData) {
          setEntry(entryData);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading entry:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadEntry();
    }
  }, [id, user, navigate, authLoading]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditClick = () => {
    setEditedSummary(entry?.summary || '');
    setIsEditingSummary(true);
  };

  const handleSaveSummary = async () => {
    if (!entry || !user) return;
    
    try {
      await firebaseJournalService.updateEntrySummary(user.uid, id, editedSummary);
      setEntry(prev => ({
        ...prev,
        summary: editedSummary
      }));
      setIsEditingSummary(false);
    } catch (error) {
      console.error('Error updating summary:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!entry || !user) return;
    
    try {
      await firebaseJournalService.deleteEntry(user.uid, id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingSummary(false);
    setEditedSummary('');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading entry...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">Please log in to view this entry.</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">Entry not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-800">{entry.name}</h1>
                <span className="text-2xl">{entry.emoji}</span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(entry.date)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
              >
                <XCircle size={20} />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-700">Summary</h2>
              {!isEditingSummary && (
                <button
                  onClick={handleEditClick}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            {isEditingSummary ? (
              <div className="space-y-3">
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-gray-700"
                  placeholder="Write your summary..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
                  >
                    <XCircle size={16} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveSummary}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                  >
                    <Check size={16} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                {entry.summary}
              </p>
            )}
          </div>

          {/* Transcript Section */}
          <div className="space-y-4">
            <button
              onClick={() => setIsTranscriptVisible(!isTranscriptVisible)}
              className="w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left flex justify-between items-center"
            >
              <span className="font-medium">View Transcript</span>
              <span className="text-gray-400">{isTranscriptVisible ? '−' : '+'}</span>
            </button>

            {isTranscriptVisible && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {entry.transcript.split('\n').map((line, index) => (
                  <p 
                    key={index} 
                    className="text-gray-700 leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryPage;