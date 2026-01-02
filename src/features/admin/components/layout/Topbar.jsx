import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, UserCircle2, LogOut, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import logo from "../../assets/logo.png";

const Topbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { projects, employees, tasks } = useApp();
  const user = JSON.parse(localStorage.getItem("user"));

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQ = query.toLowerCase();

    // Limit results to 3 per category to avoid clutter
    const matchedProjects = projects
      .filter(p => (p.name || "").toLowerCase().includes(lowerQ) || (p.projectId || "").toLowerCase().includes(lowerQ))
      .slice(0, 3)
      .map(p => ({ type: "Project", label: p.name, sub: p.projectId, id: p.projectId, path: "/projects" }));

    const matchedEmployees = employees
      .filter(e => (e.name || "").toLowerCase().includes(lowerQ))
      .slice(0, 3)
      .map(e => ({ type: "Employee", label: e.name, sub: e.role, id: e.id, path: "/employees" }));

    const matchedTasks = tasks
      .filter(t => (t.title || "").toLowerCase().includes(lowerQ))
      .slice(0, 3)
      .map(t => ({ type: "Task", label: t.title, sub: t.status, id: t.id, path: "/tasks" }));

    setResults([...matchedProjects, ...matchedEmployees, ...matchedTasks]);
  }, [query, projects, employees, tasks]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSelect = (item) => {
    // Navigate to page with search query to pre-filter
    navigate(`${item.path}?q=${encodeURIComponent(item.label)}`);
    setQuery("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6
      border-b border-slate-200 bg-white shadow-sm sticky top-0 z-40">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1 rounded-lg border border-slate-200"
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>

        <img
          src={logo}
          alt="Cookscape Logo"
          className="h-12 w-auto object-contain hidden md:block" // Hide text logo on small screens if needed
        />
      </div>

      {/* CENTER - GLOBAL SEARCH */}
      <div className="hidden md:block flex-1 max-w-lg mx-6 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search projects, tasks, employees..."
            className="w-full pl-10 pr-10 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 rounded-xl transition text-sm outline-none"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Typeahead Results */}
        {showResults && query && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-2">
            <p className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-50 uppercase tracking-wider">
              Best Matches
            </p>
            {results.map((item, i) => (
              <div
                key={i}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.type} • {item.sub}</p>
                </div>
                <span className="text-xs text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  Go to {item.type} →
                </span>
              </div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {showResults && query && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-4 text-center">
            <p className="text-sm text-slate-500">No results found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Right Side Buttons */}
      <div className="flex items-center gap-5">
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition">
          <Bell size={20} className="text-slate-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-brand-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2">
          <UserCircle2 size={28} className="text-slate-700" />
          <span className="text-sm font-medium hidden sm:block">{user?.name || "Super Admin"}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm px-3 py-2 border border-slate-300 rounded-md
           hover:bg-red-500 hover:text-white hover:border-red-500 transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
