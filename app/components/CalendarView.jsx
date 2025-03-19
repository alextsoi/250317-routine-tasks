import React, { useState, useEffect } from 'react';

const CalendarView = ({ routines }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays(currentDate);
  }, [currentDate]);

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

      <div className="calendar-grid" style={{marginTop: '20px'}}>
        <div className="weekday-header" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '1px solid #e5e5e5'}}>
          {weekdays.map(day => (
            <div key={day} className="weekday" style={{padding: '10px', textAlign: 'center', fontWeight: 'bold'}}>{day}</div>
          ))}
        </div>
        <div className="calendar-days" style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)'}}>
          {calendarDays.map((day, index) => (
            <div 
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
              style={{
                border: '1px solid #e5e5e5', 
                padding: '10px',
                minHeight: '80px',
                backgroundColor: !day.isCurrentMonth ? '#f5f5f5' : '#fff',
                color: !day.isCurrentMonth ? '#aaa' : '#333',
                position: 'relative'
              }}
            >
              <div className="day-header" style={{textAlign: 'right'}}>
                <span className="day-number" style={{
                  fontWeight: isToday(day.date) ? 'bold' : 'normal',
                  color: isToday(day.date) ? '#6366f1' : 'inherit'
                }}>{day.date.getDate()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{marginTop: '20px', fontSize: '14px', color: '#666', textAlign: 'center'}}>
        <p>Debug info: Current date is {currentDate.toDateString()}, calendar has {calendarDays.length} days rendered</p>
        <p>Number of routines: {routines.length}</p>
      </div>
    </div>
  );
};

export default CalendarView; 