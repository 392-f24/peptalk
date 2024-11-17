import React from 'react';

const EntryCard = ({ entry, onDelete }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
      <button
        onClick={() => onDelete(entry._id)}
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
            <span>{new Date(entry.date).toLocaleDateString()}</span>
            <span className="text-lg">{entry.emoji}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden text-ellipsis whitespace-nowrap">
        {entry.summary}
      </p>
    </div>
  );
};

export default EntryCard;