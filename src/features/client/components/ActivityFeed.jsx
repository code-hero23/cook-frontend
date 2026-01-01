import React from "react";

const formatDateTime = (isoString) => {
  return new Date(isoString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const ActivityFeed = ({ activity, dummyActivity }) => {

  // Merge: dynamic logs (top) + dummy logs (bottom)
  const mergedActivity = [...activity, ...dummyActivity];

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-semibold mb-4">Activity Feed</h2>

      {mergedActivity.length === 0 && (
        <p className="text-gray-500 text-sm">No activity yet.</p>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {mergedActivity.map((log) => (
          <div key={log.id} className="border-b pb-3">
            <p className="font-medium">{log.message}</p>
            <p className="text-xs text-gray-500">
              {formatDateTime(log.time)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
