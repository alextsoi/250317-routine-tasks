import React, { useState, useEffect } from 'react';

const CalendarView = ({ routines }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [routineHistories, setRoutineHistories] = useState({});
  const [selectedRoutines, setSelectedRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayCompletions, setSelectedDayCompletions] = useState([]);
  const [fullRoutines, setFullRoutines] = useState({});

  useEffect(() => {
    if (routines.length > 0) {
      // Initialize with all routines selected
      setSelectedRoutines(routines.map(routine => routine.id));
      loadAllRoutineHistories();
      loadFullRoutineData();
    }
  }, [routines]);

  useEffect(() => {
    generateCalendarDays(currentDate);
  }, [currentDate]);

  const loadFullRoutineData = async () => {
    const loadedRoutines = {};
    
    for (const routine of routines) {
      try {
        const fullRoutine = await window.api.getRoutine(routine.id);
        if (fullRoutine) {
          loadedRoutines[routine.id] = fullRoutine;
        }
      } catch (error) {
        console.error(`Error loading full data for routine ${routine.id}:`, error);
      }
    }
    
    console.log('Loaded full routine data:', loadedRoutines);
    setFullRoutines(loadedRoutines);
  };

  const loadAllRoutineHistories = async () => {
    setIsLoading(true);
    
    try {
      // Use the method to get all histories at once
      const histories = await window.api.getAllTaskHistories();
      setRoutineHistories(histories);
    } catch (error) {
      console.error('Error loading all routine histories:', error);
      setRoutineHistories({});
    }
    
    setIsLoading(false);
  };

  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Create array for all days in the calendar view
    const days = [];
    
    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Add all days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }
    }
    
    setCalendarDays(days);
  };

  const getTaskCompletionsForDate = (date) => {
    // Format date as YYYY-MM-DD for comparison
    const dateString = date.toISOString().split('T')[0];
    const completions = [];
    
    // For debugging - only log once per day to avoid console spam
    const isToday = new Date().toISOString().split('T')[0] === dateString;
    
    // Only include history for selected routines
    selectedRoutines.forEach(routineId => {
      const routineHistory = routineHistories[routineId] || [];
      const fullRoutine = fullRoutines[routineId]; // Use the full routine data
      
      if (isToday && fullRoutine) {
        console.log(`Full routine found for ${routineId}:`, {
          name: fullRoutine.name,
          hasTasks: !!fullRoutine.tasks,
          taskCount: fullRoutine.tasks?.length || 0,
          taskIds: fullRoutine.tasks?.map(t => t.id) || []
        });
      }
      
      if (fullRoutine) {
        routineHistory.forEach(completion => {
          const completionDate = new Date(completion.completedAt).toISOString().split('T')[0];
          
          if (completionDate === dateString) {
            // Find the matching task in the routine's tasks array
            let taskName = "Task not found";
            let taskFound = false;
            
            if (fullRoutine.tasks && Array.isArray(fullRoutine.tasks)) {
              const task = fullRoutine.tasks.find(t => t.id === completion.taskId);
              if (task && task.name) {
                taskName = task.name;
                taskFound = true;
              }
            }
            
            if (isToday) {
              console.log(`Task lookup for ${completion.taskId} in routine "${fullRoutine.name}":`, {
                found: taskFound,
                taskName: taskName,
                completedAt: completion.completedAt,
                availableTasks: fullRoutine.tasks?.map(t => ({id: t.id, name: t.name})) || []
              });
            }
            
            completions.push({
              routineId,
              routineName: fullRoutine.name,
              taskId: completion.taskId,
              taskName: taskName,
              completedAt: completion.completedAt
            });
          }
        });
      }
    });
    
    return completions;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleRoutineFilterChange = (routineId) => {
    setSelectedRoutines(prev => {
      if (prev.includes(routineId)) {
        return prev.filter(id => id !== routineId);
      } else {
        return [...prev, routineId];
      }
    });
  };

  const handleSelectAllRoutines = () => {
    setSelectedRoutines(routines.map(routine => routine.id));
  };

  const handleClearAllRoutines = () => {
    setSelectedRoutines([]);
  };

  const handleDayClick = (day, completions) => {
    if (completions.length > 0) {
      setSelectedDay(day.date);
      setSelectedDayCompletions(completions);
    }
  };

  const closeModal = () => {
    setSelectedDay(null);
    setSelectedDayCompletions([]);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatMonth = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Group completions by routine for the modal display
  const groupCompletionsByRoutine = (completions) => {
    return completions.reduce((groups, completion) => {
      if (!groups[completion.routineId]) {
        groups[completion.routineId] = {
          routineName: completion.routineName,
          tasks: []
        };
      }
      
      groups[completion.routineId].tasks.push({
        taskId: completion.taskId,
        taskName: completion.taskName,
        completedAt: completion.completedAt
      });
      
      return groups;
    }, {});
  };

  return (
    <div className="calendar-container" style={{backgroundColor: '#fff', padding: '20px'}}>
      <div className="calendar-header">
        <div className="month-navigation">
          <button className="btn btn-secondary" onClick={handlePreviousMonth} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px'}}>
            &larr;
          </button>
          <h2>{formatMonth(currentDate)}</h2>
          <button className="btn btn-secondary" onClick={handleNextMonth} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px'}}>
            &rarr;
          </button>
        </div>
      </div>

      <div className="routine-filters" style={{marginTop: '20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
          <h3 style={{fontSize: '16px', fontWeight: 'bold'}}>Filter Routines</h3>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              className="btn-link" 
              onClick={handleSelectAllRoutines}
              style={{color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}
            >
              Select All
            </button>
            <button 
              className="btn-link" 
              onClick={handleClearAllRoutines}
              style={{color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}
            >
              Clear All
            </button>
          </div>
        </div>
        
        {routines.map(routine => (
          <div 
            key={routine.id} 
            style={{
              backgroundColor: selectedRoutines.includes(routine.id) ? '#eef2ff' : '#f9fafb',
              border: '1px solid ' + (selectedRoutines.includes(routine.id) ? '#6366f1' : '#e5e5e5'),
              borderRadius: '20px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => handleRoutineFilterChange(routine.id)}
          >
            <span style={{
              width: '12px', 
              height: '12px', 
              backgroundColor: selectedRoutines.includes(routine.id) ? '#6366f1' : '#e5e5e5',
              borderRadius: '50%',
              marginRight: '8px'
            }}></span>
            <span style={{fontSize: '14px'}}>{routine.name}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px'}}>
          <div style={{
            width: '30px', 
            height: '30px', 
            borderRadius: '50%', 
            border: '3px solid #e5e5e5',
            borderTopColor: '#6366f1',
            animation: 'spin 1s linear infinite',
          }}></div>
          <p style={{marginTop: '16px', color: '#6b7280'}}>Loading calendar data...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <div className="calendar-grid" style={{marginTop: '20px'}}>
          <div className="weekday-header" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #e5e5e5'}}>
            {weekdays.map(day => (
              <div key={day} className="weekday" style={{padding: '10px', textAlign: 'center', fontWeight: 'bold'}}>{day}</div>
            ))}
          </div>
          <div className="calendar-days" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)'}}>
            {calendarDays.map((day, index) => {
              const dayCompletions = getTaskCompletionsForDate(day.date);
              // Group completions by routine for easier display
              const routineGroups = {};
              dayCompletions.forEach(completion => {
                if (!routineGroups[completion.routineId]) {
                  routineGroups[completion.routineId] = {
                    name: completion.routineName,
                    count: 0
                  };
                }
                routineGroups[completion.routineId].count++;
              });

              return (
                <div 
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                  style={{
                    border: '1px solid #e5e5e5', 
                    padding: '10px',
                    minHeight: '80px',
                    backgroundColor: !day.isCurrentMonth ? '#f5f5f5' : '#fff',
                    color: !day.isCurrentMonth ? '#aaa' : '#333',
                    position: 'relative',
                    cursor: dayCompletions.length > 0 ? 'pointer' : 'default'
                  }}
                  onClick={() => handleDayClick(day, dayCompletions)}
                >
                  <div className="day-header" style={{textAlign: 'right'}}>
                    <span className="day-number" style={{
                      fontWeight: isToday(day.date) ? 'bold' : 'normal',
                      color: isToday(day.date) ? '#6366f1' : 'inherit'
                    }}>{day.date.getDate()}</span>
                  </div>
                  
                  {/* Display routines with tasks completed this day */}
                  {Object.keys(routineGroups).length > 0 && (
                    <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                      {Object.keys(routineGroups).slice(0, 3).map(routineId => (
                        <div key={routineId} style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '11px',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          borderRadius: '10px',
                          padding: '2px 6px',
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#6366f1',
                            borderRadius: '50%',
                            marginRight: '4px'
                          }}></span>
                          <span style={{color: '#6366f1', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%'}}>
                            {routineGroups[routineId].name.substring(0, 12)}{routineGroups[routineId].name.length > 12 ? '...' : ''}
                          </span>
                          <span style={{marginLeft: 'auto', backgroundColor: '#6366f1', color: 'white', borderRadius: '8px', padding: '1px 4px', fontSize: '9px'}}>
                            {routineGroups[routineId].count}
                          </span>
                        </div>
                      ))}
                      {Object.keys(routineGroups).length > 3 && (
                        <div style={{
                          fontSize: '11px',
                          textAlign: 'center',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '10px',
                          padding: '2px 6px',
                        }}>
                          +{Object.keys(routineGroups).length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div style={{marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'center'}}>
        <p>Total completions shown: {Object.values(routineHistories)
          .flat()
          .filter(h => selectedRoutines.includes(h.routineId))
          .length}</p>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={closeModal}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{margin: 0, fontSize: '18px', fontWeight: 'bold'}}>
                Completed Tasks - {formatDate(selectedDay)}
              </h3>
              <button 
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>
            
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              maxHeight: 'calc(80vh - 70px)'
            }}>
              {selectedDayCompletions.length === 0 ? (
                <p style={{textAlign: 'center', color: '#6b7280'}}>No task completions for this day.</p>
              ) : (
                <div>
                  {Object.entries(groupCompletionsByRoutine(selectedDayCompletions)).map(([routineId, data]) => (
                    <div key={routineId} style={{marginBottom: '24px'}}>
                      <h4 style={{
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#6366f1',
                          marginRight: '8px'
                        }}></span>
                        {data.routineName}
                      </h4>
                      
                      <div style={{marginLeft: '18px'}}>
                        {data.tasks.map((task, index) => (
                          <div key={index} style={{
                            padding: '10px 12px',
                            marginBottom: '8px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{fontWeight: '500', color: '#4b5563'}}>{task.taskName}</span>
                            <span style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                              </svg>
                              {formatTime(task.completedAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView; 