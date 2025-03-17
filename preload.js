const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    getRoutines: () => ipcRenderer.invoke('get-routines'),
    
    getRoutine: (routineId) => {
      if (!routineId) {
        console.error('getRoutine: No routineId provided');
        return Promise.resolve(null);
      }
      return ipcRenderer.invoke('get-routine', routineId);
    },
    
    saveRoutine: (routineId, routine) => {
      if (!routineId) {
        console.error('saveRoutine: No routineId provided');
        return Promise.resolve(false);
      }
      return ipcRenderer.invoke('save-routine', { routineId, routine });
    },
    
    deleteRoutine: (routineId) => {
      if (!routineId) {
        console.error('deleteRoutine: No routineId provided');
        return Promise.resolve(false);
      }
      return ipcRenderer.invoke('delete-routine', routineId);
    },
    
    completeTask: (routineId, taskId) => {
      if (!routineId || !taskId) {
        console.error('completeTask: Missing routineId or taskId');
        return Promise.resolve(false);
      }
      return ipcRenderer.invoke('complete-task', { routineId, taskId });
    },
    
    getTaskHistory: (routineId) => {
      if (!routineId) {
        console.error('getTaskHistory: No routineId provided');
        return Promise.resolve([]);
      }
      return ipcRenderer.invoke('get-task-history', routineId);
    }
  }
); 