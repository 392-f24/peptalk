import React from 'react';
import { Search, Plus, LogOut } from 'lucide-react';
import { usePepContext } from '../utilities/context';
import { useNavigate } from "react-router-dom";

// Predefined list of emotions/emojis
const EMOTIONS = ['😊', '😢', '😡', '😎', '🤔', '😱', '🥳'];

const ToolBar = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedEmotion, 
  setSelectedEmotion, 
  onCreateNewEntry 
}) => {
  const { user, logout } = usePepContext();
  const navigate = useNavigate();

  const handleSignOut = () => {
    navigate('/');
    logout();
  };

  return (
    <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.displayName || 'User'}
        </h1>
        <button
          onClick={handleSignOut}
          className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
      <div className="flex gap-3 items-center">
        {/* Search Input */}
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

        {/* Emotion Filters */}
        <div className="flex gap-1">
          {EMOTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmotion(selectedEmotion === emoji ? "" : emoji)}
              className={`text-xl p-1.5 rounded-lg hover:bg-gray-100 ${
                selectedEmotion === emoji ? "bg-gray-100" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Create New Entry Button */}
        <button
          onClick={onCreateNewEntry}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <Plus size={16} />
          Create Entry
        </button>
      </div>
    </div>
  );
};

export default ToolBar;