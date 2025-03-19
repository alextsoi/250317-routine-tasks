import React, { useState, useEffect } from 'react';
import RoutineList from './RoutineList';
import RoutineDetail from './RoutineDetail';
import RoutineForm from './RoutineForm';
import CalendarView from './CalendarView';

const App = () => {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState('routines'); // 'routines' or 'calendar'

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const routineList = await window.api.getRoutines();
      setRoutines(routineList);
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const handleRoutineSelect = async (routineId) => {
    try {
      const routine = await window.api.getRoutine(routineId);
      setSelectedRoutine(routine);
    } catch (error) {
      console.error('Error loading routine details:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedRoutine(null);
  };

  const handleCreateRoutine = () => {
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditRoutine = () => {
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleSaveRoutine = async (routineData) => {
    try {
      // If editing an existing routine, use its ID, otherwise generate a new one
      const routineId = isEditing ? selectedRoutine.id : Date.now().toString();
      
      await window.api.saveRoutine(routineId, routineData);
      
      setIsFormOpen(false);
      
      // If we were editing, update the selected routine with the new data
      if (isEditing && selectedRoutine) {
        const updatedRoutine = await window.api.getRoutine(routineId);
        setSelectedRoutine(updatedRoutine);
      }
      
      loadRoutines();
    } catch (error) {
      console.error('Error saving routine:', error);
    }
  };

  const handleDeleteRoutine = async () => {
    if (!selectedRoutine || !selectedRoutine.id) {
      console.error('Cannot delete routine: No routine selected or routine has no ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this routine?')) {
      try {
        const routineId = selectedRoutine.id;
        console.log('Deleting routine with ID:', routineId);
        await window.api.deleteRoutine(routineId);
        setSelectedRoutine(null);
        loadRoutines();
      } catch (error) {
        console.error('Error deleting routine:', error);
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    if (!selectedRoutine || !selectedRoutine.id) {
      console.error('Cannot complete task: No routine selected');
      return;
    }
    
    try {
      await window.api.completeTask(selectedRoutine.id, taskId);
      // Refresh the selected routine to show updated task state
      const updatedRoutine = await window.api.getRoutine(selectedRoutine.id);
      setSelectedRoutine(updatedRoutine);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const toggleView = () => {
    setView(view === 'routines' ? 'calendar' : 'routines');
    // When switching to routines view, clear any selected routine
    if (view === 'calendar') {
      setSelectedRoutine(null);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Routine Tasks</h1>
        <div className="header-controls">
          <button 
            className={`btn btn-secondary view-toggle-btn ${view === 'calendar' ? 'active' : ''}`} 
            onClick={toggleView}
          >
            {view === 'routines' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
                Calendar View
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v1h14V3a1 1 0 0 0-1-1H2zM1 9h14v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V9z"/>
                </svg>
                Routine View
              </>
            )}
          </button>
          
          {view === 'routines' && !selectedRoutine && (
            <button className="btn" onClick={handleCreateRoutine}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Create New Routine
            </button>
          )}
          
          {view === 'routines' && selectedRoutine && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" onClick={handleEditRoutine}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                </svg>
                Edit Routine
              </button>
              <button className="btn btn-danger" onClick={handleDeleteRoutine}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
                Delete Routine
              </button>
            </div>
          )}
        </div>
      </div>

      {view === 'routines' && !selectedRoutine && (
        <RoutineList 
          routines={routines} 
          onSelectRoutine={handleRoutineSelect} 
        />
      )}

      {view === 'routines' && selectedRoutine && (
        <RoutineDetail 
          routine={selectedRoutine} 
          onBack={handleBackToList} 
          onCompleteTask={handleCompleteTask}
        />
      )}
      
      {view === 'calendar' && (
        <CalendarView routines={routines} />
      )}

      {isFormOpen && (
        <RoutineForm 
          routine={isEditing ? selectedRoutine : null} 
          onClose={handleFormClose} 
          onSave={handleSaveRoutine} 
        />
      )}
    </div>
  );
};

export default App; 