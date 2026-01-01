import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { isProjectOverdue, isTaskOverdue } from "../utils/dateUtils.js";
import axios from "../../../shared/utils/axios.js";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, projRes, taskRes] = await Promise.all([
        axios.get("/employees"),
        axios.get("/projects"),
        axios.get("/tasks"),
      ]);
      setEmployees(empRes.data);
      setProjects(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("[AppContext] token present?", token ? true : false);

    const isTokenExpired = (t) => {
      // Mock mode: tokens don't expire
      return false;
    };

    if (token) {
      if (isTokenExpired(token)) {
        console.log("[AppContext] token expired, clearing and redirecting");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }
      fetchData();
    }
  }, []);

  // CRUD: Employees
  const addEmployee = async (emp) => {
    try {
      const res = await axios.post("/employees", emp);
      setEmployees((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding employee:", err);
      const msg = err.response?.data?.message || err.message || "Error adding employee";
      alert(msg);
    }
  };

  const updateEmployee = async (id, updates) => {
    try {
      // Only send safe updatable fields to the server to avoid touching timestamps/PKs
      const {
        name,
        email,
        phone,
        department,
        role,
        status,
        joinedAt,
        password, // Add password to destructuring
      } = updates;

      const payload = { name, email, phone, department, role, status, joinedAt };
      if (password) payload.password = password; // Add to payload if present

      const res = await axios.put(`/employees/${id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEmployees((prev) => prev.map((e) => (e.id === id ? res.data : e)));
    } catch (err) {
      console.error("Error updating employee:", err);
      const msg = err.response?.data?.message || err.message || "Error updating employee";
      alert(msg);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting employee:", err);
      const msg = err.response?.data?.message || err.message || "Error deleting employee";
      alert(msg);
    }
  };

  // CRUD: Projects
  const addProject = async (project) => {
    try {
      const res = await axios.post("/projects", project);
      setProjects((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding project:", err);
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      const res = await axios.put(`/projects/${projectId}`, updates);
      setProjects((prev) =>
        prev.map((p) => (p.projectId === projectId ? res.data : p))
      );
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.projectId !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  // CRUD: Tasks
  const addTask = async (task) => {
    try {
      const res = await axios.post("/tasks", task);
      setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await axios.put(`/tasks/${taskId}`, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Derived metrics for dashboard
  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const openProjects = projects.filter(p => !isProjectOverdue(p)).length;
    const closedProjects = projects.filter(p => p.status === "Completed").length;

    const openTasks = tasks.filter(t => t.status !== "Completed").length;
    const closedTasks = tasks.filter(t => t.status === "Completed").length;

    const overdueProjects = projects.filter((p) => isProjectOverdue(p)).length;

    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const overdueTasks = tasks.filter((t) => isTaskOverdue(t)).length;
    const pendingTasks = totalTasks - completedTasks - overdueTasks;

    const openIssues = tasks.filter(
      (t) => t.type === "Issue" && t.status !== "Completed"
    ).length;
    const closedIssues = tasks.filter(
      (t) => t.type === "Issue" && t.status === "Completed"
    ).length;

    return {
      totalProjects,
      openProjects,
      closedProjects,
      openTasks,
      closedTasks,
      totalTasks,
      overdueProjects,
      completedTasks,
      pendingTasks,
      overdueTasks,
      openIssues,
      closedIssues,
    };
  }, [projects, tasks]);

  // Employee-task mapping for chart
  const tasksByEmployee = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      map[e.id] = { employeeId: e.id, name: e.name, count: 0 };
    });
    tasks.forEach((t) => {
      if (map[t.employeeId]) {
        map[t.employeeId].count += 1;
      }
    });
    return Object.values(map);
  }, [employees, tasks]);

  const value = {
    employees,
    projects,
    tasks,
    addEmployee,
    updateEmployee,
    addProject,
    updateProject,
    addTask,
    updateTask,
    deleteEmployee,
    deleteProject,
    deleteTask,
    metrics,
    tasksByEmployee,
    loading,
    refreshData: fetchData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
