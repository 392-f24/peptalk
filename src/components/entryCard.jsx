import React from 'react';
import { useNavigate } from 'react-router-dom';

const EntryCard = ({ entry }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (e.target.closest('button[data-delete]')) {
      return;
    }
    navigate(`/entry/${entry.id}`);
  };
  
  const formatDate = (dateString) => { 

    const cstOffset = 6 * 60 * 60 * 1000;
     
    const date = new Date(new Date(dateString).getTime() + cstOffset);
    
    return date.toLocaleDateString('en-US', { 
    }); 
  };

  return (
    <div 
      onClick={handleClick} 
      className="bg-white rounded-lg p-6 shadow-sm hover:border-blue-500 cursor-pointer transition-shadow relative border border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-gray-800 truncate">
              {entry.name}
            </h3>
            <span className="text-lg">{entry.emoji}</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(entry.date)}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">
        {entry.summary}
      </p>
    </div>
  );
};

export default EntryCard;