import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TaskContext } from "../context/TaskContext";
import TaskRow from "../components/TaskRow";

const ProjectTasks = () => {
  const { projectId } = useParams();

  const { tasks, projects, updateTaskStatus } = useContext(TaskContext);

  // ✅ Find the selected project
  const project = projects.find(p => p.projectId === projectId);

  // ✅ Filter only tasks of this project
  const projectTasks = tasks.filter(
    task => task.projectId === projectId
  );

  if (!project) {
    return (
      <div className="p-4 sm:p-6 text-center text-red-500">
        Project not found
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50">

      <h1 className="text-lg sm:text-2xl font-bold mb-2 text-gray-800">
        {project.name}
      </h1>

      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
        Client: <span className="font-semibold">{project.firstName} {project.lastName}</span>
      </p>

      {projectTasks.length === 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow text-center text-gray-500">
          No tasks assigned to this project yet.
        </div>
      ) : (

        <div className="space-y-3 sm:space-y-4">
          {projectTasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onStatusChange={updateTaskStatus}
            />
          ))}
        </div>

      )}

    </div>
  );
};

export default ProjectTasks;
