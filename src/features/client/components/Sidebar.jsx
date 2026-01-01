import React from "react";

const Sidebar = ({ selected, setSelected }) => {
  const menu = [
    { id: "overview", label: "Project Overview" },
    { id: "profile", label: "Profile" },
    { id: "tasks", label: "Project Stages" },
    { id: "activity", label: "Activity Feed" },
    { id: "gallery", label: "Site Images" },
    { id: "timeline", label: "Project Timeline" },
    { id: "documents", label: "Project Documents" },
    { id: "feedback", label: "Raise Ticket" },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 py-6 bg-white">

      {/* Title instead of logo (logo already in TopNavbar) */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Client Panel
      </h2>

      {/* Menu Items */}
      <div className="space-y-3">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm md:text-base font-medium transition duration-200 
            
            ${selected === item.id
                ? "bg-indigo-600 text-white shadow"
                : "bg-gray-50 hover:bg-indigo-50 text-gray-700"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

    </div>
  );
};

export default Sidebar;
