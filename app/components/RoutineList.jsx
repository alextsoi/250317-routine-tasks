import React from 'react';

const RoutineList = ({ routines, onSelectRoutine }) => {
  if (routines.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3>No routines found</h3>
          <p>Create your first routine to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="routine-list">
      {routines.map(routine => (
        <div 
          key={routine.id} 
          className="card routine-card"
          onClick={() => onSelectRoutine(routine.id)}
        >
          <h3>{routine.name}</h3>
          <p>{routine.description}</p>
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Click to view tasks
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoutineList; 