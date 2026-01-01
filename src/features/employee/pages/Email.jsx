import React, { useState } from "react";
import { useToast } from "../components/ToastProvider";
import { Mail, Send, Plus, Inbox, FileText } from "lucide-react";

const Email = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [showCompose, setShowCompose] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const { addToast } = useToast();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const inboxMails = [
    {
      id: 1,
      from: "admin@cookscape.in",
      subject: "New task assigned",
      message:
        "You have been assigned Kitchen Drawing task for Sathish Guest House.",
      time: "10:45 AM",
    },
    {
      id: 2,
      from: "admin@cookscape.in",
      subject: "Reminder: Task overdue",
      message: "Site Measurement task is overdue, complete ASAP.",
      time: "Yesterday",
    },
  ];

  const sentMails = [
    {
      id: 1,
      to: "employee@cookscape.in",
      subject: "Regarding site visit",
      message: "Please update work progress status.",
      time: "9:30 AM",
    },
  ];

  const draftMails = [
    {
      id: 1,
      to: "designer@cookscape.in",
      subject: "Kitchen layout confirmation",
      message: "Draft saved for later editing...",
      time: "Today",
    },
  ];

  const handleSend = () => {
    if (!to || !subject || !message) {
      addToast("Please fill all fields before sending", "error");
      return;
    }
    addToast("Message Sent ✅", "success");
    setTo("");
    setSubject("");
    setMessage("");
    setAttachments([]);
    setShowCompose(false);
  };

  const handleSaveDraft = () => {
    if (!subject && !message) {
      addToast("Write something before saving as draft", "error");
      return;
    }
    addToast("Draft saved ✅", "success");
    setShowCompose(false);
  };

  const renderMails = (mailList) => (
    <div className="bg-white rounded-xl shadow border">
      {mailList.map((mail) => (
        <div
          key={mail.id}
          className="p-4 border-b hover:bg-gray-50 transition cursor-pointer"
        >
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold text-gray-800">
              {mail.from || mail.to}
            </p>
            <span className="text-xs text-gray-500">{mail.time}</span>
          </div>

          <p className="text-sm font-semibold text-orange-600">{mail.subject}</p>

          <p className="text-sm text-gray-600 truncate">{mail.message}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-100 p-2 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Mail size={22} /> Email Center
        </h1>
        <button
          onClick={() => setShowCompose(true)}
          className="bg-orange-600 text-white px-4 sm:px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-orange-700 transition w-full sm:w-auto"
        >
          <Plus size={18} /> Compose
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6">
        {/* Sidebar */}
        <div className="col-span-1 sm:col-span-3 bg-white rounded-xl shadow border p-3 sm:p-4 space-y-2 sm:space-y-3 mb-2 sm:mb-0">
          {[
            { key: "inbox", icon: Inbox, label: "Inbox" },
            { key: "sent", icon: Send, label: "Sent" },
            { key: "draft", icon: FileText, label: "Drafts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                ${activeTab === tab.key
                  ? "bg-orange-600 text-white"
                  : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}

          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                       text-orange-600 border border-orange-600 hover:bg-orange-50"
          >
            <Plus size={18} /> Compose
          </button>
        </div>

        {/* Content Section */}
        <div className="col-span-1 sm:col-span-9">
          {activeTab === "inbox" && renderMails(inboxMails)}
          {activeTab === "sent" && renderMails(sentMails)}
          {activeTab === "draft" && renderMails(draftMails)}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-2">
          <div className="bg-white w-full max-w-xs sm:max-w-xl rounded-xl shadow-lg p-4 sm:p-6 relative mx-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Compose Mail</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none"
              />

              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none"
              />

              <textarea
                rows="5"
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border p-3 rounded resize-none focus:ring-2 focus:ring-orange-500 outline-none"
              ></textarea>

              {/* Attachments */}
              <div className="border p-3 rounded bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">📎 Attachments</span>
                  <label className="cursor-pointer text-orange-600 text-sm hover:underline">
                    + Add Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white border rounded px-3 py-1"
                      >
                        <div className="text-sm truncate w-[80%]">
                          {file.name}
                        </div>

                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-5">
              <button
                onClick={handleSend}
                className="bg-orange-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700"
              >
                <Send size={18} /> Send
              </button>

              <button
                onClick={handleSaveDraft}
                className="text-gray-500 hover:text-gray-800 text-sm"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Email;
