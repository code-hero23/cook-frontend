import React, { useState, useEffect } from "react";
import axios from "../../../shared/utils/axios";
import { FileText, Download } from "lucide-react";

const Documents = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Authenticated client has projectCode/ID in token or context
    // But axios interceptor handles token.
    // We need to know WHICH project. 
    // The login response returned `project` object which is stored in localStorage.
    const project = JSON.parse(localStorage.getItem("clientProject") || "{}");
    const projectId = project.id;

    useEffect(() => {
        if (projectId) {
            const fetchDocs = async () => {
                try {
                    const res = await axios.get(`/project-data/${projectId}/documents`);
                    setDocs(res.data);
                } catch (err) {
                    console.error("Error fetching docs", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchDocs();
        }
    }, [projectId]);

    if (!projectId) return <div className="p-6 text-center text-slate-500">Session Error. Please Login Again.</div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2">
                <FileText className="text-indigo-500" /> Project Documents
            </h2>

            {loading ? (
                <div className="text-center py-10 text-slate-400">Loading documents...</div>
            ) : docs.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No documents shared yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {docs.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-500 shadow-sm">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 text-sm">{doc.name}</p>
                                    <p className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <a
                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${doc.url}`}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Download"
                            >
                                <Download size={20} />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Documents;
