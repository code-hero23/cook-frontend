import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Upload, X, FileText, Image as ImageIcon, Send, Filter, ChevronDown, ChevronUp } from "lucide-react";

const RaiseTicket = () => {
  // Form state
  const [issue, setIssue] = useState("");
  const [email, setEmail] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Support");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest First");
  const [expandedTicket, setExpandedTicket] = useState(null);

  // Load tickets from localStorage on mount
  useEffect(() => {
    const savedTickets = localStorage.getItem("supportTickets");
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    }
  }, []);

  // Save tickets to localStorage whenever they change
  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem("supportTickets", JSON.stringify(tickets));
    }
  }, [tickets]);

  const priorityColors = {
    Low: "bg-green-100 text-green-700 border-green-300",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    High: "bg-orange-100 text-orange-700 border-orange-300",
    Urgent: "bg-red-100 text-red-700 border-red-300",
  };

  const statusColors = {
    Open: "bg-blue-100 text-blue-700 border-blue-300",
    "In Progress": "bg-purple-100 text-purple-700 border-purple-300",
    Resolved: "bg-green-100 text-green-700 border-green-300",
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFile({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          data: reader.result,
        });
        toast.success("File attached successfully");
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    toast.success("File removed");
  };

  const validateForm = () => {
    if (issue.trim().length < 20) {
      toast.error("Issue description must be at least 20 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newTicket = {
        id: `TICKET-${Date.now()}`,
        issue,
        email,
        priority,
        category,
        status: "Open",
        createdAt: new Date().toISOString(),
        file: file,
      };

      setTickets((prev) => [newTicket, ...prev]);

      // Clear form
      setIssue("");
      setEmail("");
      setPriority("Medium");
      setCategory("Support");
      setFile(null);
      setIsSubmitting(false);

      toast.success(`✅ Ticket ${newTicket.id} created successfully!`, {
        duration: 4000,
      });
    }, 1000);
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
    toast.success(`Ticket status updated to ${newStatus}`);
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((t) => filterStatus === "All" || t.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "Newest First") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "Oldest First") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "Priority") {
        const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const charCount = issue.length;
  const charMin = 20;
  const isCharCountValid = charCount >= charMin;

  return (
    <div className="min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)] bg-gray-100 p-4 h-auto">
      <div className="max-w-7xl mx-auto lg:h-full h-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Panel: Raise New Ticket Form */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-lg border flex flex-col lg:h-full h-auto overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">New Ticket</h2>
            <p className="text-xs text-gray-500 mt-1">
              Submit a new issue to support.
            </p>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* Priority and Category */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                >
                  <option value="Bug">Bug</option>
                  <option value="Feature">Feature</option>
                  <option value="Support">Support</option>
                  <option value="Question">Question</option>
                </select>
              </div>
            </div>

            {/* Issue Description */}
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe your issue..."
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
              <div className={`text-xs mt-1 text-right ${isCharCountValid ? 'text-green-600' : 'text-red-500'}`}>
                {charCount} / {charMin}
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Attachment
              </label>

              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload File</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-[10px] text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-200 rounded-full transition"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: My Tickets Section */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-lg border flex flex-col lg:h-full h-auto overflow-hidden">
          <div className="p-6 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">My Tickets</h2>
              <p className="text-xs text-gray-500 mt-1">Track your support requests</p>
            </div>

            {/* Compact Filter Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="w-3 h-3 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="Newest First">Newest</option>
                <option value="Oldest First">Oldest</option>
                <option value="Priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Scrollable Tickets List */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No tickets found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted tickets will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white border rounded-lg p-4 hover:shadow-sm transition duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Status Badge */}
                      <div className="shrink-0">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border ${statusColors[ticket.status]}`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-800 truncate">
                            {ticket.id}
                          </h3>
                          <span className="text-gray-300">•</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityColors[ticket.priority].replace('border', '')} bg-opacity-50`}>
                            {ticket.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>

                        {/* Collapsible Content Trigger */}
                        <div
                          className="cursor-pointer group"
                          onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                        >
                          <div className={`text-sm text-gray-600 ${expandedTicket === ticket.id ? '' : 'line-clamp-2'}`}>
                            {ticket.issue}
                          </div>

                          <div className="flex items-center gap-1 mt-2 text-indigo-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {expandedTicket === ticket.id ? 'Show Less' : 'Show More'}
                            <ChevronDown className={`w-3 h-3 transition-transform ${expandedTicket === ticket.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded Attachment View */}
                        {expandedTicket === ticket.id && ticket.file && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-3">
                            <div className="bg-indigo-50 p-2 rounded-lg">
                              {ticket.file.type.startsWith("image/") ? (
                                <ImageIcon className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-indigo-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{ticket.file.name}</p>
                              <p className="text-[10px] text-gray-500">{formatFileSize(ticket.file.size)}</p>
                            </div>
                            <a
                              href={ticket.file.data}
                              download={ticket.file.name}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaiseTicket;
