import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Edit2, Check, XCircle } from 'lucide-react';

const JournalEntryPage = () => {
  const navigate = useNavigate();
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  
  // Mock data - would come from Firebase later
  const [entry, setEntry] = useState({
    id: "1",
    title: "My First Journal Entry",
    date: "2024-11-17",
    summary: "A productive day filled with accomplishments and positive energy. Completed all tasks and enjoyed some time outdoors.",
    transcript: [
      "I had a really productive day today. Got everything done on my list.",
      "It feels great! I even had time for a walk in the park.",
      "The weather was perfect and I got to enjoy some fresh air."
    ],
    emotion: "😊"
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditClick = () => {
    setEditedSummary(entry.summary);
    setIsEditingSummary(true);
  };

  const handleSaveSummary = () => {
    setEntry(prev => ({
      ...prev,
      summary: editedSummary
    }));
    setIsEditingSummary(false);
    // Here you would update Firebase with the new summary
  };

  const handleCancelEdit = () => {
    setIsEditingSummary(false);
    setEditedSummary('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Content */}
        <div className="bg-white rounded-lg p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-800">{entry.title}</h1>
                <span className="text-2xl">{entry.emotion}</span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(entry.date)}
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
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
                {entry.transcript.map((line, index) => (
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