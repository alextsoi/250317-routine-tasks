import React, { useState, useEffect } from 'react';
import TaskHistory from './TaskHistory';

const RoutineDetail = ({ routine, onBack, onCompleteTask }) => {
  const [taskHistory, setTaskHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    if (routine) {
      loadTaskHistory();
    }
  }, [routine]);

  const loadTaskHistory = async () => {
    try {
      const history = await window.api.getTaskHistory(routine.id);
      setTaskHistory(history);
    } catch (error) {
      console.error('Error loading task history:', error);
    }
  };

  const handleCompleteTask = (taskId) => {
    onCompleteTask(taskId);
    loadTaskHistory();
  };

  const handleShowHistory = (taskId) => {
    setSelectedTaskId(taskId);
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  if (!routine) return null;

  const getTaskCompletions = (taskId) => {
    return taskHistory.filter(item => item.taskId === taskId);
  };

  // Get the next task to complete (first task with no completions)
  const getNextTask = () => {
    if (!routine.tasks || routine.tasks.length === 0) return null;
    
    for (const task of routine.tasks) {
      const completions = getTaskCompletions(task.id);
      if (completions.length === 0) {
        return task;
      }
    }
    
    return null;
  };

  const nextTask = getNextTask();

  return (
    <div>
      <div className="header">
        <button className="btn btn-secondary" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
          Back to Routines
        </button>
      </div>
      
      <div className="card">
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>{routine.name}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{routine.description}</p>
      </div>
      
      {nextTask ? (
        <div className="card next-task">
          <h3 className="text-lg font-medium mb-2">Next Task</h3>
          <div className="task-item bg-white rounded-lg" style={{ border: 'none', boxShadow: 'var(--shadow-sm)' }}>
            <div className="task-info">
              <h3>{nextTask.name}</h3>
              <p>{nextTask.description}</p>
            </div>
            <button 
              className="btn" 
              onClick={() => handleCompleteTask(nextTask.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
              </svg>
              Complete
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>All tasks completed!</h3>
            <p>You've completed all tasks in this routine. You can mark tasks as complete again to repeat the routine.</p>
          </div>
        </div>
      )}
      
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>All Tasks</h3>
        <div className="task-list">
          {routine.tasks && routine.tasks.map((task, index) => (
            <div key={task.id} className="task-item">
              <div className="task-info">
                <div className="flex items-center">
                  <span className="task-number">
                    {index + 1}
                  </span>
                  <h3>{task.name}</h3>
                </div>
                <p>{task.description}</p>
                {getTaskCompletions(task.id).length > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ display: 'inline-block', marginRight: '4px' }}>
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    Completed {getTaskCompletions(task.id).length} times
                  </p>
                )}
              </div>
              <div>
                <button 
                  className="btn" 
                  onClick={() => handleCompleteTask(task.id)}
                  style={{ marginRight: '8px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  Complete
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleShowHistory(task.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px' }}>
                    <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
                    <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                    <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
                  </svg>
                  History
                </button>
              </div>
            </div>
          ))}
          
          {(!routine.tasks || routine.tasks.length === 0) && (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3>No tasks found</h3>
              <p>This routine doesn't have any tasks yet. Edit the routine to add tasks.</p>
            </div>
          )}
        </div>
      </div>
      
      {showHistory && selectedTaskId && (
        <TaskHistory 
          taskId={selectedTaskId}
          taskName={routine.tasks.find(t => t.id === selectedTaskId)?.name || 'Task'}
          completions={getTaskCompletions(selectedTaskId)}
          onClose={handleCloseHistory}
        />
      )}
    </div>
  );
};

export default RoutineDetail; 