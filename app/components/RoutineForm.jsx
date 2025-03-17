import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const RoutineForm = ({ routine, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');

  useEffect(() => {
    if (routine) {
      setName(routine.name || '');
      setDescription(routine.description || '');
      setTasks(routine.tasks || []);
    }
  }, [routine]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const routineData = {
      name,
      description,
      tasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(routineData);
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    
    const newTask = {
      id: Date.now().toString(),
      name: newTaskName,
      description: newTaskDescription
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setNewTaskDescription('');
  };

  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleEditTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTaskId(taskId);
      setEditTaskName(task.name);
      setEditTaskDescription(task.description);
    }
  };

  const handleSaveTaskEdit = () => {
    if (!editTaskName.trim() || !editingTaskId) return;
    
    setTasks(tasks.map(task => 
      task.id === editingTaskId 
        ? { ...task, name: editTaskName, description: editTaskDescription }
        : task
    ));
    
    // Reset editing state
    setEditingTaskId(null);
    setEditTaskName('');
    setEditTaskDescription('');
  };

  const handleCancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditTaskName('');
    setEditTaskDescription('');
  };

  const handleDragEnd = (result) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorderedTasks = reorderTasks(
      tasks,
      result.source.index,
      result.destination.index
    );

    setTasks(reorderedTasks);
  };

  // Helper function to reorder tasks after drag and drop
  const reorderTasks = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>{routine ? 'Edit Routine' : 'Create New Routine'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Routine Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Tasks <span className="text-gray-500 text-sm">(drag to reorder)</span></label>
              
              {tasks.length === 0 ? (
                <p className="text-gray-500 mb-4">No tasks added yet. Add tasks below.</p>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="tasks-list">
                    {(provided) => (
                      <div
                        className="task-list"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {tasks.map((task, index) => (
                          <Draggable 
                            key={task.id} 
                            draggableId={task.id} 
                            index={index}
                            isDragDisabled={editingTaskId === task.id}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-item ${snapshot.isDragging ? 'bg-blue-50' : ''} ${editingTaskId === task.id ? 'editing' : ''}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  borderRadius: '6px',
                                  marginBottom: '8px'
                                }}
                              >
                                {editingTaskId === task.id ? (
                                  <div className="w-full">
                                    <div className="form-group mb-2">
                                      <label htmlFor={`edit-task-name-${task.id}`} className="text-sm font-medium">Task Name</label>
                                      <input
                                        type="text"
                                        id={`edit-task-name-${task.id}`}
                                        className="form-control"
                                        value={editTaskName}
                                        onChange={(e) => setEditTaskName(e.target.value)}
                                        autoFocus
                                      />
                                    </div>
                                    <div className="form-group mb-2">
                                      <label htmlFor={`edit-task-desc-${task.id}`} className="text-sm font-medium">Description</label>
                                      <textarea
                                        id={`edit-task-desc-${task.id}`}
                                        className="form-control"
                                        value={editTaskDescription}
                                        onChange={(e) => setEditTaskDescription(e.target.value)}
                                        style={{ minHeight: '60px' }}
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        className="btn btn-secondary mr-2"
                                        onClick={handleCancelTaskEdit}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        className="btn"
                                        onClick={handleSaveTaskEdit}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="task-info">
                                      <div className="flex items-center">
                                        <div className="mr-2 text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                          </svg>
                                        </div>
                                        <h3>{task.name}</h3>
                                      </div>
                                      <p>{task.description}</p>
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        className="btn btn-secondary mr-2"
                                        onClick={() => handleEditTask(task.id)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handleRemoveTask(task.id)}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
            
            <div className="card" style={{ marginTop: '20px' }}>
              <h4>Add New Task</h4>
              <div className="form-group">
                <label htmlFor="taskName">Task Name</label>
                <input
                  type="text"
                  id="taskName"
                  className="form-control"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="taskDescription">Task Description</label>
                <textarea
                  id="taskDescription"
                  className="form-control"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>
              
              <button
                type="button"
                className="btn"
                onClick={handleAddTask}
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={handleSubmit}>
            Save Routine
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutineForm; 