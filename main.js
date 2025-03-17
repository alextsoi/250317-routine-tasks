const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let store;

// Create data and history directories if they don't exist
let dataDir;
let historyDir;

// Wait for app to be ready before accessing app.getPath
app.whenReady().then(async () => {
  // Import electron-store using dynamic import
  const Store = (await import('electron-store')).default;
  store = new Store();
  
  dataDir = path.join(app.getPath('userData'), 'data');
  historyDir = path.join(app.getPath('userData'), 'history');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for routine operations
ipcMain.handle('get-routines', async () => {
  try {
    const files = fs.readdirSync(dataDir);
    const routines = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
        const routine = JSON.parse(data);
        routines.push({
          id: path.basename(file, '.json'),
          name: routine.name,
          description: routine.description
        });
      }
    }
    
    return routines;
  } catch (error) {
    console.error('Error getting routines:', error);
    return [];
  }
});

ipcMain.handle('get-routine', async (event, routineId) => {
  try {
    const filePath = path.join(dataDir, `${routineId}.json`);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error getting routine ${routineId}:`, error);
    return null;
  }
});

ipcMain.handle('save-routine', async (event, { routineId, routine }) => {
  try {
    // Ensure the routine has an ID property that matches the routineId
    const routineToSave = {
      ...routine,
      id: routineId
    };
    
    const filePath = path.join(dataDir, `${routineId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(routineToSave, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving routine ${routineId}:`, error);
    return false;
  }
});

ipcMain.handle('delete-routine', async (event, routineId) => {
  try {
    if (!routineId) {
      console.error('Cannot delete routine: No routine ID provided');
      return false;
    }
    
    const filePath = path.join(dataDir, `${routineId}.json`);
    
    // Check if the file exists before attempting to delete it
    if (!fs.existsSync(filePath)) {
      console.error(`Routine file not found: ${filePath}`);
      return false;
    }
    
    fs.unlinkSync(filePath);
    console.log(`Successfully deleted routine: ${routineId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting routine ${routineId}:`, error);
    return false;
  }
});

ipcMain.handle('complete-task', async (event, { routineId, taskId }) => {
  try {
    // Get the routine
    const routineFilePath = path.join(dataDir, `${routineId}.json`);
    const routineData = fs.readFileSync(routineFilePath, 'utf8');
    const routine = JSON.parse(routineData);
    
    // Get or create history file
    const historyFilePath = path.join(historyDir, `${routineId}.json`);
    let history = [];
    
    if (fs.existsSync(historyFilePath)) {
      const historyData = fs.readFileSync(historyFilePath, 'utf8');
      history = JSON.parse(historyData);
    }
    
    // Add completion record
    history.push({
      taskId,
      completedAt: new Date().toISOString()
    });
    
    // Save history
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
    
    return true;
  } catch (error) {
    console.error(`Error completing task in routine ${routineId}:`, error);
    return false;
  }
});

ipcMain.handle('get-task-history', async (event, routineId) => {
  try {
    const historyFilePath = path.join(historyDir, `${routineId}.json`);
    
    if (!fs.existsSync(historyFilePath)) {
      return [];
    }
    
    const historyData = fs.readFileSync(historyFilePath, 'utf8');
    return JSON.parse(historyData);
  } catch (error) {
    console.error(`Error getting history for routine ${routineId}:`, error);
    return [];
  }
}); 