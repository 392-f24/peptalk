import React from 'react';

const MoodSummaryBar = ({ emoji, count, maxCount }) => {
  const percentage = (count / maxCount) * 100;
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 text-center text-lg">{emoji}</div>
      <div className="flex-1">
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-200 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="w-8 text-sm font-medium text-gray-600">{count}</div>
    </div>
  );
};

const RecapModal = ({ 
  isOpen, 
  onClose, 
  selectedMonthRecap, 
  onDeleteRecap 
}) => {
  if (!isOpen) return null;

  const formatMoodSummary = (moodSummary) => {
    if (!moodSummary || typeof moodSummary !== 'object') return [];
    
    const entries = Object.entries(moodSummary);
    const maxCount = Math.max(...entries.map(([_, count]) => count));
    
    return entries.sort((a, b) => b[1] - a[1])  // Sort by count in descending order
      .map(([emoji, count]) => ({
        emoji,
        count,
        maxCount
      }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900/75 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-screen-md shadow-2xl relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {selectedMonthRecap ? (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800">{selectedMonthRecap.recapName}</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-4">MOOD DISTRIBUTION</h4>
                <div className="space-y-2">
                  {formatMoodSummary(selectedMonthRecap.moodSummary).map((mood) => (
                    <MoodSummaryBar 
                      key={mood.emoji}
                      emoji={mood.emoji}
                      count={mood.count}
                      maxCount={mood.maxCount}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[max-content_1fr] gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-600 mb-1">Total Entries</h4>
                  <p className="text-4xl font-bold text-blue-700">{selectedMonthRecap.totalEntries}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex flex-row justify-between">
                    <h4 className="text-sm font-semibold text-green-600 mb-1">Best Day</h4>
                    <p className="text-sm font-medium text-green-600">
                        {new Date(selectedMonthRecap.favoriteDay.date).toLocaleDateString()}
                    </p>
                </div>
                  <div className="pt-2">
                    <p className="text-sm text-green-900">
                    {selectedMonthRecap.favoriteDay.description}
                    </p>
                </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">MONTHLY SUMMARY</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedMonthRecap.summary}
                </p>
              </div>

            </div>

            <div className="pt-4">
              <button
                onClick={async () => {
                  await onDeleteRecap(selectedMonthRecap._id);
                  onClose();
                }}
                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
              >
                Delete Recap
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Recap Yet!</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              Looks like you haven't created a recap for this month yet. Go ahead and create one to reflect on your month in a meaningful way!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecapModal;