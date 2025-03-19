import React, { useState } from 'react';

const CalendarDay = ({ date, isCurrentMonth, completions }) => {
  const [showModal, setShowModal] = useState(false);
  
  const formatDate = (date) => {
    return date.getDate();
  };
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const handleClick = () => {
    if (completions.length > 0) {
      setShowModal(true);
    }
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Group completions by routine for better display
  const completionsByRoutine = completions.reduce((grouped, completion) => {
    if (!grouped[completion.routineId]) {
      grouped[completion.routineId] = {
        routineName: completion.routineName,
        tasks: []
      };
    }
    
    grouped[completion.routineId].tasks.push({
      taskName: completion.taskName,
      completedAt: completion.completedAt
    });
    
    return grouped;
  }, {});
  
  const isToday = () => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  return (
    <>
      <div 
        className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday() ? 'today' : ''} ${completions.length > 0 ? 'has-completions' : ''}`}
        onClick={handleClick}
      >
        <div className="day-header">
          <span className="day-number">{formatDate(date)}</span>
        </div>
        
        {completions.length > 0 && (
          <div className="completion-indicators">
            {Object.keys(completionsByRoutine).slice(0, 3).map(routineId => (
              <div key={routineId} className="routine-indicator" title={completionsByRoutine[routineId].routineName}>
                <span className="routine-dot"></span>
                <span className="routine-name-short">{completionsByRoutine[routineId].routineName.substring(0, 1)}</span>
              </div>
            ))}
            
            {Object.keys(completionsByRoutine).length > 3 && (
              <div className="more-indicator">+{Object.keys(completionsByRoutine).length - 3}</div>
            )}
          </div>
        )}
      </div>
      
      {showModal && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <div className="modal calendar-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Completed Tasks - {date.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {Object.keys(completionsByRoutine).map(routineId => (
                <div key={routineId} className="calendar-completion-group">
                  <h4>{completionsByRoutine[routineId].routineName}</h4>
                  <ul className="completion-list">
                    {completionsByRoutine[routineId].tasks.map((task, index) => (
                      <li key={index} className="completion-item">
                        <div className="task-completed-info">
                          <span className="task-name">{task.taskName}</span>
                          <span className="completion-time">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                            {formatTime(task.completedAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {completions.length === 0 && (
                <div className="empty-state">
                  <p>No task completions for this day.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarDay; 