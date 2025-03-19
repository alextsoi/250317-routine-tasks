import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Database from '../database/Database';
import theme, { commonStyles } from '../constants/theme';

const RoutineDetailScreen = ({ route, navigation }) => {
  const { routineId } = route.params;
  const [routine, setRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskHistory, setTaskHistory] = useState([]);

  const loadRoutine = async () => {
    try {
      setIsLoading(true);
      const data = await Database.getRoutine(routineId);
      if (data) {
        setRoutine(data);
        const history = await Database.getTaskHistory(routineId);
        setTaskHistory(history);
      } else {
        Alert.alert('Error', 'Routine not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading routine:', error);
      Alert.alert('Error', 'Failed to load routine details');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRoutine();
    }, [routineId])
  );

  const handleCompleteTask = async (taskId) => {
    try {
      await Database.completeTask(routineId, taskId);
      await loadRoutine(); // Reload to update task history
      Alert.alert('Success', 'Task completed!');
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleEditRoutine = () => {
    navigation.navigate('EditRoutine', { routineId, routine });
  };

  const handleDeleteRoutine = async () => {
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Database.deleteRoutine(routineId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting routine:', error);
              Alert.alert('Error', 'Failed to delete routine');
            }
          }
        }
      ]
    );
  };

  const handleShowTaskHistory = (taskId) => {
    const task = routine.tasks.find(t => t.id === taskId);
    if (task) {
      navigation.navigate('TaskHistory', {
        routineId,
        taskId,
        taskName: task.name
      });
    }
  };

  // Get task completions by taskId
  const getTaskCompletions = (taskId) => {
    return taskHistory.filter(item => item.taskId === taskId);
  };

  // Get the next task to complete (first task with no completions today)
  const getNextTask = () => {
    if (!routine?.tasks || routine.tasks.length === 0) return null;
    
    // Create date string in format YYYY-MM-DD without time zone influence
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    for (const task of routine.tasks) {
      const completions = getTaskCompletions(task.id);
      const completedToday = completions.some(completion => 
        completion.completedAt.substring(0, 10) === today
      );
      
      if (!completedToday) {
        return task;
      }
    }
    
    // If all tasks have been completed today, return the first task
    return routine.tasks[0];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const nextTask = getNextTask();

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Routine Header */}
        <View style={styles.routineHeader}>
          <View style={styles.routineInfo}>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.routineDescription}>
              {routine.description || 'No description'}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleEditRoutine}
            >
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDeleteRoutine}
            >
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Task Section */}
        {nextTask && (
          <View style={styles.nextTaskSection}>
            <Text style={styles.sectionTitle}>Next Task</Text>
            <View style={styles.nextTaskCard}>
              <View style={styles.taskContent}>
                <Text style={styles.taskName}>{nextTask.name}</Text>
                <Text style={styles.taskDescription}>
                  {nextTask.description || 'No description'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteTask(nextTask.id)}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* All Tasks Section */}
        <View style={styles.allTasksSection}>
          <Text style={styles.sectionTitle}>All Tasks</Text>
          {routine.tasks && routine.tasks.length > 0 ? (
            routine.tasks.map((task, index) => {
              const completions = getTaskCompletions(task.id);
              // Create date string in format YYYY-MM-DD without time zone influence
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0');
              const day = String(now.getDate()).padStart(2, '0');
              const today = `${year}-${month}-${day}`;
              
              const completedToday = completions.some(completion => 
                completion.completedAt.substring(0, 10) === today
              );

              return (
                <View key={task.id} style={styles.taskItem}>
                  <View style={styles.taskNumberContainer}>
                    <Text style={styles.taskNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.taskItemContent}>
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskItemName}>{task.name}</Text>
                      <Text style={styles.taskItemDescription}>
                        {task.description || 'No description'}
                      </Text>
                      {completions.length > 0 && (
                        <View style={styles.completionInfo}>
                          <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                          <Text style={styles.completionText}>
                            Completed {completions.length} {completions.length === 1 ? 'time' : 'times'}
                            {completedToday ? ', including today' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        style={[styles.taskButton, styles.completeTaskButton]}
                        onPress={() => handleCompleteTask(task.id)}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.taskButton, styles.historyButton]}
                        onPress={() => handleShowTaskHistory(task.id)}
                      >
                        <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyTasksContainer}>
              <Ionicons name="list-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyTasksText}>No tasks in this routine</Text>
              <Text style={styles.emptyTasksSubtext}>Tap the edit button to add tasks</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.md,
  },
  routineHeader: {
    ...commonStyles.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: theme.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  routineDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  nextTaskSection: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  nextTaskCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  taskContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  taskName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  taskDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  completeButtonText: {
    color: 'white',
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  allTasksSection: {
    marginTop: theme.spacing.lg,
  },
  taskItem: {
    ...commonStyles.card,
    flexDirection: 'row',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  taskNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  taskNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: theme.fontSize.sm,
  },
  taskItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskItemName: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  taskItemDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs,
  },
  taskActions: {
    flexDirection: 'row',
  },
  taskButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  completeTaskButton: {
    backgroundColor: theme.colors.primary,
  },
  historyButton: {
    backgroundColor: theme.colors.secondary,
  },
  emptyTasksContainer: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  emptyTasksText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyTasksSubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default RoutineDetailScreen; 