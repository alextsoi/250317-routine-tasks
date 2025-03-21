import * as SQLite from 'expo-sqlite';

// Create a variable to hold the database connection
let db = null;

const Database = {
  /**
   * Initialize the database by creating necessary tables
   */
  initDatabase: async () => {
    try {
      // Open the database asynchronously
      db = await SQLite.openDatabaseAsync('routines');
      console.log('Database opened successfully with expo-sqlite');

      // Create tables using runAsync (without transaction)
      // Create routines table
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS routines (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )`,
        []
      );

      // Create tasks table
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          routineId TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          position INTEGER NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY (routineId) REFERENCES routines (id) ON DELETE CASCADE
        )`,
        []
      );

      // Create task_completions table
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS task_completions (
          id TEXT PRIMARY KEY,
          taskId TEXT NOT NULL,
          routineId TEXT NOT NULL,
          completedAt TEXT NOT NULL,
          FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE,
          FOREIGN KEY (routineId) REFERENCES routines (id) ON DELETE CASCADE
        )`,
        []
      );

      return true;
    } catch (error) {
      console.error('Error opening or initializing database:', error);
      throw error;
    }
  },

  /**
   * Get all routines
   */
  getRoutines: async () => {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM routines ORDER BY updatedAt DESC',
        []
      );
      let rows = [];
      for (const row of result) {
        rows.push(row);
      }
      return rows;
    } catch (error) {
      console.error('Error getting routines:', error);
      throw error;
    }
  },

  /**
   * Get a routine by id with its tasks
   */
  getRoutine: async (routineId) => {
    try {
      // Get the routine
      const routineResult = await db.getFirstAsync(
        'SELECT * FROM routines WHERE id = ?',
        [routineId]
      );

      console.log('Routine:', routineResult);

      if(!routineResult){
        return null;
      }

      const routine = routineResult;

      // Get the tasks for this routine
      const tasksResult = await db.getAllAsync(
        'SELECT * FROM tasks WHERE routineId = ? ORDER BY position ASC',
        [routineId]
      );

      console.log('Tasks:', tasksResult);

      let tasks = [];
      for(const task of tasksResult){
        tasks.push(task);
      }
      routine.tasks = tasks;
      console.log('Routine:', routine);
      return routine;
    } catch (error) {
      console.error('Error getting routine:', error);
      throw error;
    }
  },

  /**
   * Save a routine and its tasks
   */
  saveRoutine: async (routine) => {
    try {
      const now = new Date().toISOString();
      const routineId = routine.id || Date.now().toString();
      const tasks = routine.tasks || [];
      console.log('Routine:', routine);
      console.log('Tasks:', tasks);
      // Insert or update the routine
      await db.runAsync(
        `INSERT OR REPLACE INTO routines (id, name, description, createdAt, updatedAt)
         VALUES (?, ?, ?, COALESCE((SELECT createdAt FROM routines WHERE id = ?), ?), ?)`,
        [
          routineId,
          routine.name,
          routine.description || '',
          routineId,
          now,
          now
        ]
      );

      // First, delete any tasks that might have been removed
      if (tasks.length > 0) {
        await db.runAsync(
          'DELETE FROM tasks WHERE routineId = ? AND id NOT IN (' +
          tasks.map(() => '?').join(',') +
          ')',
          [routineId, ...tasks.map(task => task.id)]
        );
      } else {
        // Delete all tasks if none provided
        await db.runAsync(
          'DELETE FROM tasks WHERE routineId = ?',
          [routineId]
        );
      }

      // Then insert or update each task
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskId = task.id || Date.now().toString() + i;

        await db.runAsync(
          `INSERT OR REPLACE INTO tasks 
           (id, routineId, name, description, position, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, COALESCE((SELECT createdAt FROM tasks WHERE id = ?), ?), ?)`,
          [
            taskId,
            routineId,
            task.name,
            task.description || '',
            i,
            taskId,
            now,
            now
          ]
        );
      }

      return routineId;
    } catch (error) {
      console.error('Error saving routine:', error);
      throw error;
    }
  },

  /**
   * Delete a routine
   */
  deleteRoutine: async (routineId) => {
    try {
      const result = await db.runAsync(
        'DELETE FROM routines WHERE id = ?',
        [routineId]
      );

      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error deleting routine:', error);
      throw error;
    }
  },

  /**
   * Complete a task
   */
  completeTask: async (routineId, taskId) => {
    try {
      const completionId = Date.now().toString();
      
      // Create a date in UTC to avoid timezone issues
      const now = new Date();
      // Format the date to ISO string but explicitly handle timezone
      const completedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}Z`;

      await db.runAsync(
        'INSERT INTO task_completions (id, taskId, routineId, completedAt) VALUES (?, ?, ?, ?)',
        [completionId, taskId, routineId, completedAt]
      );

      return completionId;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  /**
   * Complete a task with a custom date
   */
  completeTaskWithDate: async (routineId, taskId, customDate) => {
    try {
      const completionId = Date.now().toString();
      
      // Format the date to ISO string
      const date = new Date(customDate);
      const completedAt = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}Z`;

      await db.runAsync(
        'INSERT INTO task_completions (id, taskId, routineId, completedAt) VALUES (?, ?, ?, ?)',
        [completionId, taskId, routineId, completedAt]
      );

      return completionId;
    } catch (error) {
      console.error('Error completing task with custom date:', error);
      throw error;
    }
  },

  /**
   * Get task history for a routine
   */
  getTaskHistory: async (routineId) => {
    try {
      const result = await db.getAllAsync(
        `SELECT tc.*, t.name as taskName
         FROM task_completions tc
         LEFT JOIN tasks t ON tc.taskId = t.id
         WHERE tc.routineId = ?
         ORDER BY tc.completedAt DESC`,
        [routineId]
      );

      let rows = [];
      for(const row of result){
        rows.push(row);
      }

      return rows;
    } catch (error) {
      console.error('Error getting task history:', error);
      throw error;
    }
  },

  /**
   * Get all task histories for calendar view
   */
  getAllTaskHistories: async () => {
    try {
      const result = await db.getAllAsync(
        `SELECT tc.*, t.name as taskName, r.name as routineName
         FROM task_completions tc
         LEFT JOIN tasks t ON tc.taskId = t.id
         LEFT JOIN routines r ON tc.routineId = r.id
         ORDER BY tc.completedAt DESC`,
        []
      );

      let rows = [];
      for(const row of result){
        rows.push(row);
      }

      return rows;
    } catch (error) {
      console.error('Error getting all task histories:', error);
      throw error;
    }
  },

  /**
   * Delete a task completion
   */
  deleteTaskCompletion: async (routineId, taskId, completedAt) => {
    try {
      const result = await db.runAsync(
        'DELETE FROM task_completions WHERE routineId = ? AND taskId = ? AND completedAt = ?',
        [routineId, taskId, completedAt]
      );

      return result.rowsAffected > 0;
    } catch (error) {
      console.error('Error deleting task completion:', error);
      throw error;
    }
  }
};

export default Database; 