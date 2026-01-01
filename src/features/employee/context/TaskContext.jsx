import React, { createContext, useState, useEffect } from "react";
import axios from "../../../shared/utils/axios";

// ✅ ONLY NAMED EXPORTS
export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, projRes, empRes] = await Promise.all([
        axios.get("/tasks"),
        axios.get("/projects"),
        axios.get("/employees")
      ]);

      const allTasks = taskRes.data;
      setTasks(allTasks.filter(t => t.type?.toUpperCase() === "TASK"));
      setIssues(allTasks.filter(t => t.type?.toUpperCase() === "ISSUE"));
      setProjects(projRes.data);
      setUsers(empRes.data);
    } catch (err) {
      console.error("Error fetching employee context data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateTaskStatus = async (taskId, newStatus, fileData = null) => {
    try {
      const payload = { status: newStatus };
      if (fileData) {
        payload.completionFileUrl = fileData.url;
        payload.completionFileName = fileData.name;
      }
      await axios.put(`/tasks/${taskId}`, payload);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, ...payload } : t));
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const updateIssueStatus = async (issueId, newStatus, metadata = {}) => {
    try {
      const updates = {
        status: newStatus,
        resolutionDetails: newStatus === "Completed" ? {
          resolvedBy: metadata.resolverName,
          resolvedAt: metadata.resolutionTime,
          context: metadata.issueContext,
          proofFile: metadata.proofFile?.name
        } : null
      };
      await axios.put(`/tasks/${issueId}`, updates);
      setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...updates } : i));
    } catch (err) {
      console.error("Error updating issue status:", err);
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      projects,
      users,
      issues,
      loading,
      updateTaskStatus,
      updateIssueStatus,
      refreshData: fetchData
    }}>
      {children}
    </TaskContext.Provider>
  );
};
