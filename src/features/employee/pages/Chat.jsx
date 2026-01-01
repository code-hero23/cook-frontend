import React, { useContext } from "react";
import ChatInterface from "../../../shared/components/ChatInterface";
import { TaskContext } from "../context/TaskContext";

const Chat = () => {
  const { projects } = useContext(TaskContext);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Only show projects assigned to this employee
  const myProjects = projects.filter(p => p.assignedEmployees?.includes(user.id));

  return (
    <div className="p-4 sm:p-6 h-full">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Project Chats</h1>
      <ChatInterface
        projects={myProjects}
        currentUser={{ name: user.name || "Employee", id: user.id }}
        role="EMPLOYEE"
      />
    </div>
  );
};

export default Chat;
